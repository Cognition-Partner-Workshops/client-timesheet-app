const request = require('supertest');
const express = require('express');
const { getDatabase } = require('../../database/init');

jest.mock('../../database/init');
jest.mock('fs');
jest.mock('csv-writer', () => ({
  createObjectCsvWriter: jest.fn(() => ({
    writeRecords: jest.fn().mockResolvedValue(undefined)
  }))
}));
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    addPage: jest.fn().mockReturnThis(),
    pipe: jest.fn(),
    end: jest.fn(),
    y: 100
  }));
});

const authRoutes = require('../../routes/auth');
const clientRoutes = require('../../routes/clients');
const workEntryRoutes = require('../../routes/workEntries');
const reportRoutes = require('../../routes/reports');
const { errorHandler } = require('../../middleware/errorHandler');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

jest.mock('../../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    const email = req.headers['x-user-email'];
    if (!email) {
      return res.status(401).json({ error: 'User email required in x-user-email header' });
    }
    req.userEmail = email;
    next();
  }
}));

app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);
app.use(errorHandler);

describe('End-to-End Tests', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn(),
      run: jest.fn(),
      serialize: jest.fn((cb) => cb()),
      close: jest.fn((cb) => cb && cb(null))
    };
    getDatabase.mockReturnValue(mockDb);
    
    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.mkdirSync = jest.fn();
    fs.unlink = jest.fn((path, callback) => callback(null));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication E2E - Positive Scenarios', () => {
    test('should complete full login flow for new user', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'newuser@example.com' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created and logged in successfully');
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    test('should complete full login flow for existing user', async () => {
      const existingUser = {
        email: 'existing@example.com',
        created_at: '2024-01-01T00:00:00.000Z'
      };
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, existingUser);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'existing@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
    });

    test('should get current user info after login', async () => {
      const user = {
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00.000Z'
      };
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, user);
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
    });
  });

  describe('Authentication E2E - Negative Scenarios', () => {
    test('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email' });

      expect(response.status).toBe(400);
    });

    test('should reject login with empty email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: '' });

      expect(response.status).toBe(400);
    });

    test('should reject login without email field', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });

    test('should reject login with null email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: null });

      expect(response.status).toBe(400);
    });

    test('should reject /me endpoint without authentication', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });

  describe('Authentication E2E - Edge Cases', () => {
    test('should handle email with special characters', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user+tag@example.com' });

      expect(response.status).toBe(201);
    });

    test('should handle email with subdomain', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@mail.example.com' });

      expect(response.status).toBe(201);
    });

    test('should handle very long valid email', async () => {
      const longEmail = 'a'.repeat(50) + '@example.com';
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: longEmail });

      expect(response.status).toBe(201);
    });

    test('should handle email case sensitivity', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'User@Example.COM' });

      expect(response.status).toBe(201);
    });
  });

  describe('Client CRUD E2E - Positive Scenarios', () => {
    test('should create a new client successfully', async () => {
      const newClient = { name: 'Test Client', description: 'Test Description' };
      const createdClient = { id: 1, ...newClient, created_at: '2024-01-01', updated_at: '2024-01-01' };

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, createdClient);
      });

      const response = await request(app)
        .post('/api/clients')
        .set('x-user-email', 'test@example.com')
        .send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.client.name).toBe('Test Client');
    });

    test('should list all clients for user', async () => {
      const mockClients = [
        { id: 1, name: 'Client A', description: 'Desc A' },
        { id: 2, name: 'Client B', description: 'Desc B' }
      ];
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockClients);
      });

      const response = await request(app)
        .get('/api/clients')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.clients).toHaveLength(2);
    });

    test('should get a specific client by ID', async () => {
      const mockClient = { id: 1, name: 'Client A', description: 'Desc A' };
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      const response = await request(app)
        .get('/api/clients/1')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.client.name).toBe('Client A');
    });

    test('should update client name', async () => {
      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });
      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });
      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1, name: 'Updated Name', description: 'Desc' });
      });

      const response = await request(app)
        .put('/api/clients/1')
        .set('x-user-email', 'test@example.com')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.client.name).toBe('Updated Name');
    });

    test('should delete a client', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1 });
      });
      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      const response = await request(app)
        .delete('/api/clients/1')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Client deleted successfully');
    });
  });

  describe('Client CRUD E2E - Negative Scenarios', () => {
    test('should reject client creation without name', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('x-user-email', 'test@example.com')
        .send({ description: 'No name' });

      expect(response.status).toBe(400);
    });

    test('should reject client creation with empty name', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('x-user-email', 'test@example.com')
        .send({ name: '' });

      expect(response.status).toBe(400);
    });

    test('should return 404 for non-existent client', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/api/clients/9999')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(404);
    });

    test('should reject update for non-existent client', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .put('/api/clients/9999')
        .set('x-user-email', 'test@example.com')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });

    test('should reject delete for non-existent client', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .delete('/api/clients/9999')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(404);
    });

    test('should reject invalid client ID format', async () => {
      const response = await request(app)
        .get('/api/clients/abc')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(400);
    });
  });

  describe('Client CRUD E2E - Edge Cases', () => {
    test('should handle client name with maximum length', async () => {
      const longName = 'A'.repeat(255);
      const createdClient = { id: 1, name: longName, description: null };

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, createdClient);
      });

      const response = await request(app)
        .post('/api/clients')
        .set('x-user-email', 'test@example.com')
        .send({ name: longName });

      expect(response.status).toBe(201);
    });

    test('should handle client name exceeding maximum length', async () => {
      const tooLongName = 'A'.repeat(256);

      const response = await request(app)
        .post('/api/clients')
        .set('x-user-email', 'test@example.com')
        .send({ name: tooLongName });

      expect(response.status).toBe(400);
    });

    test('should handle description with maximum length', async () => {
      const longDesc = 'B'.repeat(1000);
      const createdClient = { id: 1, name: 'Test', description: longDesc };

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, createdClient);
      });

      const response = await request(app)
        .post('/api/clients')
        .set('x-user-email', 'test@example.com')
        .send({ name: 'Test', description: longDesc });

      expect(response.status).toBe(201);
    });

    test('should handle description exceeding maximum length', async () => {
      const tooLongDesc = 'B'.repeat(1001);

      const response = await request(app)
        .post('/api/clients')
        .set('x-user-email', 'test@example.com')
        .send({ name: 'Test', description: tooLongDesc });

      expect(response.status).toBe(400);
    });

    test('should handle client with special characters in name', async () => {
      const specialName = "Client's & Co. <Test>";
      const createdClient = { id: 1, name: specialName, description: null };

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, createdClient);
      });

      const response = await request(app)
        .post('/api/clients')
        .set('x-user-email', 'test@example.com')
        .send({ name: specialName });

      expect(response.status).toBe(201);
    });

    test('should handle client with unicode characters', async () => {
      const unicodeName = '客户 αβγ 🏢';
      const createdClient = { id: 1, name: unicodeName, description: null };

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, createdClient);
      });

      const response = await request(app)
        .post('/api/clients')
        .set('x-user-email', 'test@example.com')
        .send({ name: unicodeName });

      expect(response.status).toBe(201);
    });

    test('should handle empty client list', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .get('/api/clients')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.clients).toHaveLength(0);
    });

    test('should handle client ID at boundary (0)', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/api/clients/0')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(404);
    });

    test('should handle negative client ID', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/api/clients/-1')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(404);
    });

    test('should handle very large client ID', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/api/clients/999999999')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(404);
    });

    test('should handle whitespace-only name', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('x-user-email', 'test@example.com')
        .send({ name: '   ' });

      expect(response.status).toBe(400);
    });

    test('should trim whitespace from name', async () => {
      const createdClient = { id: 1, name: 'Trimmed Name', description: null };

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, createdClient);
      });

      const response = await request(app)
        .post('/api/clients')
        .set('x-user-email', 'test@example.com')
        .send({ name: '  Trimmed Name  ' });

      expect(response.status).toBe(201);
    });
  });

  describe('Work Entry CRUD E2E - Positive Scenarios', () => {
    test('should create a work entry successfully', async () => {
      const newEntry = {
        clientId: 1,
        hours: 8,
        description: 'Development work',
        date: '2024-01-15'
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('clients')) {
          callback(null, { id: 1 });
        } else {
          callback(null, { id: 1, ...newEntry, client_name: 'Client A' });
        }
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send(newEntry);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Work entry created successfully');
    });

    test('should list all work entries', async () => {
      const mockEntries = [
        { id: 1, client_id: 1, hours: 5, description: 'Work 1', date: '2024-01-01', client_name: 'Client A' },
        { id: 2, client_id: 2, hours: 3, description: 'Work 2', date: '2024-01-02', client_name: 'Client B' }
      ];
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockEntries);
      });

      const response = await request(app)
        .get('/api/work-entries')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.workEntries).toHaveLength(2);
    });

    test('should filter work entries by client ID', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [{ id: 1, client_id: 1, hours: 5, client_name: 'Client A' }]);
      });

      const response = await request(app)
        .get('/api/work-entries?clientId=1')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
    });

    test('should get a specific work entry', async () => {
      const mockEntry = { id: 1, client_id: 1, hours: 5, description: 'Work', client_name: 'Client A' };
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockEntry);
      });

      const response = await request(app)
        .get('/api/work-entries/1')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.workEntry.hours).toBe(5);
    });

    test('should update work entry hours', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('work_entries we')) {
          callback(null, { id: 1, hours: 10, client_name: 'Client A' });
        } else {
          callback(null, { id: 1 });
        }
      });
      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      const response = await request(app)
        .put('/api/work-entries/1')
        .set('x-user-email', 'test@example.com')
        .send({ hours: 10 });

      expect(response.status).toBe(200);
    });

    test('should delete a work entry', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1 });
      });
      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      const response = await request(app)
        .delete('/api/work-entries/1')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Work entry deleted successfully');
    });
  });

  describe('Work Entry CRUD E2E - Negative Scenarios', () => {
    test('should reject work entry without clientId', async () => {
      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ hours: 5, date: '2024-01-15' });

      expect(response.status).toBe(400);
    });

    test('should reject work entry without hours', async () => {
      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, date: '2024-01-15' });

      expect(response.status).toBe(400);
    });

    test('should reject work entry without date', async () => {
      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: 5 });

      expect(response.status).toBe(400);
    });

    test('should reject work entry with negative hours', async () => {
      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: -5, date: '2024-01-15' });

      expect(response.status).toBe(400);
    });

    test('should reject work entry with zero hours', async () => {
      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: 0, date: '2024-01-15' });

      expect(response.status).toBe(400);
    });

    test('should reject work entry with hours exceeding 24', async () => {
      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: 25, date: '2024-01-15' });

      expect(response.status).toBe(400);
    });

    test('should reject work entry for non-existent client', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 9999, hours: 5, date: '2024-01-15' });

      expect(response.status).toBe(400);
    });

    test('should reject work entry with invalid date format', async () => {
      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: 5, date: 'not-a-date' });

      expect(response.status).toBe(400);
    });

    test('should return 404 for non-existent work entry', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/api/work-entries/9999')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(404);
    });
  });

  describe('Work Entry CRUD E2E - Edge Cases', () => {
    test('should handle minimum valid hours (0.01)', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('clients')) {
          callback(null, { id: 1 });
        } else {
          callback(null, { id: 1, hours: 0.01, client_name: 'Client A' });
        }
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: 0.01, date: '2024-01-15' });

      expect(response.status).toBe(201);
    });

    test('should handle maximum valid hours (24)', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('clients')) {
          callback(null, { id: 1 });
        } else {
          callback(null, { id: 1, hours: 24, client_name: 'Client A' });
        }
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: 24, date: '2024-01-15' });

      expect(response.status).toBe(201);
    });

    test('should handle decimal hours with precision', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('clients')) {
          callback(null, { id: 1 });
        } else {
          callback(null, { id: 1, hours: 5.75, client_name: 'Client A' });
        }
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: 5.75, date: '2024-01-15' });

      expect(response.status).toBe(201);
    });

    test('should handle description with maximum length', async () => {
      const longDesc = 'D'.repeat(1000);
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('clients')) {
          callback(null, { id: 1 });
        } else {
          callback(null, { id: 1, hours: 5, description: longDesc, client_name: 'Client A' });
        }
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: 5, date: '2024-01-15', description: longDesc });

      expect(response.status).toBe(201);
    });

    test('should reject description exceeding maximum length', async () => {
      const tooLongDesc = 'D'.repeat(1001);

      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: 5, date: '2024-01-15', description: tooLongDesc });

      expect(response.status).toBe(400);
    });

    test('should handle future date', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('clients')) {
          callback(null, { id: 1 });
        } else {
          callback(null, { id: 1, hours: 5, date: '2030-12-31', client_name: 'Client A' });
        }
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: 5, date: '2030-12-31' });

      expect(response.status).toBe(201);
    });

    test('should handle past date', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('clients')) {
          callback(null, { id: 1 });
        } else {
          callback(null, { id: 1, hours: 5, date: '2020-01-01', client_name: 'Client A' });
        }
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: 5, date: '2020-01-01' });

      expect(response.status).toBe(201);
    });

    test('should handle empty work entries list', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .get('/api/work-entries')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.workEntries).toHaveLength(0);
    });

    test('should handle invalid clientId filter', async () => {
      const response = await request(app)
        .get('/api/work-entries?clientId=abc')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(400);
    });
  });

  describe('Reports E2E - Positive Scenarios', () => {
    test('should get client report with work entries', async () => {
      const mockClient = { id: 1, name: 'Test Client' };
      const mockWorkEntries = [
        { id: 1, hours: 5.5, description: 'Work 1', date: '2024-01-01' },
        { id: 2, hours: 3.0, description: 'Work 2', date: '2024-01-02' }
      ];

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const response = await request(app)
        .get('/api/reports/client/1')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.client).toEqual(mockClient);
      expect(response.body.totalHours).toBe(8.5);
      expect(response.body.entryCount).toBe(2);
    });

    test('should get report for client with no entries', async () => {
      const mockClient = { id: 1, name: 'Empty Client' };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .get('/api/reports/client/1')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.totalHours).toBe(0);
      expect(response.body.entryCount).toBe(0);
    });
  });

  describe('Reports E2E - Negative Scenarios', () => {
    test('should return 404 for non-existent client report', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/api/reports/client/9999')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(404);
    });

    test('should return 400 for invalid client ID in report', async () => {
      const response = await request(app)
        .get('/api/reports/client/abc')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(400);
    });

    test('should return 404 for non-existent client CSV export', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/api/reports/export/csv/9999')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(404);
    });

    test('should return 400 for invalid client ID in CSV export', async () => {
      const response = await request(app)
        .get('/api/reports/export/csv/abc')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(400);
    });

    test('should return 404 for non-existent client PDF export', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/api/reports/export/pdf/9999')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(404);
    });

    test('should return 400 for invalid client ID in PDF export', async () => {
      const response = await request(app)
        .get('/api/reports/export/pdf/abc')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(400);
    });
  });

  describe('Reports E2E - Edge Cases', () => {
    test('should correctly calculate total hours with many entries', async () => {
      const mockClient = { id: 1, name: 'Busy Client' };
      const mockWorkEntries = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        hours: 1.5,
        description: `Work ${i + 1}`,
        date: '2024-01-01'
      }));

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const response = await request(app)
        .get('/api/reports/client/1')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.totalHours).toBe(150);
      expect(response.body.entryCount).toBe(100);
    });

    test('should handle decimal precision in total hours', async () => {
      const mockClient = { id: 1, name: 'Test Client' };
      const mockWorkEntries = [
        { hours: 0.33 },
        { hours: 0.33 },
        { hours: 0.34 }
      ];

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const response = await request(app)
        .get('/api/reports/client/1')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(200);
      expect(response.body.totalHours).toBeCloseTo(1.0, 2);
    });
  });

  describe('Data Isolation E2E Tests', () => {
    test('should only return clients for authenticated user', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(params).toContain('user1@example.com');
        callback(null, [{ id: 1, name: 'User1 Client' }]);
      });

      const response = await request(app)
        .get('/api/clients')
        .set('x-user-email', 'user1@example.com');

      expect(response.status).toBe(200);
    });

    test('should only return work entries for authenticated user', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(params[0]).toBe('user2@example.com');
        callback(null, []);
      });

      const response = await request(app)
        .get('/api/work-entries')
        .set('x-user-email', 'user2@example.com');

      expect(response.status).toBe(200);
    });

    test('should only return reports for authenticated user', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        expect(params).toContain('user3@example.com');
        callback(null, { id: 1, name: 'Test Client' });
      });
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(params).toContain('user3@example.com');
        callback(null, []);
      });

      const response = await request(app)
        .get('/api/reports/client/1')
        .set('x-user-email', 'user3@example.com');

      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling E2E Tests', () => {
    test('should handle database error on client list', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .get('/api/clients')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(500);
    });

    test('should handle database error on work entry creation', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1 });
      });
      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('Insert failed'));
      });

      const response = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'test@example.com')
        .send({ clientId: 1, hours: 5, date: '2024-01-15' });

      expect(response.status).toBe(500);
    });

    test('should handle database error on report generation', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/api/reports/client/1')
        .set('x-user-email', 'test@example.com');

      expect(response.status).toBe(500);
    });
  });

  describe('Complete User Flow E2E Tests', () => {
    test('should complete full workflow: login -> create client -> add work entry -> view report', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('users')) {
          callback(null, null);
        } else if (query.includes('clients')) {
          callback(null, { id: 1, name: 'New Client' });
        } else {
          callback(null, { id: 1, hours: 8, client_name: 'New Client' });
        }
      });
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [{ id: 1, hours: 8, description: 'Work', date: '2024-01-15' }]);
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'workflow@example.com' });
      expect(loginResponse.status).toBe(201);

      const clientResponse = await request(app)
        .post('/api/clients')
        .set('x-user-email', 'workflow@example.com')
        .send({ name: 'New Client' });
      expect(clientResponse.status).toBe(201);

      const workEntryResponse = await request(app)
        .post('/api/work-entries')
        .set('x-user-email', 'workflow@example.com')
        .send({ clientId: 1, hours: 8, date: '2024-01-15' });
      expect(workEntryResponse.status).toBe(201);

      const reportResponse = await request(app)
        .get('/api/reports/client/1')
        .set('x-user-email', 'workflow@example.com');
      expect(reportResponse.status).toBe(200);
      expect(reportResponse.body.totalHours).toBe(8);
    });
  });
});
