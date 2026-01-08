const { authenticateUser } = require('../../middleware/auth');
const { getDatabase } = require('../../database/init');

jest.mock('../../database/init');

describe('Auth Middleware', () => {
  let mockDb;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockDb = {
      get: jest.fn(),
      run: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);

    mockReq = {
      headers: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 401 if no email header provided', () => {
    authenticateUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'User email required in x-user-email header' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should return 400 for invalid email format', () => {
    mockReq.headers['x-user-email'] = 'invalid-email';

    authenticateUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid email format' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should return 400 for email without domain', () => {
    mockReq.headers['x-user-email'] = 'test@';

    authenticateUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid email format' });
  });

  test('should return 400 for email with spaces', () => {
    mockReq.headers['x-user-email'] = 'test @example.com';

    authenticateUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid email format' });
  });

  test('should call next for existing user', (done) => {
    mockReq.headers['x-user-email'] = 'test@example.com';

    mockDb.get.mockImplementation((query, params, callback) => {
      callback(null, { email: 'test@example.com' });
    });

    authenticateUser(mockReq, mockRes, mockNext);

    setImmediate(() => {
      expect(mockReq.userEmail).toBe('test@example.com');
      expect(mockNext).toHaveBeenCalled();
      done();
    });
  });

  test('should create new user and call next when user does not exist', (done) => {
    mockReq.headers['x-user-email'] = 'newuser@example.com';

    mockDb.get.mockImplementation((query, params, callback) => {
      callback(null, null); // User doesn't exist
    });

    mockDb.run.mockImplementation((query, params, callback) => {
      callback(null); // User created successfully
    });

    authenticateUser(mockReq, mockRes, mockNext);

    setImmediate(() => {
      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO users (email) VALUES (?)',
        ['newuser@example.com'],
        expect.any(Function)
      );
      expect(mockReq.userEmail).toBe('newuser@example.com');
      expect(mockNext).toHaveBeenCalled();
      done();
    });
  });

  test('should return 500 on database error when checking user', (done) => {
    mockReq.headers['x-user-email'] = 'test@example.com';

    mockDb.get.mockImplementation((query, params, callback) => {
      callback(new Error('Database error'), null);
    });

    authenticateUser(mockReq, mockRes, mockNext);

    setImmediate(() => {
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(mockNext).not.toHaveBeenCalled();
      done();
    });
  });

  test('should return 500 on database error when creating user', (done) => {
    mockReq.headers['x-user-email'] = 'newuser@example.com';

    mockDb.get.mockImplementation((query, params, callback) => {
      callback(null, null); // User doesn't exist
    });

    mockDb.run.mockImplementation((query, params, callback) => {
      callback(new Error('Insert failed'));
    });

    authenticateUser(mockReq, mockRes, mockNext);

    setImmediate(() => {
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to create user' });
      expect(mockNext).not.toHaveBeenCalled();
      done();
    });
  });

  test('should handle email with valid special characters', (done) => {
    mockReq.headers['x-user-email'] = 'test.user+tag@example.co.uk';

    mockDb.get.mockImplementation((query, params, callback) => {
      callback(null, { email: 'test.user+tag@example.co.uk' });
    });

    authenticateUser(mockReq, mockRes, mockNext);

    setImmediate(() => {
      expect(mockReq.userEmail).toBe('test.user+tag@example.co.uk');
      expect(mockNext).toHaveBeenCalled();
      done();
    });
  });
});
