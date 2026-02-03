const express = require('express');

/**
 * Creates a mock database object with common SQLite methods
 * @returns {Object} Mock database with all, get, and run methods
 */
function createMockDatabase() {
  return {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn()
  };
}

/**
 * Creates a mock PDFDocument that properly simulates streaming behavior
 * @param {Object} options - Configuration options
 * @param {number} options.y - Initial y position (default: 100, use 750+ to trigger page breaks)
 * @returns {Object} Mock PDFDocument instance
 */
function createMockPDFDocument(options = {}) {
  const { y = 100 } = options;
  
  const mockDoc = {
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    addPage: jest.fn().mockReturnThis(),
    pipe: jest.fn().mockImplementation((res) => {
      mockDoc._res = res;
      return mockDoc;
    }),
    end: jest.fn().mockImplementation(() => {
      if (mockDoc._res && mockDoc._res.end) {
        mockDoc._res.end();
      }
    }),
    y,
    _res: null
  };
  
  return mockDoc;
}

/**
 * Creates a mock CSV writer
 * @param {Object} options - Configuration options
 * @param {boolean} options.shouldFail - Whether writeRecords should reject
 * @param {Error} options.error - Custom error to reject with
 * @returns {Object} Mock CSV writer factory
 */
function createMockCsvWriter(options = {}) {
  const { shouldFail = false, error = new Error('Write failed') } = options;
  
  return {
    createObjectCsvWriter: jest.fn(() => ({
      writeRecords: shouldFail 
        ? jest.fn().mockRejectedValue(error)
        : jest.fn().mockResolvedValue(undefined)
    }))
  };
}

/**
 * Creates a mock authentication middleware
 * @param {string} userEmail - Email to set on req.userEmail (default: 'test@example.com')
 * @returns {Object} Mock auth middleware module
 */
function createMockAuthMiddleware(userEmail = 'test@example.com') {
  return {
    authenticateUser: (req, res, next) => {
      req.userEmail = userEmail;
      next();
    }
  };
}

/**
 * Creates an Express app with common middleware and error handling
 * @param {Object} routes - Route handler to mount
 * @param {string} basePath - Base path for routes (e.g., '/api/clients')
 * @returns {Object} Configured Express app
 */
function createTestApp(routes, basePath) {
  const app = express();
  app.use(express.json());
  app.use(basePath, routes);
  
  app.use((err, req, res, next) => {
    if (err.isJoi) {
      return res.status(400).json({ error: 'Validation error' });
    }
    res.status(500).json({ error: 'Internal server error' });
  });
  
  return app;
}

/**
 * Creates mock fs methods for file operations
 * @param {Object} options - Configuration options
 * @param {boolean} options.dirExists - Whether existsSync returns true
 * @param {Error} options.unlinkError - Error for unlink callback (null for success)
 * @returns {Object} Mock fs methods to assign
 */
function createMockFs(options = {}) {
  const { dirExists = true, unlinkError = null } = options;
  
  return {
    existsSync: jest.fn().mockReturnValue(dirExists),
    mkdirSync: jest.fn(),
    unlink: jest.fn((path, callback) => callback(unlinkError))
  };
}

/**
 * Helper to setup database mock to return a client
 * @param {Object} mockDb - Mock database object
 * @param {Object|null} client - Client to return (null for not found)
 * @param {Error|null} error - Error to return
 */
function mockDbGetClient(mockDb, client, error = null) {
  mockDb.get.mockImplementation((query, params, callback) => {
    callback(error, client);
  });
}

/**
 * Helper to setup database mock to return work entries
 * @param {Object} mockDb - Mock database object
 * @param {Array} entries - Work entries to return
 * @param {Error|null} error - Error to return
 */
function mockDbGetWorkEntries(mockDb, entries, error = null) {
  mockDb.all.mockImplementation((query, params, callback) => {
    callback(error, entries);
  });
}

/**
 * Helper to setup database mock for successful insert with lastID
 * @param {Object} mockDb - Mock database object
 * @param {number} lastID - ID to return as lastID
 * @param {Error|null} error - Error to return
 */
function mockDbInsert(mockDb, lastID, error = null) {
  mockDb.run.mockImplementation(function(query, params, callback) {
    if (error) {
      callback(error);
    } else {
      this.lastID = lastID;
      callback.call(this, null);
    }
  });
}

/**
 * Sample test data factories
 */
const testData = {
  createClient: (overrides = {}) => ({
    id: 1,
    name: 'Test Client',
    description: 'Test Description',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    ...overrides
  }),
  
  createWorkEntry: (overrides = {}) => ({
    id: 1,
    client_id: 1,
    hours: 5,
    description: 'Test work',
    date: '2024-01-01',
    created_at: '2024-01-01',
    client_name: 'Test Client',
    ...overrides
  }),
  
  createWorkEntries: (count, baseOverrides = {}) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      client_id: 1,
      hours: i + 1,
      description: `Work ${i + 1}`,
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      created_at: `2024-01-${String(i + 1).padStart(2, '0')}`,
      client_name: 'Test Client',
      ...baseOverrides
    }));
  }
};

module.exports = {
  createMockDatabase,
  createMockPDFDocument,
  createMockCsvWriter,
  createMockAuthMiddleware,
  createTestApp,
  createMockFs,
  mockDbGetClient,
  mockDbGetWorkEntries,
  mockDbInsert,
  testData
};
