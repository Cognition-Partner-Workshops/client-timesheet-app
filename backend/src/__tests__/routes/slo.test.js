const request = require('supertest');
const express = require('express');
const sloRoutes = require('../../routes/slo');

// Mock the sloMetrics middleware
jest.mock('../../middleware/sloMetrics', () => ({
  getSLOMetrics: jest.fn(() => ({
    timeWindow: 60,
    totalRequests: 100,
    availability: {
      current: 99.5,
      target: 99.9,
      status: 'warning',
      successCount: 99,
      failureCount: 1,
    },
    latency: {
      p50: { current: 50, target: 100, status: 'healthy' },
      p95: { current: 200, target: 500, status: 'healthy' },
      p99: { current: 500, target: 1000, status: 'healthy' },
      average: 75,
    },
    errorRate: {
      current: 0.5,
      target: 1.0,
      status: 'healthy',
      errorCount: 5,
    },
    throughput: {
      requestsPerMinute: 1.67,
      target: 10,
      status: 'warning',
    },
    qualityGates: {
      passed: true,
      gates: [
        { name: 'Availability', passed: true, current: '99.5', target: 99.9, unit: '%' },
        { name: 'Latency P95', passed: true, current: '200', target: 500, unit: 'ms' },
        { name: 'Error Rate', passed: true, current: '0.5', target: 1.0, unit: '%' },
      ],
    },
    timestamp: '2024-01-01T00:00:00.000Z',
  })),
  getMetricsByEndpoint: jest.fn(() => [
    { endpoint: 'GET /api/clients', totalRequests: 50, errorRate: 0, avgLatency: 45, p95Latency: 100 },
    { endpoint: 'POST /api/work-entries', totalRequests: 30, errorRate: 1.5, avgLatency: 80, p95Latency: 200 },
  ]),
  getTimeSeriesMetrics: jest.fn(() => [
    { timestamp: '2024-01-01T00:00:00.000Z', requests: 10, errorRate: 0, avgLatency: 50 },
    { timestamp: '2024-01-01T00:05:00.000Z', requests: 15, errorRate: 0.5, avgLatency: 60 },
  ]),
  getSLOTargets: jest.fn(() => ({
    availability: 99.9,
    latencyP50: 100,
    latencyP95: 500,
    latencyP99: 1000,
    errorRate: 1.0,
    throughputMin: 10,
  })),
}));

const app = express();
app.use(express.json());
app.use('/api/slo', sloRoutes);

describe('SLO Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/slo/metrics', () => {
    test('should return SLO metrics summary', async () => {
      const response = await request(app).get('/api/slo/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('timeWindow');
      expect(response.body).toHaveProperty('totalRequests');
      expect(response.body).toHaveProperty('availability');
      expect(response.body).toHaveProperty('latency');
      expect(response.body).toHaveProperty('errorRate');
      expect(response.body).toHaveProperty('throughput');
      expect(response.body).toHaveProperty('qualityGates');
    });

    test('should accept timeWindow query parameter', async () => {
      const { getSLOMetrics } = require('../../middleware/sloMetrics');
      
      await request(app).get('/api/slo/metrics?timeWindow=30');

      expect(getSLOMetrics).toHaveBeenCalledWith(30);
    });

    test('should use default timeWindow when not provided', async () => {
      const { getSLOMetrics } = require('../../middleware/sloMetrics');
      
      await request(app).get('/api/slo/metrics');

      expect(getSLOMetrics).toHaveBeenCalledWith(60);
    });
  });

  describe('GET /api/slo/endpoints', () => {
    test('should return endpoint metrics', async () => {
      const response = await request(app).get('/api/slo/endpoints');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('endpoints');
      expect(Array.isArray(response.body.endpoints)).toBe(true);
      expect(response.body.endpoints.length).toBe(2);
    });

    test('should accept timeWindow query parameter', async () => {
      const { getMetricsByEndpoint } = require('../../middleware/sloMetrics');
      
      await request(app).get('/api/slo/endpoints?timeWindow=120');

      expect(getMetricsByEndpoint).toHaveBeenCalledWith(120);
    });
  });

  describe('GET /api/slo/timeseries', () => {
    test('should return time series data', async () => {
      const response = await request(app).get('/api/slo/timeseries');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('timeSeries');
      expect(Array.isArray(response.body.timeSeries)).toBe(true);
    });

    test('should accept timeWindow and bucketSize query parameters', async () => {
      const { getTimeSeriesMetrics } = require('../../middleware/sloMetrics');
      
      await request(app).get('/api/slo/timeseries?timeWindow=120&bucketSize=10');

      expect(getTimeSeriesMetrics).toHaveBeenCalledWith(120, 10);
    });
  });

  describe('GET /api/slo/targets', () => {
    test('should return SLO targets configuration', async () => {
      const response = await request(app).get('/api/slo/targets');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('targets');
      expect(response.body.targets).toHaveProperty('availability');
      expect(response.body.targets).toHaveProperty('latencyP50');
      expect(response.body.targets).toHaveProperty('latencyP95');
      expect(response.body.targets).toHaveProperty('latencyP99');
      expect(response.body.targets).toHaveProperty('errorRate');
      expect(response.body.targets).toHaveProperty('throughputMin');
    });
  });

  describe('GET /api/slo/quality-gates', () => {
    test('should return quality gates status', async () => {
      const response = await request(app).get('/api/slo/quality-gates');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('passed');
      expect(response.body).toHaveProperty('gates');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('timeWindow');
    });

    test('should accept timeWindow query parameter', async () => {
      const { getSLOMetrics } = require('../../middleware/sloMetrics');
      
      await request(app).get('/api/slo/quality-gates?timeWindow=180');

      expect(getSLOMetrics).toHaveBeenCalledWith(180);
    });

    test('should return gates array with correct structure', async () => {
      const response = await request(app).get('/api/slo/quality-gates');

      expect(Array.isArray(response.body.gates)).toBe(true);
      response.body.gates.forEach(gate => {
        expect(gate).toHaveProperty('name');
        expect(gate).toHaveProperty('passed');
        expect(gate).toHaveProperty('current');
        expect(gate).toHaveProperty('target');
        expect(gate).toHaveProperty('unit');
      });
    });
  });
});
