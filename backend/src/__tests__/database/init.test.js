const mockQuery = jest.fn();
const mockEnd = jest.fn();
const mockOn = jest.fn();

const mockPool = {
  query: mockQuery,
  end: mockEnd,
  on: mockOn
};

jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPool)
}));

const { getDatabase, initializeDatabase, closeDatabase, checkDatabaseHealth } = require('../../database/init');

describe('Database Initialization', () => {
  let consoleLogSpy, consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockQuery.mockReset();
    mockEnd.mockReset();
    mockOn.mockReset();
    mockQuery.mockResolvedValue({ rows: [] });
    mockEnd.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('getDatabase', () => {
    test('should create and return database pool instance', () => {
      const db = getDatabase();
      
      expect(db).toBeDefined();
      expect(db.query).toBeDefined();
    });

    test('should return same database instance on multiple calls', () => {
      const db1 = getDatabase();
      const db2 = getDatabase();
      
      expect(db1).toBe(db2);
    });
  });

  describe('initializeDatabase', () => {
    test('should create all required tables', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      await initializeDatabase();

      expect(mockPool.query).toHaveBeenCalled();
      
      const queryCalls = mockPool.query.mock.calls;
      const queries = queryCalls.map(call => call[0]);
      
      expect(queries.some(q => q.includes('CREATE TABLE IF NOT EXISTS users'))).toBe(true);
      expect(queries.some(q => q.includes('CREATE TABLE IF NOT EXISTS clients'))).toBe(true);
      expect(queries.some(q => q.includes('CREATE TABLE IF NOT EXISTS work_entries'))).toBe(true);
    });

    test('should create indexes for performance', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      await initializeDatabase();

      const queryCalls = mockPool.query.mock.calls;
      const queries = queryCalls.map(call => call[0]);
      
      expect(queries.some(q => q.includes('CREATE INDEX IF NOT EXISTS idx_clients_user_email'))).toBe(true);
      expect(queries.some(q => q.includes('CREATE INDEX IF NOT EXISTS idx_work_entries_client_id'))).toBe(true);
      expect(queries.some(q => q.includes('CREATE INDEX IF NOT EXISTS idx_work_entries_user_email'))).toBe(true);
      expect(queries.some(q => q.includes('CREATE INDEX IF NOT EXISTS idx_work_entries_date'))).toBe(true);
    });

    test('should log success message', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      await initializeDatabase();
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Database tables and indexes created successfully');
    });

    test('should resolve promise on success', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      await expect(initializeDatabase()).resolves.toBeUndefined();
    });

    test('should throw error on database failure', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));
      
      await expect(initializeDatabase()).rejects.toThrow('Database error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('closeDatabase', () => {
    test('should close database connection pool', async () => {
      getDatabase();
      await closeDatabase();

      expect(mockPool.end).toHaveBeenCalled();
    });

    test('should handle close error gracefully', async () => {
      getDatabase();
      mockPool.end.mockRejectedValue(new Error('Close error'));

      await expect(closeDatabase()).rejects.toThrow('Close error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing database pool:', expect.any(Error));
    });
  });

  describe('checkDatabaseHealth', () => {
    test('should return true when database is healthy', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ health_check: 1 }] });
      
      const result = await checkDatabaseHealth();
      
      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT 1 as health_check');
    });

    test('should return false when database query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Connection failed'));
      
      const result = await checkDatabaseHealth();
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('should return false when no rows returned', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      const result = await checkDatabaseHealth();
      
      expect(result).toBe(false);
    });
  });

  describe('Database Schema', () => {
    test('users table should have correct structure', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      await initializeDatabase();

      const userTableQuery = mockPool.query.mock.calls.find(call => 
        call[0].includes('CREATE TABLE IF NOT EXISTS users')
      );

      expect(userTableQuery).toBeDefined();
      expect(userTableQuery[0]).toContain('email TEXT PRIMARY KEY');
      expect(userTableQuery[0]).toContain('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    });

    test('clients table should have foreign key to users', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      await initializeDatabase();

      const clientTableQuery = mockPool.query.mock.calls.find(call => 
        call[0].includes('CREATE TABLE IF NOT EXISTS clients')
      );

      expect(clientTableQuery).toBeDefined();
      expect(clientTableQuery[0]).toContain('user_email TEXT NOT NULL REFERENCES users(email)');
    });

    test('work_entries table should have foreign keys', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      await initializeDatabase();

      const workEntriesQuery = mockPool.query.mock.calls.find(call => 
        call[0].includes('CREATE TABLE IF NOT EXISTS work_entries')
      );

      expect(workEntriesQuery).toBeDefined();
      expect(workEntriesQuery[0]).toContain('client_id INTEGER NOT NULL REFERENCES clients(id)');
      expect(workEntriesQuery[0]).toContain('user_email TEXT NOT NULL REFERENCES users(email)');
    });
  });
});
