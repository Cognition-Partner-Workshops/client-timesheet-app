const express = require('express');
const router = express.Router();
const {
  getSLOMetrics,
  getMetricsByEndpoint,
  getTimeSeriesMetrics,
  getSLOTargets,
} = require('../middleware/sloMetrics');
const { businessLogger } = require('../utils/logger');

// GET /api/slo/metrics - Get overall SLO metrics summary
router.get('/metrics', (req, res) => {
  try {
    const timeWindow = parseInt(req.query.timeWindow) || 60; // Default 60 minutes
    const metrics = getSLOMetrics(timeWindow);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching SLO metrics:', error);
    res.status(500).json({ error: 'Failed to fetch SLO metrics' });
  }
});

// GET /api/slo/endpoints - Get metrics broken down by endpoint
router.get('/endpoints', (req, res) => {
  try {
    const timeWindow = parseInt(req.query.timeWindow) || 60;
    const endpointMetrics = getMetricsByEndpoint(timeWindow);
    res.json({ endpoints: endpointMetrics });
  } catch (error) {
    console.error('Error fetching endpoint metrics:', error);
    res.status(500).json({ error: 'Failed to fetch endpoint metrics' });
  }
});

// GET /api/slo/timeseries - Get time series data for charts
router.get('/timeseries', (req, res) => {
  try {
    const timeWindow = parseInt(req.query.timeWindow) || 60;
    const bucketSize = parseInt(req.query.bucketSize) || 5; // Default 5 minute buckets
    const timeSeries = getTimeSeriesMetrics(timeWindow, bucketSize);
    res.json({ timeSeries });
  } catch (error) {
    console.error('Error fetching time series metrics:', error);
    res.status(500).json({ error: 'Failed to fetch time series metrics' });
  }
});

// GET /api/slo/targets - Get SLO target configuration
router.get('/targets', (req, res) => {
  try {
    const targets = getSLOTargets();
    res.json({ targets });
  } catch (error) {
    console.error('Error fetching SLO targets:', error);
    res.status(500).json({ error: 'Failed to fetch SLO targets' });
  }
});

// GET /api/slo/quality-gates - Get quality gates status
router.get('/quality-gates', (req, res) => {
  try {
    const timeWindow = parseInt(req.query.timeWindow) || 60;
    const metrics = getSLOMetrics(timeWindow);
    
    // Log quality gate status
    businessLogger.logQualityGatesChecked(
      metrics.qualityGates.passed,
      metrics.qualityGates.gates,
      req.correlationId
    );
    
    res.json({
      passed: metrics.qualityGates.passed,
      gates: metrics.qualityGates.gates,
      timestamp: metrics.timestamp,
      timeWindow,
    });
  } catch (error) {
    console.error('Error fetching quality gates:', error);
    res.status(500).json({ error: 'Failed to fetch quality gates' });
  }
});

module.exports = router;
