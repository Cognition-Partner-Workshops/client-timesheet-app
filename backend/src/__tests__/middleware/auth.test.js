const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../../middleware/auth');
const { getDatabase } = require('../../database/init');

jest.mock('../../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to generate valid JWT token for testing
const generateTestToken = (email) => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
};

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
      get: jest.fn(),
      run: jest.fn()
    };
    
    getDatabase.mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Header Validation', () => {
    test('should return 401 if authorization header is missing', () => {
      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authorization header required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if authorization format is invalid', () => {
      req.headers['authorization'] = 'InvalidFormat token123';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid authorization format. Use: Bearer <token>'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if only token is provided without Bearer', () => {
      req.headers['authorization'] = 'sometoken';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid authorization format. Use: Bearer <token>'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should accept valid Bearer token format', (done) => {
      const token = generateTestToken('test@example.com');
      req.headers['authorization'] = `Bearer ${token}`;
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: 'test@example.com' });
      });

      authenticateUser(req, res, next);

      // Token verification is async, so we need to wait
      setImmediate(() => {
        expect(mockDb.get).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('JWT Token Validation', () => {
    test('should return 401 for invalid token', (done) => {
      req.headers['authorization'] = 'Bearer invalid.token.here';

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Invalid token'
        });
        expect(next).not.toHaveBeenCalled();
        expect(mockDb.get).not.toHaveBeenCalled();
        done();
      });
    });

    test('should return 401 for expired token', (done) => {
      const expiredToken = jwt.sign({ email: 'test@example.com' }, JWT_SECRET, { expiresIn: '-1s' });
      req.headers['authorization'] = `Bearer ${expiredToken}`;

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Token expired'
        });
        expect(next).not.toHaveBeenCalled();
        done();
      });
    });

    test('should return 400 for token with invalid email format', (done) => {
      const tokenWithInvalidEmail = jwt.sign({ email: 'invalid-email' }, JWT_SECRET, { expiresIn: '24h' });
      req.headers['authorization'] = `Bearer ${tokenWithInvalidEmail}`;

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Invalid email format in token'
        });
        expect(next).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Existing User Authentication', () => {
    test('should authenticate existing user and call next()', (done) => {
      const token = generateTestToken('existing@example.com');
      req.headers['authorization'] = `Bearer ${token}`;
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: 'existing@example.com' });
      });

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(req.userEmail).toBe('existing@example.com');
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        done();
      });
    });

    test('should handle database error when checking user', (done) => {
      const token = generateTestToken('test@example.com');
      req.headers['authorization'] = `Bearer ${token}`;
      
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

    test('should return 401 if user not found in database', (done) => {
      const token = generateTestToken('nonexistent@example.com');
      req.headers['authorization'] = `Bearer ${token}`;
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null); // User doesn't exist
      });

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'User not found'
        });
        expect(next).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Email Format Edge Cases in Token', () => {
    test('should reject token with email without @', (done) => {
      const token = jwt.sign({ email: 'notanemail' }, JWT_SECRET, { expiresIn: '24h' });
      req.headers['authorization'] = `Bearer ${token}`;
      
      authenticateUser(req, res, next);
      
      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(400);
        done();
      });
    });

    test('should reject token with email without domain', (done) => {
      const token = jwt.sign({ email: 'test@' }, JWT_SECRET, { expiresIn: '24h' });
      req.headers['authorization'] = `Bearer ${token}`;
      
      authenticateUser(req, res, next);
      
      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(400);
        done();
      });
    });

    test('should reject token with email without TLD', (done) => {
      const token = jwt.sign({ email: 'test@domain' }, JWT_SECRET, { expiresIn: '24h' });
      req.headers['authorization'] = `Bearer ${token}`;
      
      authenticateUser(req, res, next);
      
      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(400);
        done();
      });
    });

    test('should accept token with email with subdomain', (done) => {
      const token = generateTestToken('test@mail.example.com');
      req.headers['authorization'] = `Bearer ${token}`;
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: 'test@mail.example.com' });
      });

      authenticateUser(req, res, next);
      
      setImmediate(() => {
        expect(mockDb.get).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        done();
      });
    });
  });
});
