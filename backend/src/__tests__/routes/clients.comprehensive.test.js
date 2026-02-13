const request = require('supertest');
const express = require('express');
const clientRoutes = require('../../routes/clients');
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
app.use('/api/clients', clientRoutes);
app.use((err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({ error: 'Validation error', details: err.details.map(d => d.message) });
  }
  res.status(500).json({ error: 'Internal server error' });
});

describe('Client Routes - Comprehensive Coverage', () => {
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

  describe('DELETE /api/clients (Bulk Delete)', () => {
    test('should delete all clients for authenticated user', async () => {
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.changes = 5;
        callback.call(this, null);
      });

      const response = await request(app).delete('/api/clients');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('All clients deleted successfully');
      expect(response.body.deletedCount).toBe(5);
      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM clients WHERE user_email = ?',
        ['test@example.com'],
        expect.any(Function)
      );
    });

    test('should return success with zero deletedCount when no clients exist', async () => {
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.changes = 0;
        callback.call(this, null);
      });

      const response = await request(app).delete('/api/clients');

      expect(response.status).toBe(200);
      expect(response.body.deletedCount).toBe(0);
    });

    test('should handle database error on bulk delete', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('Bulk delete failed'));
      });

      const response = await request(app).delete('/api/clients');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to delete clients' });
    });

    test('should only delete clients for the authenticated user', async () => {
      mockDb.run.mockImplementation(function(query, params, callback) {
        expect(params).toEqual(['test@example.com']);
        expect(query).toContain('WHERE user_email = ?');
        this.changes = 3;
        callback.call(this, null);
      });

      await request(app).delete('/api/clients');

      expect(mockDb.run).toHaveBeenCalled();
    });
  });

  describe('POST /api/clients - Department and Email Fields', () => {
    test('should create client with department field', async () => {
      const createdClient = { id: 1, name: 'Client', description: null, department: 'Engineering', email: null };

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, createdClient);
      });

      const response = await request(app)
        .post('/api/clients')
        .send({ name: 'Client', department: 'Engineering' });

      expect(response.status).toBe(201);
      expect(response.body.client.department).toBe('Engineering');
    });

    test('should create client with email field', async () => {
      const createdClient = { id: 1, name: 'Client', description: null, department: null, email: 'client@company.com' };

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, createdClient);
      });

      const response = await request(app)
        .post('/api/clients')
        .send({ name: 'Client', email: 'client@company.com' });

      expect(response.status).toBe(201);
      expect(response.body.client.email).toBe('client@company.com');
    });

    test('should create client with all fields', async () => {
      const createdClient = { id: 1, name: 'Full Client', description: 'Full description', department: 'Sales', email: 'sales@company.com' };

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, createdClient);
      });

      const response = await request(app)
        .post('/api/clients')
        .send({ name: 'Full Client', description: 'Full description', department: 'Sales', email: 'sales@company.com' });

      expect(response.status).toBe(201);
      expect(response.body.client).toEqual(createdClient);
    });

    test('should store null for empty department', async () => {
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client', department: null });
      });

      const response = await request(app)
        .post('/api/clients')
        .send({ name: 'Client', department: '' });

      expect(response.status).toBe(201);
    });

    test('should store null for empty email', async () => {
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client', email: null });
      });

      const response = await request(app)
        .post('/api/clients')
        .send({ name: 'Client', email: '' });

      expect(response.status).toBe(201);
    });

    test('should reject invalid email format in client creation', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({ name: 'Client', email: 'not-an-email' });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/clients/:id - Department and Email Fields', () => {
    test('should update client department', async () => {
      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        expect(query).toContain('department = ?');
        callback(null);
      });

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1, name: 'Client', department: 'Marketing' });
      });

      const response = await request(app)
        .put('/api/clients/1')
        .send({ department: 'Marketing' });

      expect(response.status).toBe(200);
      expect(response.body.client.department).toBe('Marketing');
    });

    test('should update client email', async () => {
      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        expect(query).toContain('email = ?');
        callback(null);
      });

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1, name: 'Client', email: 'new@company.com' });
      });

      const response = await request(app)
        .put('/api/clients/1')
        .send({ email: 'new@company.com' });

      expect(response.status).toBe(200);
      expect(response.body.client.email).toBe('new@company.com');
    });

    test('should clear department with empty string', async () => {
      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1, name: 'Client', department: null });
      });

      const response = await request(app)
        .put('/api/clients/1')
        .send({ department: '' });

      expect(response.status).toBe(200);
    });

    test('should clear email with empty string', async () => {
      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1, name: 'Client', email: null });
      });

      const response = await request(app)
        .put('/api/clients/1')
        .send({ email: '' });

      expect(response.status).toBe(200);
    });

    test('should update all fields simultaneously', async () => {
      const updatedClient = { id: 1, name: 'New Name', description: 'New Desc', department: 'New Dept', email: 'new@email.com' };

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        expect(query).toContain('name = ?');
        expect(query).toContain('description = ?');
        expect(query).toContain('department = ?');
        expect(query).toContain('email = ?');
        callback(null);
      });

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, updatedClient);
      });

      const response = await request(app)
        .put('/api/clients/1')
        .send({ name: 'New Name', description: 'New Desc', department: 'New Dept', email: 'new@email.com' });

      expect(response.status).toBe(200);
      expect(response.body.client).toEqual(updatedClient);
    });

    test('should reject invalid email format in client update', async () => {
      const response = await request(app)
        .put('/api/clients/1')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/clients - Try-Catch Error Handling', () => {
    test('should handle unexpected throw in POST handler', async () => {
      getDatabase.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .post('/api/clients')
        .send({ name: 'Test Client' });

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/clients/:id - Try-Catch Error Handling', () => {
    test('should handle unexpected throw in PUT handler', async () => {
      getDatabase.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .put('/api/clients/1')
        .send({ name: 'Updated Client' });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/clients - Extended', () => {
    test('should return clients ordered by name', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(query).toContain('ORDER BY name');
        callback(null, []);
      });

      await request(app).get('/api/clients');
      expect(mockDb.all).toHaveBeenCalled();
    });

    test('should include department and email in SELECT query', async () => {
      const clients = [
        { id: 1, name: 'Client', description: 'Desc', department: 'Eng', email: 'c@c.com', created_at: '2024-01-01', updated_at: '2024-01-01' }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        expect(query).toContain('department');
        expect(query).toContain('email');
        callback(null, clients);
      });

      const response = await request(app).get('/api/clients');

      expect(response.status).toBe(200);
      expect(response.body.clients[0].department).toBe('Eng');
      expect(response.body.clients[0].email).toBe('c@c.com');
    });
  });

  describe('GET /api/clients/:id - Extended', () => {
    test('should include department and email in single client response', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client', department: 'Sales', email: 's@s.com' });
      });

      const response = await request(app).get('/api/clients/1');

      expect(response.status).toBe(200);
      expect(response.body.client.department).toBe('Sales');
      expect(response.body.client.email).toBe('s@s.com');
    });

    test('should return 400 for non-numeric client ID', async () => {
      const response = await request(app).get('/api/clients/abc');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid client ID' });
    });

    test('should return 400 for special character client ID', async () => {
      const response = await request(app).get('/api/clients/!@#');
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/clients/:id - Extended', () => {
    test('should return 400 for non-numeric client ID on delete', async () => {
      const response = await request(app).delete('/api/clients/abc');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid client ID' });
    });
  });

  describe('POST /api/clients - Input Validation Edge Cases', () => {
    test('should reject name with only whitespace', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({ name: '   ' });
      expect(response.status).toBe(400);
    });

    test('should accept name at maximum length (255 chars)', async () => {
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'a'.repeat(255) });
      });

      const response = await request(app)
        .post('/api/clients')
        .send({ name: 'a'.repeat(255) });

      expect(response.status).toBe(201);
    });

    test('should reject name exceeding 255 characters', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({ name: 'a'.repeat(256) });
      expect(response.status).toBe(400);
    });

    test('should reject description exceeding 1000 characters', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({ name: 'Client', description: 'a'.repeat(1001) });
      expect(response.status).toBe(400);
    });

    test('should reject department exceeding 255 characters', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({ name: 'Client', department: 'a'.repeat(256) });
      expect(response.status).toBe(400);
    });
  });
});
