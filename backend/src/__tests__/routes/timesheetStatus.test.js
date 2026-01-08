const request = require('supertest');
const express = require('express');
const timesheetStatusRoutes = require('../../routes/timesheetStatus');
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
app.use('/api/timesheet-status', timesheetStatusRoutes);

describe('Timesheet Status Routes', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      get: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/timesheet-status', () => {
    test('should return "yes" when work entries exist for the date', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { count: 2, totalHours: 8.5 });
      });

      const response = await request(app)
        .get('/api/timesheet-status?date=2024-01-15');

      expect(response.status).toBe(200);
      expect(response.body.submitted).toBe('yes');
      expect(response.body.date).toBe('2024-01-15');
      expect(response.body.totalHours).toBe(8.5);
      expect(response.body.entriesCount).toBe(2);
    });

    test('should return "no" when no work entries exist for the date', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { count: 0, totalHours: 0 });
      });

      const response = await request(app)
        .get('/api/timesheet-status?date=2024-01-15');

      expect(response.status).toBe(200);
      expect(response.body.submitted).toBe('no');
      expect(response.body.date).toBe('2024-01-15');
      expect(response.body.totalHours).toBe(0);
      expect(response.body.entriesCount).toBe(0);
    });

    test('should use current date when no date is provided', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { count: 1, totalHours: 4 });
      });

      const response = await request(app)
        .get('/api/timesheet-status');

      expect(response.status).toBe(200);
      expect(response.body.submitted).toBe('yes');
      expect(response.body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .get('/api/timesheet-status?date=invalid-date');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid date format. Use YYYY-MM-DD' });
    });

    test('should return 400 for date with wrong format', async () => {
      const response = await request(app)
        .get('/api/timesheet-status?date=01-15-2024');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid date format. Use YYYY-MM-DD' });
    });

    test('should handle database error', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/api/timesheet-status?date=2024-01-15');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should query with correct user email', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        expect(params[0]).toBe('test@example.com');
        callback(null, { count: 0, totalHours: 0 });
      });

      await request(app).get('/api/timesheet-status?date=2024-01-15');

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.any(String),
        ['test@example.com', '2024-01-15'],
        expect.any(Function)
      );
    });
  });

  describe('GET /api/timesheet-status/week', () => {
    test('should return "yes" when work entries exist for the week', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { count: 5, totalHours: 40 });
      });

      const response = await request(app)
        .get('/api/timesheet-status/week?startDate=2024-01-15');

      expect(response.status).toBe(200);
      expect(response.body.submitted).toBe('yes');
      expect(response.body.weekStart).toBe('2024-01-15');
      expect(response.body.totalHours).toBe(40);
      expect(response.body.entriesCount).toBe(5);
    });

    test('should return "no" when no work entries exist for the week', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { count: 0, totalHours: 0 });
      });

      const response = await request(app)
        .get('/api/timesheet-status/week?startDate=2024-01-15');

      expect(response.status).toBe(200);
      expect(response.body.submitted).toBe('no');
      expect(response.body.totalHours).toBe(0);
      expect(response.body.entriesCount).toBe(0);
    });

    test('should use current week when no startDate is provided', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { count: 3, totalHours: 24 });
      });

      const response = await request(app)
        .get('/api/timesheet-status/week');

      expect(response.status).toBe(200);
      expect(response.body.submitted).toBe('yes');
      expect(response.body.weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(response.body.weekEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should return 400 for invalid startDate format', async () => {
      const response = await request(app)
        .get('/api/timesheet-status/week?startDate=invalid-date');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid date format. Use YYYY-MM-DD' });
    });

    test('should handle database error', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/api/timesheet-status/week?startDate=2024-01-15');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should calculate week end correctly (7 days from start)', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        expect(params[1]).toBe('2024-01-15');
        expect(params[2]).toBe('2024-01-21');
        callback(null, { count: 0, totalHours: 0 });
      });

      const response = await request(app)
        .get('/api/timesheet-status/week?startDate=2024-01-15');

      expect(response.body.weekStart).toBe('2024-01-15');
      expect(response.body.weekEnd).toBe('2024-01-21');
    });

    test('should query with correct user email for week', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        expect(params[0]).toBe('test@example.com');
        callback(null, { count: 0, totalHours: 0 });
      });

      await request(app).get('/api/timesheet-status/week?startDate=2024-01-15');

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.any(String),
        ['test@example.com', '2024-01-15', '2024-01-21'],
        expect.any(Function)
      );
    });
  });
});
