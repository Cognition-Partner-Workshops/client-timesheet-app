const request = require('supertest');
const express = require('express');
const workEntryRoutes = require('../../routes/workEntries');
const { getDatabase } = require('../../database/init');

jest.mock('../../database/init');
jest.mock('../../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    req.userEmail = 'test@example.com';
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/api/work-entries', workEntryRoutes);
app.use((err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({ error: 'Validation error', details: err.details.map(d => d.message) });
  }
  res.status(500).json({ error: 'Internal server error' });
});

describe('Work Entry Routes - Comprehensive Coverage', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn(),
      run: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('POST /api/work-entries - Try-Catch Error Handling', () => {
    test('should handle unexpected throw in POST handler', async () => {
      getDatabase.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .post('/api/work-entries')
        .send({ clientId: 1, hours: 5, date: '2024-01-15' });

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/work-entries/:id - Try-Catch Error Handling', () => {
    test('should handle unexpected throw in PUT handler', async () => {
      getDatabase.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .put('/api/work-entries/1')
        .send({ hours: 8 });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/work-entries - Extended Filtering', () => {
    test('should return entries without clientId filter', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(params).toEqual(['test@example.com']);
        expect(query).not.toContain('AND we.client_id = ?');
        callback(null, []);
      });

      const response = await request(app).get('/api/work-entries');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ workEntries: [] });
    });

    test('should filter by valid numeric clientId', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(params).toEqual(['test@example.com', 5]);
        expect(query).toContain('AND we.client_id = ?');
        callback(null, []);
      });

      const response = await request(app).get('/api/work-entries?clientId=5');

      expect(response.status).toBe(200);
    });

    test('should return 400 for non-numeric clientId query param', async () => {
      const response = await request(app).get('/api/work-entries?clientId=abc');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid client ID' });
    });

    test('should order results by date DESC then created_at DESC', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(query).toContain('ORDER BY we.date DESC, we.created_at DESC');
        callback(null, []);
      });

      await request(app).get('/api/work-entries');
    });

    test('should join with clients table for client name', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(query).toContain('JOIN clients c ON we.client_id = c.id');
        expect(query).toContain('c.name as client_name');
        callback(null, []);
      });

      await request(app).get('/api/work-entries');
    });
  });

  describe('POST /api/work-entries - Extended Validation', () => {
    test('should reject zero hours', async () => {
      const response = await request(app)
        .post('/api/work-entries')
        .send({ clientId: 1, hours: 0, date: '2024-01-15' });

      expect(response.status).toBe(400);
    });

    test('should accept exactly 24 hours', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('clients')) {
          callback(null, { id: 1 });
        } else {
          callback(null, { id: 1, client_id: 1, hours: 24, client_name: 'Client' });
        }
      });

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/work-entries')
        .send({ clientId: 1, hours: 24, date: '2024-01-15' });

      expect(response.status).toBe(201);
    });

    test('should accept minimum valid hours (0.01)', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('clients')) {
          callback(null, { id: 1 });
        } else {
          callback(null, { id: 1, client_id: 1, hours: 0.01, client_name: 'Client' });
        }
      });

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/work-entries')
        .send({ clientId: 1, hours: 0.01, date: '2024-01-15' });

      expect(response.status).toBe(201);
    });

    test('should reject invalid date format MM/DD/YYYY', async () => {
      const response = await request(app)
        .post('/api/work-entries')
        .send({ clientId: 1, hours: 5, date: '01/15/2024' });

      expect(response.status).toBe(400);
    });

    test('should reject non-integer clientId', async () => {
      const response = await request(app)
        .post('/api/work-entries')
        .send({ clientId: 1.5, hours: 5, date: '2024-01-15' });

      expect(response.status).toBe(400);
    });

    test('should accept entry without description', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('clients')) {
          callback(null, { id: 1 });
        } else {
          callback(null, { id: 1, client_id: 1, hours: 5, description: null, client_name: 'Client' });
        }
      });

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/work-entries')
        .send({ clientId: 1, hours: 5, date: '2024-01-15' });

      expect(response.status).toBe(201);
    });

    test('should reject description longer than 1000 characters', async () => {
      const response = await request(app)
        .post('/api/work-entries')
        .send({ clientId: 1, hours: 5, description: 'a'.repeat(1001), date: '2024-01-15' });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/work-entries/:id - Extended', () => {
    test('should return 400 for non-numeric work entry ID', async () => {
      const response = await request(app)
        .put('/api/work-entries/abc')
        .send({ hours: 8 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid work entry ID' });
    });

    test('should reject hours exceeding 24 in update', async () => {
      const response = await request(app)
        .put('/api/work-entries/1')
        .send({ hours: 25 });

      expect(response.status).toBe(400);
    });

    test('should reject negative hours in update', async () => {
      const response = await request(app)
        .put('/api/work-entries/1')
        .send({ hours: -1 });

      expect(response.status).toBe(400);
    });

    test('should reject zero hours in update', async () => {
      const response = await request(app)
        .put('/api/work-entries/1')
        .send({ hours: 0 });

      expect(response.status).toBe(400);
    });

    test('should reject invalid date format in update', async () => {
      const response = await request(app)
        .put('/api/work-entries/1')
        .send({ date: '01-15-2024' });

      expect(response.status).toBe(400);
    });

    test('should update includes updated_at timestamp', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('work_entries we')) {
          callback(null, { id: 1, hours: 8, client_name: 'Client' });
        } else {
          callback(null, { id: 1 });
        }
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        expect(query).toContain('updated_at = CURRENT_TIMESTAMP');
        callback(null);
      });

      const response = await request(app)
        .put('/api/work-entries/1')
        .send({ hours: 8 });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/work-entries/:id - Extended', () => {
    test('should return 400 for non-numeric work entry ID', async () => {
      const response = await request(app).delete('/api/work-entries/abc');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid work entry ID' });
    });

    test('should verify ownership before deleting', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        expect(query).toContain('user_email = ?');
        expect(params).toContain('test@example.com');
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        expect(query).toContain('user_email = ?');
        expect(params).toContain('test@example.com');
        callback(null);
      });

      const response = await request(app).delete('/api/work-entries/1');
      expect(response.status).toBe(200);
    });
  });

  describe('Data Isolation', () => {
    test('should filter all GET queries by user email', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(query).toContain('user_email = ?');
        expect(params[0]).toBe('test@example.com');
        callback(null, []);
      });

      await request(app).get('/api/work-entries');
      expect(mockDb.all).toHaveBeenCalled();
    });

    test('should filter GET by ID queries by user email', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        expect(query).toContain('user_email = ?');
        expect(params).toContain('test@example.com');
        callback(null, { id: 1, client_id: 1, hours: 5, client_name: 'Client' });
      });

      await request(app).get('/api/work-entries/1');
      expect(mockDb.get).toHaveBeenCalled();
    });

    test('should verify client ownership in POST', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('clients')) {
          expect(params).toContain('test@example.com');
          callback(null, { id: 1 });
        } else {
          callback(null, { id: 1, client_id: 1, hours: 5, client_name: 'Client' });
        }
      });

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      await request(app)
        .post('/api/work-entries')
        .send({ clientId: 1, hours: 5, date: '2024-01-15' });
    });
  });
});
