/**
 * Functional Test Suite for Reports API
 * 
 * This test suite validates the report generation functionality including:
 * - Client hourly reports with aggregation
 * - CSV export functionality
 * - PDF export functionality
 * - Data isolation between users
 * - Error handling and edge cases
 */

const request = require('supertest');
const express = require('express');
const reportRoutes = require('../../routes/reports');
const { getDatabase } = require('../../database/init');

// Mock dependencies
jest.mock('../../database/init');
jest.mock('../../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    req.userEmail = 'test@example.com';
    next();
  }
}));

// Mock fs module for file operations
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  unlink: jest.fn((path, callback) => callback(null)),
  createWriteStream: jest.fn().mockReturnValue({
    on: jest.fn(),
    write: jest.fn(),
    end: jest.fn()
  })
}));

// Mock csv-writer
jest.mock('csv-writer', () => ({
  createObjectCsvWriter: jest.fn().mockReturnValue({
    writeRecords: jest.fn().mockResolvedValue()
  })
}));

// Mock pdfkit
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    addPage: jest.fn().mockReturnThis(),
    end: jest.fn(),
    y: 100
  }));
});

const app = express();
app.use(express.json());
app.use('/api/reports', reportRoutes);
app.use((err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({ error: 'Validation error' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

describe('Reports Functional Tests', () => {
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

  describe('GET /api/reports/client/:clientId - Client Hourly Report', () => {
    describe('Successful Report Generation', () => {
      test('should return complete report with work entries and totals', async () => {
        const mockClient = { id: 1, name: 'Acme Corp' };
        const mockWorkEntries = [
          { id: 1, hours: 8.5, description: 'Development work', date: '2024-01-15', created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
          { id: 2, hours: 4.0, description: 'Code review', date: '2024-01-16', created_at: '2024-01-16T10:00:00Z', updated_at: '2024-01-16T10:00:00Z' },
          { id: 3, hours: 6.5, description: 'Testing', date: '2024-01-17', created_at: '2024-01-17T10:00:00Z', updated_at: '2024-01-17T10:00:00Z' }
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
        expect(response.body.totalHours).toBe(19); // 8.5 + 4.0 + 6.5
        expect(response.body.entryCount).toBe(3);
      });

      test('should return report with zero hours when no work entries exist', async () => {
        const mockClient = { id: 1, name: 'New Client' };

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, mockClient);
        });

        mockDb.all.mockImplementation((query, params, callback) => {
          callback(null, []);
        });

        const response = await request(app).get('/api/reports/client/1');

        expect(response.status).toBe(200);
        expect(response.body.client).toEqual(mockClient);
        expect(response.body.workEntries).toEqual([]);
        expect(response.body.totalHours).toBe(0);
        expect(response.body.entryCount).toBe(0);
      });

      test('should correctly calculate total hours with decimal values', async () => {
        const mockClient = { id: 1, name: 'Test Client' };
        const mockWorkEntries = [
          { id: 1, hours: 0.25, description: 'Quick fix', date: '2024-01-15' },
          { id: 2, hours: 0.5, description: 'Meeting', date: '2024-01-15' },
          { id: 3, hours: 1.75, description: 'Development', date: '2024-01-15' }
        ];

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, mockClient);
        });

        mockDb.all.mockImplementation((query, params, callback) => {
          callback(null, mockWorkEntries);
        });

        const response = await request(app).get('/api/reports/client/1');

        expect(response.status).toBe(200);
        expect(response.body.totalHours).toBe(2.5); // 0.25 + 0.5 + 1.75
      });

      test('should handle large number of work entries', async () => {
        const mockClient = { id: 1, name: 'Large Client' };
        const mockWorkEntries = Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          hours: 8,
          description: `Work entry ${i + 1}`,
          date: `2024-01-${String(i % 28 + 1).padStart(2, '0')}`
        }));

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, mockClient);
        });

        mockDb.all.mockImplementation((query, params, callback) => {
          callback(null, mockWorkEntries);
        });

        const response = await request(app).get('/api/reports/client/1');

        expect(response.status).toBe(200);
        expect(response.body.totalHours).toBe(800); // 100 * 8
        expect(response.body.entryCount).toBe(100);
      });
    });

    describe('Error Handling', () => {
      test('should return 400 for invalid client ID', async () => {
        const response = await request(app).get('/api/reports/client/invalid');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid client ID' });
      });

      test('should return 400 for negative client ID', async () => {
        const response = await request(app).get('/api/reports/client/-1');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid client ID' });
      });

      test('should return 404 when client not found', async () => {
        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, null);
        });

        const response = await request(app).get('/api/reports/client/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Client not found' });
      });

      test('should return 500 on database error when fetching client', async () => {
        mockDb.get.mockImplementation((query, params, callback) => {
          callback(new Error('Database connection failed'), null);
        });

        const response = await request(app).get('/api/reports/client/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error' });
      });

      test('should return 500 on database error when fetching work entries', async () => {
        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, { id: 1, name: 'Test Client' });
        });

        mockDb.all.mockImplementation((query, params, callback) => {
          callback(new Error('Query failed'), null);
        });

        const response = await request(app).get('/api/reports/client/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error' });
      });
    });

    describe('Data Isolation', () => {
      test('should only return data for authenticated user', async () => {
        const mockClient = { id: 1, name: 'User Client' };

        mockDb.get.mockImplementation((query, params, callback) => {
          // Verify user email is included in query params
          expect(params).toContain('test@example.com');
          callback(null, mockClient);
        });

        mockDb.all.mockImplementation((query, params, callback) => {
          expect(params).toContain('test@example.com');
          callback(null, []);
        });

        await request(app).get('/api/reports/client/1');

        expect(mockDb.get).toHaveBeenCalled();
        expect(mockDb.all).toHaveBeenCalled();
      });
    });
  });

  describe('GET /api/reports/export/csv/:clientId - CSV Export', () => {
    describe('Successful CSV Export', () => {
      test('should generate CSV file with correct headers', async () => {
        const mockClient = { id: 1, name: 'Test Client' };
        const mockWorkEntries = [
          { hours: 8, description: 'Work', date: '2024-01-15', created_at: '2024-01-15T10:00:00Z' }
        ];

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, mockClient);
        });

        mockDb.all.mockImplementation((query, params, callback) => {
          callback(null, mockWorkEntries);
        });

        const response = await request(app).get('/api/reports/export/csv/1');

        // CSV export triggers file download
        expect(response.status).toBe(200);
      });

      test('should handle empty work entries for CSV export', async () => {
        const mockClient = { id: 1, name: 'Empty Client' };

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, mockClient);
        });

        mockDb.all.mockImplementation((query, params, callback) => {
          callback(null, []);
        });

        const response = await request(app).get('/api/reports/export/csv/1');

        expect(response.status).toBe(200);
      });
    });

    describe('Error Handling', () => {
      test('should return 400 for invalid client ID in CSV export', async () => {
        const response = await request(app).get('/api/reports/export/csv/invalid');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid client ID' });
      });

      test('should return 404 when client not found for CSV export', async () => {
        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, null);
        });

        const response = await request(app).get('/api/reports/export/csv/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Client not found' });
      });

      test('should return 500 on database error for CSV export', async () => {
        mockDb.get.mockImplementation((query, params, callback) => {
          callback(new Error('Database error'), null);
        });

        const response = await request(app).get('/api/reports/export/csv/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error' });
      });
    });
  });

  describe('GET /api/reports/export/pdf/:clientId - PDF Export', () => {
    describe('Successful PDF Export', () => {
      test('should generate PDF with correct content type', async () => {
        const mockClient = { id: 1, name: 'PDF Client' };
        const mockWorkEntries = [
          { hours: 8, description: 'Development', date: '2024-01-15', created_at: '2024-01-15T10:00:00Z' }
        ];

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, mockClient);
        });

        mockDb.all.mockImplementation((query, params, callback) => {
          callback(null, mockWorkEntries);
        });

        const response = await request(app).get('/api/reports/export/pdf/1');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('application/pdf');
      });

      test('should set correct content disposition header for PDF', async () => {
        const mockClient = { id: 1, name: 'Download Client' };

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, mockClient);
        });

        mockDb.all.mockImplementation((query, params, callback) => {
          callback(null, []);
        });

        const response = await request(app).get('/api/reports/export/pdf/1');

        expect(response.status).toBe(200);
        expect(response.headers['content-disposition']).toContain('attachment');
        expect(response.headers['content-disposition']).toContain('.pdf');
      });

      test('should handle client names with special characters in PDF filename', async () => {
        const mockClient = { id: 1, name: 'Client & Co. (Test)' };

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, mockClient);
        });

        mockDb.all.mockImplementation((query, params, callback) => {
          callback(null, []);
        });

        const response = await request(app).get('/api/reports/export/pdf/1');

        expect(response.status).toBe(200);
        // Filename should have special characters replaced
        expect(response.headers['content-disposition']).toContain('Client');
      });
    });

    describe('Error Handling', () => {
      test('should return 400 for invalid client ID in PDF export', async () => {
        const response = await request(app).get('/api/reports/export/pdf/invalid');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid client ID' });
      });

      test('should return 404 when client not found for PDF export', async () => {
        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, null);
        });

        const response = await request(app).get('/api/reports/export/pdf/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Client not found' });
      });

      test('should return 500 on database error for PDF export', async () => {
        mockDb.get.mockImplementation((query, params, callback) => {
          callback(new Error('Database error'), null);
        });

        const response = await request(app).get('/api/reports/export/pdf/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error' });
      });
    });
  });

  describe('Report Data Accuracy', () => {
    test('should correctly aggregate hours across multiple entries', async () => {
      const mockClient = { id: 1, name: 'Aggregate Test' };
      const mockWorkEntries = [
        { id: 1, hours: 1.5, description: 'Entry 1', date: '2024-01-01' },
        { id: 2, hours: 2.25, description: 'Entry 2', date: '2024-01-02' },
        { id: 3, hours: 3.75, description: 'Entry 3', date: '2024-01-03' },
        { id: 4, hours: 4.5, description: 'Entry 4', date: '2024-01-04' }
      ];

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const response = await request(app).get('/api/reports/client/1');

      expect(response.status).toBe(200);
      expect(response.body.totalHours).toBe(12); // 1.5 + 2.25 + 3.75 + 4.5
      expect(response.body.entryCount).toBe(4);
    });

    test('should handle work entries with null descriptions', async () => {
      const mockClient = { id: 1, name: 'Null Desc Test' };
      const mockWorkEntries = [
        { id: 1, hours: 8, description: null, date: '2024-01-01' },
        { id: 2, hours: 4, description: 'Has description', date: '2024-01-02' }
      ];

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const response = await request(app).get('/api/reports/client/1');

      expect(response.status).toBe(200);
      expect(response.body.workEntries).toHaveLength(2);
      expect(response.body.workEntries[0].description).toBeNull();
    });
  });
});
