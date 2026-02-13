const sqlite3 = require('sqlite3');

jest.mock('sqlite3', () => {
  const mockDatabase = {
    serialize: jest.fn((callback) => callback()),
    run: jest.fn((query, callback) => {
      if (typeof callback === 'function') callback(null);
    }),
    close: jest.fn((callback) => callback(null))
  };

  const verboseResult = {
    Database: jest.fn((path, callback) => {
      callback(null);
      return mockDatabase;
    })
  };

  return {
    verbose: jest.fn(() => verboseResult)
  };
});

describe('Database Initialization - Comprehensive Coverage', () => {
  let consoleLogSpy, consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.resetModules();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('closeDatabase - Promise behavior', () => {
    test('should return a promise', () => {
      const { getDatabase, closeDatabase } = require('../../database/init');
      getDatabase();
      const result = closeDatabase();
      expect(result).toBeInstanceOf(Promise);
    });

    test('should resolve when database is closed successfully', async () => {
      const { getDatabase, closeDatabase } = require('../../database/init');
      getDatabase();
      await expect(closeDatabase()).resolves.toBeUndefined();
    });

    test('should resolve when no database connection exists', async () => {
      const { closeDatabase } = require('../../database/init');
      await expect(closeDatabase()).resolves.toBeUndefined();
    });

    test('should resolve when database is already closed', async () => {
      const { getDatabase, closeDatabase } = require('../../database/init');
      getDatabase();
      await closeDatabase();
      await expect(closeDatabase()).resolves.toBeUndefined();
    });
  });

  describe('closeDatabase - Error handling', () => {
    test('should handle close error and still resolve', async () => {
      jest.resetModules();

      jest.doMock('sqlite3', () => {
        const mockDb = {
          serialize: jest.fn((cb) => cb()),
          run: jest.fn((q, cb) => { if (typeof cb === 'function') cb(null); }),
          close: jest.fn((callback) => callback(new Error('Close failed')))
        };

        return {
          verbose: jest.fn(() => ({
            Database: jest.fn((path, callback) => {
              callback(null);
              return mockDb;
            })
          }))
        };
      });

      const { getDatabase, closeDatabase } = require('../../database/init');
      getDatabase();
      await expect(closeDatabase()).resolves.toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing database:', expect.any(Error));
    });
  });

  describe('getDatabase - Singleton Reset', () => {
    test('should create new database after close and reopen', async () => {
      const { getDatabase, closeDatabase } = require('../../database/init');
      const db1 = getDatabase();
      await closeDatabase();
      const db2 = getDatabase();
      expect(db1).toBeDefined();
      expect(db2).toBeDefined();
    });
  });

  describe('initializeDatabase - Table creation', () => {
    test('should create tables with foreign key constraints', async () => {
      const { getDatabase, initializeDatabase } = require('../../database/init');
      const db = getDatabase();
      await initializeDatabase();
      const runCalls = db.run.mock.calls;
      const queries = runCalls.map(call => call[0]);
      expect(queries.some(q => q.includes('ON DELETE CASCADE'))).toBe(true);
    });

    test('should create clients table with department and email columns', async () => {
      const { getDatabase, initializeDatabase } = require('../../database/init');
      const db = getDatabase();
      await initializeDatabase();
      const clientsQuery = db.run.mock.calls.find(call =>
        call[0].includes('CREATE TABLE IF NOT EXISTS clients')
      );
      expect(clientsQuery).toBeDefined();
      expect(clientsQuery[0]).toContain('department TEXT');
      expect(clientsQuery[0]).toContain('email TEXT');
    });

    test('should create work_entries table with hours decimal precision', async () => {
      const { getDatabase, initializeDatabase } = require('../../database/init');
      const db = getDatabase();
      await initializeDatabase();
      const workEntriesQuery = db.run.mock.calls.find(call =>
        call[0].includes('CREATE TABLE IF NOT EXISTS work_entries')
      );
      expect(workEntriesQuery).toBeDefined();
      expect(workEntriesQuery[0]).toContain('DECIMAL(5,2)');
    });

    test('should create work_entries table with date column', async () => {
      const { getDatabase, initializeDatabase } = require('../../database/init');
      const db = getDatabase();
      await initializeDatabase();
      const workEntriesQuery = db.run.mock.calls.find(call =>
        call[0].includes('CREATE TABLE IF NOT EXISTS work_entries')
      );
      expect(workEntriesQuery).toBeDefined();
      expect(workEntriesQuery[0]).toContain('date DATE NOT NULL');
    });

    test('should create users table with created_at timestamp default', async () => {
      const { getDatabase, initializeDatabase } = require('../../database/init');
      const db = getDatabase();
      await initializeDatabase();
      const usersQuery = db.run.mock.calls.find(call =>
        call[0].includes('CREATE TABLE IF NOT EXISTS users')
      );
      expect(usersQuery).toBeDefined();
      expect(usersQuery[0]).toContain('CURRENT_TIMESTAMP');
    });

    test('should create clients table with updated_at timestamp', async () => {
      const { getDatabase, initializeDatabase } = require('../../database/init');
      const db = getDatabase();
      await initializeDatabase();
      const clientsQuery = db.run.mock.calls.find(call =>
        call[0].includes('CREATE TABLE IF NOT EXISTS clients')
      );
      expect(clientsQuery).toBeDefined();
      expect(clientsQuery[0]).toContain('updated_at DATETIME DEFAULT CURRENT_TIMESTAMP');
    });

    test('should create performance indexes', async () => {
      const { getDatabase, initializeDatabase } = require('../../database/init');
      const db = getDatabase();
      await initializeDatabase();
      const queries = db.run.mock.calls.map(call => call[0]);
      expect(queries.some(q => q.includes('idx_clients_user_email'))).toBe(true);
      expect(queries.some(q => q.includes('idx_work_entries_client_id'))).toBe(true);
      expect(queries.some(q => q.includes('idx_work_entries_user_email'))).toBe(true);
      expect(queries.some(q => q.includes('idx_work_entries_date'))).toBe(true);
    });
  });

  describe('getDatabase - Memory path', () => {
    test('should use in-memory database path', () => {
      jest.resetModules();

      const pathUsed = [];
      jest.doMock('sqlite3', () => {
        const mockDb = {
          serialize: jest.fn((cb) => cb()),
          run: jest.fn((q, cb) => { if (typeof cb === 'function') cb(null); }),
          close: jest.fn((cb) => cb(null))
        };
        return {
          verbose: jest.fn(() => ({
            Database: jest.fn((path, callback) => {
              pathUsed.push(path);
              callback(null);
              return mockDb;
            })
          }))
        };
      });

      const { getDatabase } = require('../../database/init');
      getDatabase();
      expect(pathUsed).toContain(':memory:');
    });
  });
});
