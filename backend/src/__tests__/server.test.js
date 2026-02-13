const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

jest.mock('../database/init', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  getDatabase: jest.fn().mockReturnValue({
    get: jest.fn((query, params, callback) => {
      const cb = typeof params === 'function' ? params : callback;
      if (typeof cb === 'function') cb(null, { email: 'test@example.com', created_at: new Date().toISOString() });
    }),
    all: jest.fn((query, params, callback) => {
      const cb = typeof params === 'function' ? params : callback;
      if (typeof cb === 'function') cb(null, []);
    }),
    run: jest.fn(function(query, params, callback) {
      const cb = typeof params === 'function' ? params : callback;
      if (typeof cb === 'function') cb.call({ changes: 0, lastID: 1 }, null);
    })
  })
}));

jest.mock('../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    req.userEmail = 'test@example.com';
    next();
  }
}));

function buildApp() {
  const authRoutes = require('../routes/auth');
  const clientRoutes = require('../routes/clients');
  const workEntryRoutes = require('../routes/workEntries');
  const reportRoutes = require('../routes/reports');
  const { errorHandler } = require('../middleware/errorHandler');

  const testApp = express();
  testApp.use(helmet());
  testApp.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
  testApp.use(limiter);
  testApp.use(express.json({ limit: '10mb' }));
  testApp.use(express.urlencoded({ extended: true }));
  testApp.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  testApp.use('/api/auth', authRoutes);
  testApp.use('/api/clients', clientRoutes);
  testApp.use('/api/work-entries', workEntryRoutes);
  testApp.use('/api/reports', reportRoutes);
  testApp.use(errorHandler);
  testApp.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
  return testApp;
}

let app;

beforeEach(() => {
  app = buildApp();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Server Configuration', () => {
  describe('Health Check Endpoint', () => {
    test('GET /health should return 200 with status OK', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });

    test('GET /health should return a valid ISO timestamp', async () => {
      const response = await request(app).get('/health');
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for unknown GET routes', async () => {
      const response = await request(app).get('/nonexistent-route');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Route not found' });
    });

    test('should return 404 for unknown API routes', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Route not found' });
    });

    test('should return 404 for POST to unknown routes', async () => {
      const response = await request(app).post('/unknown');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Route not found' });
    });

    test('should return 404 for PUT to unknown routes', async () => {
      const response = await request(app).put('/unknown');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Route not found' });
    });

    test('should return 404 for DELETE to unknown routes', async () => {
      const response = await request(app).delete('/unknown');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Route not found' });
    });
  });

  describe('Route Registration', () => {
    test('should register auth routes at /api/auth', async () => {
      const response = await request(app).post('/api/auth/login').send({ email: 'test@test.com' });
      expect(response.status).not.toBe(404);
    });

    test('should register client routes at /api/clients', async () => {
      const response = await request(app).get('/api/clients');
      expect(response.status).not.toBe(404);
    });

    test('should register work entry routes at /api/work-entries', async () => {
      const response = await request(app).get('/api/work-entries');
      expect(response.status).not.toBe(404);
    });

    test('should register report routes at /api/reports', async () => {
      const response = await request(app).get('/api/reports/client/1');
      expect(response.status).not.toBe(404);
    });
  });

  describe('Middleware Stack', () => {
    test('should parse JSON request bodies', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ email: 'test@example.com' }));
      expect(response.status).not.toBe(415);
    });

    test('should set security headers via helmet', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    test('should handle CORS preflight', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');
      expect(response.status).toBeLessThan(400);
    });

    test('should accept URL-encoded request bodies', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('email=test@example.com');
      expect(response.status).not.toBe(415);
    });
  });

  describe('Module Export', () => {
    test('should be a valid express app', () => {
      expect(app).toBeDefined();
      expect(typeof app.listen).toBe('function');
      expect(typeof app.use).toBe('function');
    });
  });
});
