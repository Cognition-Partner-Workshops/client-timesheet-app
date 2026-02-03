const request = require('supertest');
const express = require('express');
const { getDatabase } = require('../../database/init');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

jest.mock('../../database/init');
jest.mock('fs');
jest.mock('child_process');

const exportRoutes = require('../../routes/export');
jest.mock('../../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    req.userEmail = 'test@example.com';
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/api/export', exportRoutes);

describe('Export Routes', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);
    
    // Mock fs methods
    fs.writeFileSync = jest.fn();
    fs.unlinkSync = jest.fn();
    
    // Mock exec to succeed by default
    exec.mockImplementation((command, callback) => {
      callback(null, '5\n', '');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/export/work-entries', () => {
    test('should export work entries as CSV', async () => {
      const mockWorkEntries = [
        { id: 1, date: '2024-01-01', client_name: 'Client A', hours: 5.5, description: 'Work 1', billable: true },
        { id: 2, date: '2024-01-02', client_name: 'Client B', hours: 3.0, description: 'Work 2', billable: false }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const response = await request(app).get('/api/export/work-entries');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('work-entries.csv');
      expect(response.text).toContain('Date,Client,Hours,Description,Billable');
      expect(response.text).toContain('2024-01-01');
      expect(response.text).toContain('Client A');
    });

    test('should use custom filename when provided', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const response = await request(app).get('/api/export/work-entries?filename=my-export');

      expect(response.status).toBe(200);
      expect(response.headers['content-disposition']).toContain('my-export.csv');
    });

    test('should return empty CSV with headers when no work entries exist', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const response = await request(app).get('/api/export/work-entries');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Date,Client,Hours,Description,Billable\n');
    });

    test('should filter work entries by user email', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(params).toEqual(['test@example.com']);
        callback(null, []);
      });

      await request(app).get('/api/export/work-entries');

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('WHERE we.user_email = ?'),
        ['test@example.com'],
        expect.any(Function)
      );
    });

    test('should handle database error', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/export/work-entries');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should handle command execution error', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [{ id: 1, date: '2024-01-01', client_name: 'Client A', hours: 5.5, description: 'Work 1', billable: true }]);
      });

      exec.mockImplementation((command, callback) => {
        callback(new Error('Command failed'), null, 'error');
      });

      const response = await request(app).get('/api/export/work-entries');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Export failed' });
    });

    test('should write CSV to temp file', async () => {
      const mockWorkEntries = [
        { id: 1, date: '2024-01-01', client_name: 'Client A', hours: 5.5, description: 'Work 1', billable: true }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      await request(app).get('/api/export/work-entries');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('/tmp/work-entries.csv'),
        expect.stringContaining('Date,Client,Hours,Description,Billable')
      );
    });

    test('should clean up temp file after export', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      await request(app).get('/api/export/work-entries');

      expect(fs.unlinkSync).toHaveBeenCalledWith(
        expect.stringContaining('/tmp/work-entries.csv')
      );
    });

    test('should handle work entries with special characters in description', async () => {
      const mockWorkEntries = [
        { id: 1, date: '2024-01-01', client_name: 'Client "A"', hours: 5.5, description: 'Work with "quotes"', billable: true }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const response = await request(app).get('/api/export/work-entries');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Client "A"');
    });

    test('should order work entries by date descending', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(query).toContain('ORDER BY we.date DESC');
        callback(null, []);
      });

      await request(app).get('/api/export/work-entries');

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY we.date DESC'),
        expect.any(Array),
        expect.any(Function)
      );
    });

    test('should include client name via LEFT JOIN', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(query).toContain('LEFT JOIN clients c ON we.client_id = c.id');
        callback(null, []);
      });

      await request(app).get('/api/export/work-entries');

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN clients c ON we.client_id = c.id'),
        expect.any(Array),
        expect.any(Function)
      );
    });
  });

  describe('Data Isolation', () => {
    test('should only export data for authenticated user', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        expect(params).toContain('test@example.com');
        callback(null, []);
      });

      await request(app).get('/api/export/work-entries');

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['test@example.com']),
        expect.any(Function)
      );
    });
  });

  describe('CSV Format', () => {
    test('should generate correct CSV header', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const response = await request(app).get('/api/export/work-entries');

      expect(response.text.startsWith('Date,Client,Hours,Description,Billable')).toBe(true);
    });

    test('should format CSV rows correctly', async () => {
      const mockWorkEntries = [
        { id: 1, date: '2024-01-15', client_name: 'Acme Corp', hours: 8.0, description: 'Development work', billable: true }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const response = await request(app).get('/api/export/work-entries');

      const lines = response.text.split('\n');
      expect(lines[0]).toBe('Date,Client,Hours,Description,Billable');
      expect(lines[1]).toContain('2024-01-15');
      expect(lines[1]).toContain('Acme Corp');
      expect(lines[1]).toContain('8');
      expect(lines[1]).toContain('Development work');
    });

    test('should handle multiple work entries', async () => {
      const mockWorkEntries = [
        { id: 1, date: '2024-01-01', client_name: 'Client A', hours: 4.0, description: 'Task 1', billable: true },
        { id: 2, date: '2024-01-02', client_name: 'Client B', hours: 6.0, description: 'Task 2', billable: false },
        { id: 3, date: '2024-01-03', client_name: 'Client C', hours: 2.5, description: 'Task 3', billable: true }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const response = await request(app).get('/api/export/work-entries');

      const lines = response.text.split('\n').filter(line => line.length > 0);
      expect(lines.length).toBe(4); // 1 header + 3 data rows
    });
  });
});
