const request = require('supertest');
const express = require('express');
const createtmsRoutes = require('../../routes/createtms');
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
app.use('/api/createtms', createtmsRoutes);
app.use((err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({ error: 'Validation error' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

describe('Createtms Routes', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn(),
      run: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/createtms', () => {
    test('should create new timesheet entry with valid data', async () => {
      const newEntry = { clientId: 1, hours: 8, description: 'Work done', date: '2024-01-15' };
      const createdEntry = { 
        id: 1, 
        client_id: 1, 
        hours: 8, 
        description: 'Work done', 
        date: '2024-01-15',
        client_name: 'Test Client',
        created_at: '2024-01-15',
        updated_at: '2024-01-15'
      };

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, createdEntry);
      });

      const response = await request(app)
        .post('/api/createtms')
        .send(newEntry);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Timesheet entry created successfully');
      expect(response.body.entry).toEqual(createdEntry);
    });

    test('should create entry without description', async () => {
      const newEntry = { clientId: 1, hours: 4, date: '2024-01-15' };
      const createdEntry = { 
        id: 1, 
        client_id: 1, 
        hours: 4, 
        description: null, 
        date: '2024-01-15',
        client_name: 'Test Client'
      };

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, createdEntry);
      });

      const response = await request(app)
        .post('/api/createtms')
        .send(newEntry);

      expect(response.status).toBe(201);
    });

    test('should return 400 for missing clientId', async () => {
      const response = await request(app)
        .post('/api/createtms')
        .send({ hours: 8, date: '2024-01-15' });

      expect(response.status).toBe(400);
    });

    test('should return 400 for missing hours', async () => {
      const response = await request(app)
        .post('/api/createtms')
        .send({ clientId: 1, date: '2024-01-15' });

      expect(response.status).toBe(400);
    });

    test('should return 400 for missing date', async () => {
      const response = await request(app)
        .post('/api/createtms')
        .send({ clientId: 1, hours: 8 });

      expect(response.status).toBe(400);
    });

    test('should return 400 for hours exceeding 24', async () => {
      const response = await request(app)
        .post('/api/createtms')
        .send({ clientId: 1, hours: 25, date: '2024-01-15' });

      expect(response.status).toBe(400);
    });

    test('should return 400 for negative hours', async () => {
      const response = await request(app)
        .post('/api/createtms')
        .send({ clientId: 1, hours: -5, date: '2024-01-15' });

      expect(response.status).toBe(400);
    });

    test('should return 404 if client not found', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .post('/api/createtms')
        .send({ clientId: 999, hours: 8, date: '2024-01-15' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Client not found' });
    });

    test('should handle database error when checking client', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .post('/api/createtms')
        .send({ clientId: 1, hours: 8, date: '2024-01-15' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should handle database error during insert', async () => {
      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('Insert failed'));
      });

      const response = await request(app)
        .post('/api/createtms')
        .send({ clientId: 1, hours: 8, date: '2024-01-15' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to create timesheet entry' });
    });

    test('should handle error retrieving entry after creation', async () => {
      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Retrieval failed'), null);
      });

      const response = await request(app)
        .post('/api/createtms')
        .send({ clientId: 1, hours: 8, date: '2024-01-15' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Timesheet entry created but failed to retrieve' });
    });
  });

  describe('GET /api/createtms', () => {
    test('should return all timesheet entries for authenticated user', async () => {
      const mockEntries = [
        { id: 1, client_id: 1, hours: 8, description: 'Work', date: '2024-01-15', client_name: 'Client A' },
        { id: 2, client_id: 2, hours: 4, description: 'Meeting', date: '2024-01-14', client_name: 'Client B' }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockEntries);
      });

      const response = await request(app).get('/api/createtms');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ entries: mockEntries });
    });

    test('should return empty array when no entries exist', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const response = await request(app).get('/api/createtms');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ entries: [] });
    });

    test('should filter entries by clientId', async () => {
      const mockEntries = [
        { id: 1, client_id: 1, hours: 8, description: 'Work', date: '2024-01-15', client_name: 'Client A' }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockEntries);
      });

      const response = await request(app).get('/api/createtms?clientId=1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ entries: mockEntries });
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('AND we.client_id = ?'),
        ['test@example.com', 1],
        expect.any(Function)
      );
    });

    test('should handle database error', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/createtms');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/createtms/:id', () => {
    test('should return specific timesheet entry', async () => {
      const mockEntry = { 
        id: 1, 
        client_id: 1, 
        hours: 8, 
        description: 'Work', 
        date: '2024-01-15',
        client_name: 'Client A'
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockEntry);
      });

      const response = await request(app).get('/api/createtms/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ entry: mockEntry });
    });

    test('should return 404 if entry not found', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).get('/api/createtms/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Timesheet entry not found' });
    });

    test('should return 400 for invalid entry ID', async () => {
      const response = await request(app).get('/api/createtms/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid entry ID' });
    });

    test('should handle database error', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/createtms/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('DELETE /api/createtms/:id', () => {
    test('should delete existing timesheet entry', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      const response = await request(app).delete('/api/createtms/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Timesheet entry deleted successfully' });
    });

    test('should return 404 if entry not found', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).delete('/api/createtms/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Timesheet entry not found' });
    });

    test('should return 400 for invalid entry ID', async () => {
      const response = await request(app).delete('/api/createtms/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid entry ID' });
    });

    test('should handle database error when checking entry existence', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).delete('/api/createtms/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should handle database error during delete', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('Delete failed'));
      });

      const response = await request(app).delete('/api/createtms/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to delete timesheet entry' });
    });
  });
});
