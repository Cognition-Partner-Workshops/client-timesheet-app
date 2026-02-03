const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../../middleware/auth');
const { getDatabase } = require('../../database/init');

jest.mock('../../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
        error: 'Invalid authorization header format. Use: Bearer <token>'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if only Bearer is provided without token', () => {
      req.headers['authorization'] = 'Bearer';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid authorization header format. Use: Bearer <token>'
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
      const expiredToken = jwt.sign({ email: 'test@example.com' }, JWT_SECRET, { expiresIn: '-1h' });
      req.headers['authorization'] = `Bearer ${expiredToken}`;

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token expired'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for token signed with wrong secret', () => {
      const wrongSecretToken = jwt.sign({ email: 'test@example.com' }, 'wrong-secret', { expiresIn: '1h' });
      req.headers['authorization'] = `Bearer ${wrongSecretToken}`;

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Existing User Authentication', () => {
    test('should authenticate existing user and call next()', (done) => {
      const validToken = jwt.sign({ email: 'existing@example.com' }, JWT_SECRET, { expiresIn: '1h' });
      req.headers['authorization'] = `Bearer ${validToken}`;
      
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

    test('should return 401 if user not found in database', (done) => {
      const validToken = jwt.sign({ email: 'nonexistent@example.com' }, JWT_SECRET, { expiresIn: '1h' });
      req.headers['authorization'] = `Bearer ${validToken}`;
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
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

    test('should handle database error when checking user', (done) => {
      const validToken = jwt.sign({ email: 'test@example.com' }, JWT_SECRET, { expiresIn: '1h' });
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

  describe('Token Payload Validation', () => {
    test('should extract email from valid token payload', (done) => {
      const validToken = jwt.sign({ email: 'test@mail.example.com' }, JWT_SECRET, { expiresIn: '1h' });
      req.headers['authorization'] = `Bearer ${validToken}`;
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: 'test@mail.example.com' });
      });

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(mockDb.get).toHaveBeenCalledWith(
          'SELECT email FROM users WHERE email = ?',
          ['test@mail.example.com'],
          expect.any(Function)
        );
        expect(req.userEmail).toBe('test@mail.example.com');
        expect(next).toHaveBeenCalled();
        done();
      });
    });
  });
});
