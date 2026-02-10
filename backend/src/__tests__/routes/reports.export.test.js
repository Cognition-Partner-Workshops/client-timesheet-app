const { getDatabase } = require('../../database/init');
const fs = require('fs');
const path = require('path');

jest.mock('../../database/init');
jest.mock('fs');

// Mock csv-writer
const mockWriteRecords = jest.fn();
jest.mock('csv-writer', () => ({
  createObjectCsvWriter: jest.fn(() => ({
    writeRecords: mockWriteRecords
  }))
}));

// Mock pdfkit with a proper stream implementation
const mockPdfDoc = {
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
  return jest.fn(() => mockPdfDoc);
});

// Import after mocking
const reportRoutes = require('../../routes/reports');
const express = require('express');

// Mock auth middleware
jest.mock('../../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    req.userEmail = 'test@example.com';
    next();
  }
}));

describe('Report Routes - Export Success Paths', () => {
  let mockDb;
  let consoleErrorSpy;

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
    
    // Reset mock implementations
    mockWriteRecords.mockReset();
    mockWriteRecords.mockResolvedValue(undefined);
    
    // Reset PDF mock
    mockPdfDoc.fontSize.mockReturnThis();
    mockPdfDoc.text.mockReturnThis();
    mockPdfDoc.moveDown.mockReturnThis();
    mockPdfDoc.moveTo.mockReturnThis();
    mockPdfDoc.lineTo.mockReturnThis();
    mockPdfDoc.stroke.mockReturnThis();
    mockPdfDoc.addPage.mockReturnThis();
    mockPdfDoc.pipe.mockReset();
    mockPdfDoc.end.mockReset();
    mockPdfDoc.y = 100;
    
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe('CSV Export - Download Success Path', () => {
    test('should successfully download CSV and clean up temp file', async () => {
      const mockClient = { id: 1, name: 'Test Client' };
      const mockWorkEntries = [
        { date: '2024-01-01', hours: 5, description: 'Work 1', created_at: '2024-01-01' }
      ];

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      // Create mock request and response
      const mockReq = {
        params: { clientId: '1' },
        userEmail: 'test@example.com'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        download: jest.fn((filePath, filename, callback) => {
          // Simulate successful download
          callback(null);
        })
      };

      // Get the route handler directly
      const app = express();
      app.use(express.json());
      
      // Manually invoke the route handler
      const routeHandler = reportRoutes.stack.find(
        layer => layer.route && layer.route.path === '/export/csv/:clientId'
      ).route.stack[0].handle;

      await new Promise((resolve) => {
        mockRes.download = jest.fn((filePath, filename, callback) => {
          callback(null);
          resolve();
        });
        routeHandler(mockReq, mockRes);
      });

      expect(mockRes.download).toHaveBeenCalled();
      expect(fs.unlink).toHaveBeenCalled();
    });

    test('should handle download error and still clean up temp file', async () => {
      const mockClient = { id: 1, name: 'Test Client' };
      const mockWorkEntries = [];

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const mockReq = {
        params: { clientId: '1' },
        userEmail: 'test@example.com'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        download: jest.fn()
      };

      const routeHandler = reportRoutes.stack.find(
        layer => layer.route && layer.route.path === '/export/csv/:clientId'
      ).route.stack[0].handle;

      await new Promise((resolve) => {
        mockRes.download = jest.fn((filePath, filename, callback) => {
          callback(new Error('Download failed'));
          resolve();
        });
        routeHandler(mockReq, mockRes);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending file:', expect.any(Error));
      expect(fs.unlink).toHaveBeenCalled();
    });

    test('should handle unlink error gracefully', async () => {
      const mockClient = { id: 1, name: 'Test Client' };
      const mockWorkEntries = [];

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      fs.unlink.mockImplementation((path, callback) => {
        callback(new Error('Unlink failed'));
      });

      const mockReq = {
        params: { clientId: '1' },
        userEmail: 'test@example.com'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        download: jest.fn()
      };

      const routeHandler = reportRoutes.stack.find(
        layer => layer.route && layer.route.path === '/export/csv/:clientId'
      ).route.stack[0].handle;

      await new Promise((resolve) => {
        mockRes.download = jest.fn((filePath, filename, callback) => {
          callback(null);
          setTimeout(resolve, 10); // Allow unlink callback to execute
        });
        routeHandler(mockReq, mockRes);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting temp file:', expect.any(Error));
    });
  });

  describe('PDF Export - Generation Success Path', () => {
    test('should generate PDF with work entries', async () => {
      const mockClient = { id: 1, name: 'Test Client' };
      const mockWorkEntries = [
        { date: '2024-01-01', hours: 5, description: 'Work 1', created_at: '2024-01-01' },
        { date: '2024-01-02', hours: 3, description: null, created_at: '2024-01-02' }
      ];

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const mockReq = {
        params: { clientId: '1' },
        userEmail: 'test@example.com'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn()
      };

      const routeHandler = reportRoutes.stack.find(
        layer => layer.route && layer.route.path === '/export/pdf/:clientId'
      ).route.stack[0].handle;

      routeHandler(mockReq, mockRes);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('attachment'));
      expect(mockPdfDoc.pipe).toHaveBeenCalledWith(mockRes);
      expect(mockPdfDoc.end).toHaveBeenCalled();
    });

    test('should handle null description in work entries', async () => {
      const mockClient = { id: 1, name: 'Test Client' };
      const mockWorkEntries = [
        { date: '2024-01-01', hours: 5, description: null, created_at: '2024-01-01' }
      ];

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const mockReq = {
        params: { clientId: '1' },
        userEmail: 'test@example.com'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn()
      };

      const routeHandler = reportRoutes.stack.find(
        layer => layer.route && layer.route.path === '/export/pdf/:clientId'
      ).route.stack[0].handle;

      routeHandler(mockReq, mockRes);

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify 'No description' is used for null description
      expect(mockPdfDoc.text).toHaveBeenCalledWith('No description', expect.any(Number), expect.any(Number), expect.any(Object));
    });

    test('should add page break when y exceeds 700', async () => {
      const mockClient = { id: 1, name: 'Test Client' };
      const mockWorkEntries = [
        { date: '2024-01-01', hours: 5, description: 'Work 1', created_at: '2024-01-01' }
      ];

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      // Set y to exceed 700 to trigger page break
      mockPdfDoc.y = 750;

      const mockReq = {
        params: { clientId: '1' },
        userEmail: 'test@example.com'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn()
      };

      const routeHandler = reportRoutes.stack.find(
        layer => layer.route && layer.route.path === '/export/pdf/:clientId'
      ).route.stack[0].handle;

      routeHandler(mockReq, mockRes);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockPdfDoc.addPage).toHaveBeenCalled();
    });

    test('should add separator line every 5 entries', async () => {
      const mockClient = { id: 1, name: 'Test Client' };
      const mockWorkEntries = Array.from({ length: 6 }, (_, i) => ({
        date: `2024-01-0${i + 1}`,
        hours: 5,
        description: `Work ${i + 1}`,
        created_at: `2024-01-0${i + 1}`
      }));

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const mockReq = {
        params: { clientId: '1' },
        userEmail: 'test@example.com'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn()
      };

      const routeHandler = reportRoutes.stack.find(
        layer => layer.route && layer.route.path === '/export/pdf/:clientId'
      ).route.stack[0].handle;

      routeHandler(mockReq, mockRes);

      await new Promise(resolve => setTimeout(resolve, 50));

      // Stroke should be called multiple times (header line + after 5th entry)
      expect(mockPdfDoc.stroke.mock.calls.length).toBeGreaterThan(1);
    });

    test('should generate PDF with empty work entries', async () => {
      const mockClient = { id: 1, name: 'Test Client' };
      const mockWorkEntries = [];

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockWorkEntries);
      });

      const mockReq = {
        params: { clientId: '1' },
        userEmail: 'test@example.com'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn()
      };

      const routeHandler = reportRoutes.stack.find(
        layer => layer.route && layer.route.path === '/export/pdf/:clientId'
      ).route.stack[0].handle;

      routeHandler(mockReq, mockRes);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockPdfDoc.end).toHaveBeenCalled();
    });
  });
});
