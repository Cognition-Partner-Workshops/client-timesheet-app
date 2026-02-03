const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../../middleware/auth');
const { getDatabase } = require('../../database/init');

jest.mock('../../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

describe('Authentication Middleware', () => {
  let req, res, next, mockDb;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    mockDb = {
      get: jest.fn()
    };
    
    getDatabase.mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Header Validation', () => {
    test('should return 401 if Authorization header is missing', () => {
      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authorization header required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if Authorization header format is invalid', () => {
      req.headers['authorization'] = 'InvalidFormat token123';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid authorization format. Use: Bearer <token>'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if token is missing after Bearer', () => {
      req.headers['authorization'] = 'Bearer';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid authorization format. Use: Bearer <token>'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('JWT Token Validation', () => {
    test('should return 401 for invalid JWT token', () => {
      req.headers['authorization'] = 'Bearer invalid-token';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for expired JWT token', () => {
      const expiredToken = jwt.sign(
        { email: 'test@example.com', sessionId: 'session123' },
        JWT_SECRET,
        { expiresIn: '-1h' }
      );
      req.headers['authorization'] = `Bearer ${expiredToken}`;

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token expired'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Session Validation', () => {
    test('should return 401 if session not found in database', (done) => {
      const validToken = jwt.sign(
        { email: 'test@example.com', sessionId: 'session123' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      req.headers['authorization'] = `Bearer ${validToken}`;

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null); // Session not found
      });

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Session expired or invalid'
        });
        expect(next).not.toHaveBeenCalled();
        done();
      });
    });

    test('should handle database error when checking session', (done) => {
      const validToken = jwt.sign(
        { email: 'test@example.com', sessionId: 'session123' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      req.headers['authorization'] = `Bearer ${validToken}`;

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Internal server error'
        });
        expect(next).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('User Validation', () => {
    test('should return 401 if user not found in database', (done) => {
      const validToken = jwt.sign(
        { email: 'test@example.com', sessionId: 'session123' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      req.headers['authorization'] = `Bearer ${validToken}`;

      // First call for session check - returns valid session
      // Second call for user check - returns null (user not found)
      mockDb.get
        .mockImplementationOnce((query, params, callback) => {
          callback(null, { id: 'session123', user_email: 'test@example.com', token: validToken });
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(null, null); // User not found
        });

      authenticateUser(req, res, next);

      setTimeout(() => {
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'User not found'
        });
        expect(next).not.toHaveBeenCalled();
        done();
      }, 50);
    });

    test('should handle database error when checking user', (done) => {
      const validToken = jwt.sign(
        { email: 'test@example.com', sessionId: 'session123' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      req.headers['authorization'] = `Bearer ${validToken}`;

      mockDb.get
        .mockImplementationOnce((query, params, callback) => {
          callback(null, { id: 'session123', user_email: 'test@example.com', token: validToken });
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(new Error('Database error'), null);
        });

      authenticateUser(req, res, next);

      setTimeout(() => {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Internal server error'
        });
        expect(next).not.toHaveBeenCalled();
        done();
      }, 50);
    });
  });

  describe('Successful Authentication', () => {
    test('should authenticate valid user and call next()', (done) => {
      const validToken = jwt.sign(
        { email: 'test@example.com', sessionId: 'session123' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      req.headers['authorization'] = `Bearer ${validToken}`;

      mockDb.get
        .mockImplementationOnce((query, params, callback) => {
          callback(null, { id: 'session123', user_email: 'test@example.com', token: validToken });
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(null, { email: 'test@example.com' });
        });

      authenticateUser(req, res, next);

      setTimeout(() => {
        expect(req.userEmail).toBe('test@example.com');
        expect(req.sessionId).toBe('session123');
        expect(req.token).toBe(validToken);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        done();
      }, 50);
    });
  });
});
