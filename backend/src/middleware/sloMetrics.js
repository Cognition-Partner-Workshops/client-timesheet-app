const { getDatabase } = require('../database/init');

// In-memory metrics store for real-time calculations
const metricsStore = {
  requests: [],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// SLO Targets Configuration
const SLO_TARGETS = {
  availability: 99.9, // 99.9% availability target
  latencyP50: 100, // 100ms p50 latency target
  latencyP95: 500, // 500ms p95 latency target
  latencyP99: 1000, // 1000ms p99 latency target
  errorRate: 1.0, // 1% error rate target (max)
  throughputMin: 10, // Minimum 10 requests per minute
};

// Clean old metrics from in-memory store
function cleanOldMetrics() {
  const cutoff = Date.now() - metricsStore.maxAge;
  metricsStore.requests = metricsStore.requests.filter(r => r.timestamp > cutoff);
}

// Calculate percentile from sorted array
function calculatePercentile(sortedArray, percentile) {
  if (sortedArray.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)];
}

// SLO Metrics Collection Middleware
function sloMetricsMiddleware(req, res, next) {
  const startTime = Date.now();
  const endpoint = `${req.method} ${req.path}`;
  
  // Skip health check endpoint from metrics
  if (req.path === '/health') {
    return next();
  }

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;
    const isServerError = statusCode >= 500;

    // Store metric in memory
    const metric = {
      timestamp: Date.now(),
      endpoint,
      method: req.method,
      path: req.path,
      statusCode,
      duration,
      isError,
      isServerError,
    };

    metricsStore.requests.push(metric);

    // Periodically clean old metrics
    if (metricsStore.requests.length % 100 === 0) {
      cleanOldMetrics();
    }

    // Store in database for persistence
    persistMetric(metric);
  });

  next();
}

// Persist metric to database
async function persistMetric(metric) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO slo_metrics (timestamp, endpoint, method, path, status_code, duration_ms, is_error, is_server_error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        new Date(metric.timestamp).toISOString(),
        metric.endpoint,
        metric.method,
        metric.path,
        metric.statusCode,
        metric.duration,
        metric.isError ? 1 : 0,
        metric.isServerError ? 1 : 0,
      ],
      (err) => {
        if (err) {
          console.error('Error persisting SLO metric:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

// Get SLO metrics summary
function getSLOMetrics(timeWindowMinutes = 60) {
  cleanOldMetrics();
  
  const cutoff = Date.now() - (timeWindowMinutes * 60 * 1000);
  const recentRequests = metricsStore.requests.filter(r => r.timestamp > cutoff);
  
  if (recentRequests.length === 0) {
    return {
      timeWindow: timeWindowMinutes,
      totalRequests: 0,
      availability: {
        current: 100,
        target: SLO_TARGETS.availability,
        status: 'healthy',
        successCount: 0,
        failureCount: 0,
      },
      latency: {
        p50: { current: 0, target: SLO_TARGETS.latencyP50, status: 'healthy' },
        p95: { current: 0, target: SLO_TARGETS.latencyP95, status: 'healthy' },
        p99: { current: 0, target: SLO_TARGETS.latencyP99, status: 'healthy' },
        average: 0,
      },
      errorRate: {
        current: 0,
        target: SLO_TARGETS.errorRate,
        status: 'healthy',
        errorCount: 0,
      },
      throughput: {
        requestsPerMinute: 0,
        target: SLO_TARGETS.throughputMin,
        status: 'warning',
      },
      qualityGates: {
        passed: true,
        gates: [],
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Calculate metrics
  const totalRequests = recentRequests.length;
  const serverErrors = recentRequests.filter(r => r.isServerError).length;
  const allErrors = recentRequests.filter(r => r.isError).length;
  const successfulRequests = totalRequests - serverErrors;
  
  // Availability (based on non-5xx responses)
  const availability = (successfulRequests / totalRequests) * 100;
  
  // Latency percentiles
  const durations = recentRequests.map(r => r.duration).sort((a, b) => a - b);
  const p50 = calculatePercentile(durations, 50);
  const p95 = calculatePercentile(durations, 95);
  const p99 = calculatePercentile(durations, 99);
  const avgLatency = durations.reduce((a, b) => a + b, 0) / durations.length;
  
  // Error rate
  const errorRate = (allErrors / totalRequests) * 100;
  
  // Throughput
  const requestsPerMinute = totalRequests / timeWindowMinutes;

  // Determine status for each metric
  const getStatus = (current, target, isLowerBetter = false) => {
    if (isLowerBetter) {
      if (current <= target) return 'healthy';
      if (current <= target * 1.5) return 'warning';
      return 'critical';
    } else {
      if (current >= target) return 'healthy';
      if (current >= target * 0.95) return 'warning';
      return 'critical';
    }
  };

  // Quality Gates
  const gates = [
    {
      name: 'Availability',
      passed: availability >= SLO_TARGETS.availability,
      current: availability.toFixed(2),
      target: SLO_TARGETS.availability,
      unit: '%',
    },
    {
      name: 'Latency P95',
      passed: p95 <= SLO_TARGETS.latencyP95,
      current: p95.toFixed(0),
      target: SLO_TARGETS.latencyP95,
      unit: 'ms',
    },
    {
      name: 'Error Rate',
      passed: errorRate <= SLO_TARGETS.errorRate,
      current: errorRate.toFixed(2),
      target: SLO_TARGETS.errorRate,
      unit: '%',
    },
  ];

  const allGatesPassed = gates.every(g => g.passed);

  return {
    timeWindow: timeWindowMinutes,
    totalRequests,
    availability: {
      current: parseFloat(availability.toFixed(2)),
      target: SLO_TARGETS.availability,
      status: getStatus(availability, SLO_TARGETS.availability),
      successCount: successfulRequests,
      failureCount: serverErrors,
    },
    latency: {
      p50: {
        current: parseFloat(p50.toFixed(0)),
        target: SLO_TARGETS.latencyP50,
        status: getStatus(p50, SLO_TARGETS.latencyP50, true),
      },
      p95: {
        current: parseFloat(p95.toFixed(0)),
        target: SLO_TARGETS.latencyP95,
        status: getStatus(p95, SLO_TARGETS.latencyP95, true),
      },
      p99: {
        current: parseFloat(p99.toFixed(0)),
        target: SLO_TARGETS.latencyP99,
        status: getStatus(p99, SLO_TARGETS.latencyP99, true),
      },
      average: parseFloat(avgLatency.toFixed(0)),
    },
    errorRate: {
      current: parseFloat(errorRate.toFixed(2)),
      target: SLO_TARGETS.errorRate,
      status: getStatus(errorRate, SLO_TARGETS.errorRate, true),
      errorCount: allErrors,
    },
    throughput: {
      requestsPerMinute: parseFloat(requestsPerMinute.toFixed(2)),
      target: SLO_TARGETS.throughputMin,
      status: getStatus(requestsPerMinute, SLO_TARGETS.throughputMin),
    },
    qualityGates: {
      passed: allGatesPassed,
      gates,
    },
    timestamp: new Date().toISOString(),
  };
}

// Get metrics by endpoint
function getMetricsByEndpoint(timeWindowMinutes = 60) {
  cleanOldMetrics();
  
  const cutoff = Date.now() - (timeWindowMinutes * 60 * 1000);
  const recentRequests = metricsStore.requests.filter(r => r.timestamp > cutoff);
  
  const endpointMetrics = {};
  
  recentRequests.forEach(req => {
    if (!endpointMetrics[req.endpoint]) {
      endpointMetrics[req.endpoint] = {
        endpoint: req.endpoint,
        totalRequests: 0,
        errors: 0,
        durations: [],
      };
    }
    
    endpointMetrics[req.endpoint].totalRequests++;
    if (req.isError) endpointMetrics[req.endpoint].errors++;
    endpointMetrics[req.endpoint].durations.push(req.duration);
  });

  return Object.values(endpointMetrics).map(ep => {
    const sortedDurations = ep.durations.sort((a, b) => a - b);
    return {
      endpoint: ep.endpoint,
      totalRequests: ep.totalRequests,
      errorRate: parseFloat(((ep.errors / ep.totalRequests) * 100).toFixed(2)),
      avgLatency: parseFloat((ep.durations.reduce((a, b) => a + b, 0) / ep.durations.length).toFixed(0)),
      p95Latency: parseFloat(calculatePercentile(sortedDurations, 95).toFixed(0)),
    };
  }).sort((a, b) => b.totalRequests - a.totalRequests);
}

// Get time series data for charts
function getTimeSeriesMetrics(timeWindowMinutes = 60, bucketSizeMinutes = 5) {
  cleanOldMetrics();
  
  const cutoff = Date.now() - (timeWindowMinutes * 60 * 1000);
  const recentRequests = metricsStore.requests.filter(r => r.timestamp > cutoff);
  
  const buckets = {};
  const bucketSize = bucketSizeMinutes * 60 * 1000;
  
  recentRequests.forEach(req => {
    const bucketKey = Math.floor(req.timestamp / bucketSize) * bucketSize;
    
    if (!buckets[bucketKey]) {
      buckets[bucketKey] = {
        timestamp: new Date(bucketKey).toISOString(),
        requests: 0,
        errors: 0,
        durations: [],
      };
    }
    
    buckets[bucketKey].requests++;
    if (req.isError) buckets[bucketKey].errors++;
    buckets[bucketKey].durations.push(req.duration);
  });

  return Object.values(buckets)
    .map(bucket => ({
      timestamp: bucket.timestamp,
      requests: bucket.requests,
      errorRate: bucket.requests > 0 ? parseFloat(((bucket.errors / bucket.requests) * 100).toFixed(2)) : 0,
      avgLatency: bucket.durations.length > 0 
        ? parseFloat((bucket.durations.reduce((a, b) => a + b, 0) / bucket.durations.length).toFixed(0))
        : 0,
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Get SLO targets configuration
function getSLOTargets() {
  return { ...SLO_TARGETS };
}

// Reset metrics (for testing)
function resetMetrics() {
  metricsStore.requests = [];
}

module.exports = {
  sloMetricsMiddleware,
  getSLOMetrics,
  getMetricsByEndpoint,
  getTimeSeriesMetrics,
  getSLOTargets,
  resetMetrics,
  SLO_TARGETS,
};
