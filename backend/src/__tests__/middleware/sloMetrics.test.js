const {
  sloMetricsMiddleware,
  getSLOMetrics,
  getMetricsByEndpoint,
  getTimeSeriesMetrics,
  getSLOTargets,
  resetMetrics,
  SLO_TARGETS,
} = require('../../middleware/sloMetrics');

// Mock the database module
jest.mock('../../database/init', () => ({
  getDatabase: jest.fn(() => ({
    run: jest.fn((query, params, callback) => {
      if (callback) callback(null);
    }),
  })),
}));

// Mock the logger module
jest.mock('../../utils/logger', () => ({
  metricsLogger: {
    logLatencyMetrics: jest.fn(),
    logErrorMetrics: jest.fn(),
  },
  businessLogger: {
    logQualityGatesChecked: jest.fn(),
  },
}));

describe('SLO Metrics Middleware', () => {
  let mockReq;
  let mockRes;
  let nextFn;
  
  beforeEach(() => {
    resetMetrics();
    
    mockReq = {
      method: 'GET',
      path: '/api/clients',
      correlationId: 'test-correlation-id',
    };
    
    mockRes = {
      statusCode: 200,
      on: jest.fn(),
    };
    
    nextFn = jest.fn();
  });

  describe('sloMetricsMiddleware', () => {
    test('should skip health check endpoint', () => {
      mockReq.path = '/health';
      
      sloMetricsMiddleware(mockReq, mockRes, nextFn);
      
      expect(nextFn).toHaveBeenCalled();
      expect(mockRes.on).not.toHaveBeenCalled();
    });

    test('should register finish event handler for non-health endpoints', () => {
      sloMetricsMiddleware(mockReq, mockRes, nextFn);
      
      expect(nextFn).toHaveBeenCalled();
      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    test('should record metrics on response finish', () => {
      sloMetricsMiddleware(mockReq, mockRes, nextFn);
      
      // Get the finish handler and call it
      const finishHandler = mockRes.on.mock.calls[0][1];
      finishHandler();
      
      // Check that metrics were recorded
      const metrics = getSLOMetrics(60);
      expect(metrics.totalRequests).toBe(1);
    });

    test('should record error metrics for 4xx responses', () => {
      mockRes.statusCode = 404;
      
      sloMetricsMiddleware(mockReq, mockRes, nextFn);
      
      const finishHandler = mockRes.on.mock.calls[0][1];
      finishHandler();
      
      const metrics = getSLOMetrics(60);
      expect(metrics.errorRate.errorCount).toBe(1);
    });

    test('should record server error metrics for 5xx responses', () => {
      mockRes.statusCode = 500;
      
      sloMetricsMiddleware(mockReq, mockRes, nextFn);
      
      const finishHandler = mockRes.on.mock.calls[0][1];
      finishHandler();
      
      const metrics = getSLOMetrics(60);
      expect(metrics.availability.failureCount).toBe(1);
    });
  });

  describe('getSLOTargets', () => {
    test('should return SLO target configuration', () => {
      const targets = getSLOTargets();
      
      expect(targets).toHaveProperty('availability');
      expect(targets).toHaveProperty('latencyP50');
      expect(targets).toHaveProperty('latencyP95');
      expect(targets).toHaveProperty('latencyP99');
      expect(targets).toHaveProperty('errorRate');
      expect(targets).toHaveProperty('throughputMin');
      expect(targets.availability).toBe(99.9);
      expect(targets.latencyP95).toBe(500);
      expect(targets.errorRate).toBe(1.0);
    });
  });

  describe('getSLOMetrics', () => {
    test('should return default metrics when no requests recorded', () => {
      const metrics = getSLOMetrics(60);
      
      expect(metrics.timeWindow).toBe(60);
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.availability.current).toBe(100);
      expect(metrics.availability.status).toBe('healthy');
      expect(metrics.latency.p50.current).toBe(0);
      expect(metrics.latency.p95.current).toBe(0);
      expect(metrics.latency.p99.current).toBe(0);
      expect(metrics.errorRate.current).toBe(0);
      expect(metrics.qualityGates.passed).toBe(true);
    });

    test('should have correct structure for empty metrics', () => {
      const metrics = getSLOMetrics();
      
      expect(metrics).toHaveProperty('timeWindow');
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('availability');
      expect(metrics).toHaveProperty('latency');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('throughput');
      expect(metrics).toHaveProperty('qualityGates');
      expect(metrics).toHaveProperty('timestamp');
    });

    test('should have availability sub-properties', () => {
      const metrics = getSLOMetrics();
      
      expect(metrics.availability).toHaveProperty('current');
      expect(metrics.availability).toHaveProperty('target');
      expect(metrics.availability).toHaveProperty('status');
      expect(metrics.availability).toHaveProperty('successCount');
      expect(metrics.availability).toHaveProperty('failureCount');
    });

    test('should have latency sub-properties', () => {
      const metrics = getSLOMetrics();
      
      expect(metrics.latency).toHaveProperty('p50');
      expect(metrics.latency).toHaveProperty('p95');
      expect(metrics.latency).toHaveProperty('p99');
      expect(metrics.latency).toHaveProperty('average');
      expect(metrics.latency.p50).toHaveProperty('current');
      expect(metrics.latency.p50).toHaveProperty('target');
      expect(metrics.latency.p50).toHaveProperty('status');
    });

    test('should have errorRate sub-properties', () => {
      const metrics = getSLOMetrics();
      
      expect(metrics.errorRate).toHaveProperty('current');
      expect(metrics.errorRate).toHaveProperty('target');
      expect(metrics.errorRate).toHaveProperty('status');
      expect(metrics.errorRate).toHaveProperty('errorCount');
    });

    test('should have throughput sub-properties', () => {
      const metrics = getSLOMetrics();
      
      expect(metrics.throughput).toHaveProperty('requestsPerMinute');
      expect(metrics.throughput).toHaveProperty('target');
      expect(metrics.throughput).toHaveProperty('status');
    });

    test('should have qualityGates sub-properties', () => {
      const metrics = getSLOMetrics();
      
      expect(metrics.qualityGates).toHaveProperty('passed');
      expect(metrics.qualityGates).toHaveProperty('gates');
      expect(Array.isArray(metrics.qualityGates.gates)).toBe(true);
    });
  });

  describe('getMetricsByEndpoint', () => {
    test('should return empty array when no requests recorded', () => {
      const endpoints = getMetricsByEndpoint(60);
      
      expect(Array.isArray(endpoints)).toBe(true);
      expect(endpoints.length).toBe(0);
    });

    test('should return metrics grouped by endpoint', () => {
      // Simulate some requests
      sloMetricsMiddleware(mockReq, mockRes, nextFn);
      const finishHandler = mockRes.on.mock.calls[0][1];
      finishHandler();
      
      const endpoints = getMetricsByEndpoint(60);
      expect(endpoints.length).toBe(1);
      expect(endpoints[0].endpoint).toBe('GET /api/clients');
      expect(endpoints[0].totalRequests).toBe(1);
    });
  });

  describe('getTimeSeriesMetrics', () => {
    test('should return empty array when no requests recorded', () => {
      const timeSeries = getTimeSeriesMetrics(60, 5);
      
      expect(Array.isArray(timeSeries)).toBe(true);
      expect(timeSeries.length).toBe(0);
    });

    test('should return time series data with requests', () => {
      // Simulate some requests
      sloMetricsMiddleware(mockReq, mockRes, nextFn);
      const finishHandler = mockRes.on.mock.calls[0][1];
      finishHandler();
      
      const timeSeries = getTimeSeriesMetrics(60, 5);
      expect(timeSeries.length).toBeGreaterThan(0);
      expect(timeSeries[0]).toHaveProperty('timestamp');
      expect(timeSeries[0]).toHaveProperty('requests');
      expect(timeSeries[0]).toHaveProperty('errorRate');
      expect(timeSeries[0]).toHaveProperty('avgLatency');
    });
  });

  describe('SLO_TARGETS constant', () => {
    test('should have all required target values', () => {
      expect(SLO_TARGETS.availability).toBe(99.9);
      expect(SLO_TARGETS.latencyP50).toBe(100);
      expect(SLO_TARGETS.latencyP95).toBe(500);
      expect(SLO_TARGETS.latencyP99).toBe(1000);
      expect(SLO_TARGETS.errorRate).toBe(1.0);
      expect(SLO_TARGETS.throughputMin).toBe(10);
    });
  });

  describe('resetMetrics', () => {
    test('should clear all metrics', () => {
      // Get initial metrics
      const initialMetrics = getSLOMetrics();
      expect(initialMetrics.totalRequests).toBe(0);
      
      // Reset and verify
      resetMetrics();
      const afterReset = getSLOMetrics();
      expect(afterReset.totalRequests).toBe(0);
    });
  });
});
