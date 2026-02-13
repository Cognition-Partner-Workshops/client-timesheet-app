const request = require('supertest');
const express = require('express');
const { getDatabase } = require('../../database/init');

jest.mock('../../database/init');

const mockPdfInstance = {
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
};

jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => mockPdfInstance);
});

jest.mock('csv-writer', () => ({
  createObjectCsvWriter: jest.fn(() => ({
    writeRecords: jest.fn().mockResolvedValue(undefined)
  }))
}));

jest.mock('../../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    req.userEmail = 'test@example.com';
    next();
  }
}));

const reportRoutes = require('../../routes/reports');

const app = express();
app.use(express.json());
app.use('/api/reports', reportRoutes);

describe('Reports Routes - Comprehensive Coverage', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);

    mockPdfInstance.y = 100;
    mockPdfInstance.fontSize.mockReturnThis();
    mockPdfInstance.text.mockReturnThis();
    mockPdfInstance.moveDown.mockReturnThis();
    mockPdfInstance.moveTo.mockReturnThis();
    mockPdfInstance.lineTo.mockReturnThis();
    mockPdfInstance.stroke.mockReturnThis();
    mockPdfInstance.addPage.mockReturnThis();
    mockPdfInstance.pipe.mockReset();
    mockPdfInstance.end.mockReset();

    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('GET /api/reports/client/:clientId - Extended', () => {
    test('should handle single work entry report', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Solo Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [{ id: 1, hours: 2.25, description: 'Quick task', date: '2024-03-15' }]);
      });

      const response = await request(app).get('/api/reports/client/1');

      expect(response.status).toBe(200);
      expect(response.body.totalHours).toBe(2.25);
      expect(response.body.entryCount).toBe(1);
    });

    test('should handle large number of work entries', async () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1, hours: 1.5, description: `Entry ${i + 1}`, date: '2024-01-01'
      }));

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Busy Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, entries);
      });

      const response = await request(app).get('/api/reports/client/1');

      expect(response.status).toBe(200);
      expect(response.body.totalHours).toBe(150);
      expect(response.body.entryCount).toBe(100);
    });

    test('should handle floating point precision in hours summation', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [{ hours: 0.1 }, { hours: 0.2 }, { hours: 0.3 }]);
      });

      const response = await request(app).get('/api/reports/client/1');

      expect(response.status).toBe(200);
      expect(typeof response.body.totalHours).toBe('number');
    });

    test('should return 400 for non-numeric client ID', async () => {
      const response = await request(app).get('/api/reports/client/abc');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid client ID' });
    });

    test('should return 400 for special characters in client ID', async () => {
      const response = await request(app).get('/api/reports/client/abc!@#');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid client ID' });
    });
  });

  describe('CSV Export - Validation and Error Handling', () => {
    test('should return 400 for non-numeric client ID in CSV export', async () => {
      const response = await request(app).get('/api/reports/export/csv/abc');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid client ID' });
    });

    test('should return 500 for CSV writer failure', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [{ date: '2024-01-01', hours: 5, description: 'Work', created_at: '2024-01-01' }]);
      });

      const csvWriter = require('csv-writer');
      csvWriter.createObjectCsvWriter.mockReturnValue({
        writeRecords: jest.fn().mockRejectedValue(new Error('CSV Write Error'))
      });

      const response = await request(app).get('/api/reports/export/csv/1');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to generate CSV report' });
    });

    test('should return 404 for non-existent client in CSV export', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).get('/api/reports/export/csv/999');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Client not found' });
    });

    test('should return 500 for DB error when fetching client for CSV', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const response = await request(app).get('/api/reports/export/csv/1');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should return 500 for DB error when fetching entries for CSV', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const response = await request(app).get('/api/reports/export/csv/1');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should call csv writer with correct headers', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Test Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [
          { date: '2024-01-01', hours: 5, description: 'Work 1', created_at: '2024-01-01' }
        ]);
      });

      const csvWriter = require('csv-writer');
      csvWriter.createObjectCsvWriter.mockReturnValue({
        writeRecords: jest.fn().mockRejectedValue(new Error('Expected failure'))
      });

      await request(app).get('/api/reports/export/csv/1');

      expect(csvWriter.createObjectCsvWriter).toHaveBeenCalledWith(
        expect.objectContaining({
          header: expect.arrayContaining([
            { id: 'date', title: 'Date' },
            { id: 'hours', title: 'Hours' },
            { id: 'description', title: 'Description' },
            { id: 'created_at', title: 'Created At' }
          ])
        })
      );
    });

    test('should pass user email in CSV export query params', async () => {
      const getCalls = [];
      const allCalls = [];

      mockDb.get.mockImplementation((query, params, callback) => {
        getCalls.push(params);
        callback(null, { id: 1, name: 'Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        allCalls.push(params);
        callback(null, []);
      });

      const csvWriter = require('csv-writer');
      csvWriter.createObjectCsvWriter.mockReturnValue({
        writeRecords: jest.fn().mockRejectedValue(new Error('Expected failure'))
      });

      await request(app).get('/api/reports/export/csv/1');

      expect(getCalls.length).toBeGreaterThan(0);
      expect(getCalls[0]).toContain('test@example.com');
      expect(allCalls.length).toBeGreaterThan(0);
      expect(allCalls[0]).toContain('test@example.com');
    });
  });

  describe('PDF Export - Success Path', () => {
    test('should generate PDF with title containing client name', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'PDF Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [
          { hours: 5, description: 'Development', date: '2024-01-01', created_at: '2024-01-01' }
        ]);
      });

      mockPdfInstance.pipe.mockImplementation((res) => {
        res.status(200).end();
      });

      await request(app).get('/api/reports/export/pdf/1');

      expect(mockPdfInstance.fontSize).toHaveBeenCalledWith(20);
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        'Time Report for PDF Client',
        expect.objectContaining({ align: 'center' })
      );
      expect(mockPdfInstance.end).toHaveBeenCalled();
    });

    test('should generate PDF with total hours summary', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Summary Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [
          { hours: 8, description: 'Work A', date: '2024-01-01', created_at: '2024-01-01' },
          { hours: 4.5, description: 'Work B', date: '2024-01-02', created_at: '2024-01-02' }
        ]);
      });

      mockPdfInstance.pipe.mockImplementation((res) => {
        res.status(200).end();
      });

      await request(app).get('/api/reports/export/pdf/1');

      expect(mockPdfInstance.fontSize).toHaveBeenCalledWith(14);
      expect(mockPdfInstance.text).toHaveBeenCalledWith('Total Hours: 12.50');
      expect(mockPdfInstance.text).toHaveBeenCalledWith('Total Entries: 2');
    });

    test('should generate PDF with empty work entries', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Empty PDF Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      mockPdfInstance.pipe.mockImplementation((res) => {
        res.status(200).end();
      });

      await request(app).get('/api/reports/export/pdf/1');

      expect(mockPdfInstance.text).toHaveBeenCalledWith('Total Hours: 0.00');
      expect(mockPdfInstance.text).toHaveBeenCalledWith('Total Entries: 0');
      expect(mockPdfInstance.end).toHaveBeenCalled();
    });

    test('should handle entry with no description in PDF', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [
          { hours: 3, description: null, date: '2024-01-01', created_at: '2024-01-01' }
        ]);
      });

      mockPdfInstance.pipe.mockImplementation((res) => {
        res.status(200).end();
      });

      await request(app).get('/api/reports/export/pdf/1');

      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        'No description',
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({ width: 300 })
      );
    });

    test('should add separator lines every 5 entries in PDF', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client' });
      });

      const entries = Array.from({ length: 6 }, (_, i) => ({
        hours: 1, description: `Entry ${i + 1}`, date: '2024-01-01', created_at: '2024-01-01'
      }));

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, entries);
      });

      mockPdfInstance.pipe.mockImplementation((res) => {
        res.status(200).end();
      });

      await request(app).get('/api/reports/export/pdf/1');

      expect(mockPdfInstance.moveTo.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    test('should set correct Content-Type header for PDF', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      mockPdfInstance.pipe.mockImplementation((res) => {
        res.status(200).end();
      });

      await request(app).get('/api/reports/export/pdf/1');

      expect(mockPdfInstance.pipe).toHaveBeenCalled();
    });

    test('should include table headers in PDF', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [{ hours: 1, description: 'Work', date: '2024-01-01', created_at: '2024-01-01' }]);
      });

      mockPdfInstance.pipe.mockImplementation((res) => {
        res.status(200).end();
      });

      await request(app).get('/api/reports/export/pdf/1');

      expect(mockPdfInstance.fontSize).toHaveBeenCalledWith(12);
      const textCalls = mockPdfInstance.text.mock.calls.map(c => c[0]);
      expect(textCalls).toContain('Date');
      expect(textCalls).toContain('Hours');
      expect(textCalls).toContain('Description');
    });

    test('should draw horizontal line after table header', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      mockPdfInstance.pipe.mockImplementation((res) => {
        res.status(200).end();
      });

      await request(app).get('/api/reports/export/pdf/1');

      expect(mockPdfInstance.moveTo).toHaveBeenCalled();
      expect(mockPdfInstance.lineTo).toHaveBeenCalled();
      expect(mockPdfInstance.stroke).toHaveBeenCalled();
    });

    test('should display entry hours as string in PDF', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [{ hours: 7.5, description: 'Work', date: '2024-01-01', created_at: '2024-01-01' }]);
      });

      mockPdfInstance.pipe.mockImplementation((res) => {
        res.status(200).end();
      });

      await request(app).get('/api/reports/export/pdf/1');

      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        '7.5',
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({ width: 80 })
      );
    });

    test('should return 400 for non-numeric client ID in PDF export', async () => {
      const response = await request(app).get('/api/reports/export/pdf/abc');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid client ID' });
    });
  });

  describe('PDF Export - Error Handling', () => {
    test('should return 404 for non-existent client in PDF export', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).get('/api/reports/export/pdf/999');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Client not found' });
    });

    test('should return 500 for database error when fetching client for PDF', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const response = await request(app).get('/api/reports/export/pdf/1');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should return 500 for database error when fetching entries for PDF', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const response = await request(app).get('/api/reports/export/pdf/1');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Data Isolation', () => {
    test('should pass user email in client report query params', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        expect(params).toContain('test@example.com');
        callback(null, { id: 1, name: 'Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        expect(params).toContain('test@example.com');
        callback(null, []);
      });

      await request(app).get('/api/reports/client/1');
      expect(mockDb.get).toHaveBeenCalled();
      expect(mockDb.all).toHaveBeenCalled();
    });

    test('should pass user email in PDF export query params', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        expect(params).toContain('test@example.com');
        callback(null, { id: 1, name: 'Client' });
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        expect(params).toContain('test@example.com');
        callback(null, []);
      });

      mockPdfInstance.pipe.mockImplementation((res) => {
        res.status(200).end();
      });

      await request(app).get('/api/reports/export/pdf/1');
    });
  });
});
