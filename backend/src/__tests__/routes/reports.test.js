const request = require('supertest');
const express = require('express');
const { getDatabase } = require('../../database/init');
const fs = require('fs');
const path = require('path');

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

const reportRoutes = require('../../routes/reports');
jest.mock('../../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    req.userEmail = 'test@example.com';
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/api/reports', reportRoutes);

describe('Report Routes', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);
    
    // Mock fs methods
    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.mkdirSync = jest.fn();
    fs.unlink = jest.fn((path, callback) => callback(null));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reports/weekly-defaulters', () => {
    const mockUsers = [
      { email: 'user1@example.com', created_at: '2026-01-01T00:00:00.000Z' },
      { email: 'user2@example.com', created_at: '2026-01-02T00:00:00.000Z' },
      { email: 'user3@example.com', created_at: '2026-01-03T00:00:00.000Z' },
      { email: 'user4@example.com', created_at: '2026-01-04T00:00:00.000Z' }
    ];

    test('should return 400 if weekStart parameter is missing', async () => {
      const response = await request(app).get('/api/reports/weekly-defaulters');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'weekStart query parameter is required (format: YYYY-MM-DD)' });
    });

    test('should return 400 for invalid date format', async () => {
      const response = await request(app).get('/api/reports/weekly-defaulters?weekStart=01-05-2026');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid date format. Use YYYY-MM-DD' });
    });

    test('should return 400 for invalid date', async () => {
      const response = await request(app).get('/api/reports/weekly-defaulters?weekStart=2026-13-45');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid date provided' });
    });

    test('should identify defaulters when 2 of 4 users have not submitted timesheets', async () => {
      // Users 1 and 2 have submitted, users 3 and 4 are defaulters
      const usersWithEntries = [
        { user_email: 'user1@example.com' },
        { user_email: 'user2@example.com' }
      ];

      let callCount = 0;
      mockDb.all.mockImplementation((query, params, callback) => {
        callCount++;
        if (callCount === 1) {
          // First call: get all users
          callback(null, mockUsers);
        } else {
          // Second call: get users with entries in the week
          callback(null, usersWithEntries);
        }
      });

      const response = await request(app).get('/api/reports/weekly-defaulters?weekStart=2026-01-05');

      expect(response.status).toBe(200);
      expect(response.body.weekStart).toBe('2026-01-05');
      expect(response.body.weekEnd).toBe('2026-01-11');
      expect(response.body.totalUsers).toBe(4);
      expect(response.body.submittedCount).toBe(2);
      expect(response.body.defaulterCount).toBe(2);
      expect(response.body.defaulters).toHaveLength(2);
      expect(response.body.defaulters.map(d => d.email)).toContain('user3@example.com');
      expect(response.body.defaulters.map(d => d.email)).toContain('user4@example.com');
    });

    test('should return all users as defaulters when no one has submitted', async () => {
      let callCount = 0;
      mockDb.all.mockImplementation((query, params, callback) => {
        callCount++;
        if (callCount === 1) {
          callback(null, mockUsers);
        } else {
          callback(null, []); // No users have submitted
        }
      });

      const response = await request(app).get('/api/reports/weekly-defaulters?weekStart=2026-01-05');

      expect(response.status).toBe(200);
      expect(response.body.totalUsers).toBe(4);
      expect(response.body.submittedCount).toBe(0);
      expect(response.body.defaulterCount).toBe(4);
      expect(response.body.defaulters).toHaveLength(4);
    });

    test('should return no defaulters when all users have submitted', async () => {
      const allUsersSubmitted = mockUsers.map(u => ({ user_email: u.email }));

      let callCount = 0;
      mockDb.all.mockImplementation((query, params, callback) => {
        callCount++;
        if (callCount === 1) {
          callback(null, mockUsers);
        } else {
          callback(null, allUsersSubmitted);
        }
      });

      const response = await request(app).get('/api/reports/weekly-defaulters?weekStart=2026-01-05');

      expect(response.status).toBe(200);
      expect(response.body.totalUsers).toBe(4);
      expect(response.body.submittedCount).toBe(4);
      expect(response.body.defaulterCount).toBe(0);
      expect(response.body.defaulters).toHaveLength(0);
    });

    test('should identify single defaulter among 4 users', async () => {
      // Users 1, 2, and 3 have submitted, only user 4 is a defaulter
      const usersWithEntries = [
        { user_email: 'user1@example.com' },
        { user_email: 'user2@example.com' },
        { user_email: 'user3@example.com' }
      ];

      let callCount = 0;
      mockDb.all.mockImplementation((query, params, callback) => {
        callCount++;
        if (callCount === 1) {
          callback(null, mockUsers);
        } else {
          callback(null, usersWithEntries);
        }
      });

      const response = await request(app).get('/api/reports/weekly-defaulters?weekStart=2026-01-05');

      expect(response.status).toBe(200);
      expect(response.body.totalUsers).toBe(4);
      expect(response.body.submittedCount).toBe(3);
      expect(response.body.defaulterCount).toBe(1);
      expect(response.body.defaulters).toHaveLength(1);
      expect(response.body.defaulters[0].email).toBe('user4@example.com');
    });

    test('should handle database error when fetching users', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/reports/weekly-defaulters?weekStart=2026-01-05');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should handle database error when fetching work entries', async () => {
      let callCount = 0;
      mockDb.all.mockImplementation((query, params, callback) => {
        callCount++;
        if (callCount === 1) {
          callback(null, mockUsers);
        } else {
          callback(new Error('Database error'), null);
        }
      });

      const response = await request(app).get('/api/reports/weekly-defaulters?weekStart=2026-01-05');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should correctly calculate week end date (6 days from start)', async () => {
      let callCount = 0;
      mockDb.all.mockImplementation((query, params, callback) => {
        callCount++;
        if (callCount === 1) {
          callback(null, []);
        } else {
          // Verify the date range query
          expect(params[0]).toBe('2026-01-12');
          expect(params[1]).toBe('2026-01-18');
          callback(null, []);
        }
      });

      const response = await request(app).get('/api/reports/weekly-defaulters?weekStart=2026-01-12');

      expect(response.status).toBe(200);
      expect(response.body.weekStart).toBe('2026-01-12');
      expect(response.body.weekEnd).toBe('2026-01-18');
    });
  });

  describe('GET /api/reports/client/:clientId', () => {
    test('should return client report with work entries', async () => {
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

      const response = await request(app).get('/api/reports/client/1');

      expect(response.status).toBe(200);
      expect(response.body.client).toEqual(mockClient);
      expect(response.body.workEntries).toEqual(mockWorkEntries);
      expect(response.body.totalHours).toBe(8.5);
      expect(response.body.entryCount).toBe(2);
    });

    test('should return report with zero hours for client with no entries', async () => {
      const mockClient = { id: 1, name: 'Empty Client' };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const response = await request(app).get('/api/reports/client/1');

      expect(response.status).toBe(200);
      expect(response.body.totalHours).toBe(0);
      expect(response.body.entryCount).toBe(0);
    });

    test('should return 404 if client not found', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).get('/api/reports/client/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Client not found' });
    });

    test('should return 400 for invalid client ID', async () => {
      const response = await request(app).get('/api/reports/client/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid client ID' });
    });

    test('should handle database error when fetching client', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/reports/client/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should handle database error when fetching work entries', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Test Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/reports/client/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should filter work entries by user email', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Test Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        expect(params).toEqual([1, 'test@example.com']);
        callback(null, []);
      });

      await request(app).get('/api/reports/client/1');

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('WHERE client_id = ? AND user_email = ?'),
        [1, 'test@example.com'],
        expect.any(Function)
      );
    });
  });

  describe('GET /api/reports/export/csv/:clientId', () => {
    test('should return 400 for invalid client ID', async () => {
      const response = await request(app).get('/api/reports/export/csv/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid client ID' });
    });

    test('should return 404 if client not found', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).get('/api/reports/export/csv/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Client not found' });
    });

    test('should handle database error when fetching client', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/reports/export/csv/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should handle database error when fetching work entries', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Test Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/reports/export/csv/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/reports/export/pdf/:clientId', () => {
    test('should return 400 for invalid client ID', async () => {
      const response = await request(app).get('/api/reports/export/pdf/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid client ID' });
    });

    test('should return 404 if client not found', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).get('/api/reports/export/pdf/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Client not found' });
    });

    test('should handle database error', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/reports/export/pdf/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Data Isolation', () => {
    test('should only return data for authenticated user', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        expect(params).toContain('test@example.com');
        callback(null, { id: 1, name: 'Test Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        expect(params).toContain('test@example.com');
        callback(null, []);
      });

      await request(app).get('/api/reports/client/1');

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['test@example.com']),
        expect.any(Function)
      );
    });
  });

  describe('Hours Calculation', () => {
    test('should correctly sum decimal hours', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Test Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [
          { hours: 2.5 },
          { hours: 3.75 },
          { hours: 1.25 }
        ]);
      });

      const response = await request(app).get('/api/reports/client/1');

      expect(response.body.totalHours).toBe(7.5);
    });

    test('should handle integer hours', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Test Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [
          { hours: 8 },
          { hours: 4 }
        ]);
      });

      const response = await request(app).get('/api/reports/client/1');

      expect(response.body.totalHours).toBe(12);
    });
  });
});
