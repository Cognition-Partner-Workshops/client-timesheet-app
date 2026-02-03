const { authenticateUser, generateToken, verifyToken } = require('../../middleware/auth');
const { getDatabase } = require('../../database/init');

jest.mock('../../database/init');

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

  describe('JWT Token Generation and Verification', () => {
    test('should generate a valid JWT token', () => {
      const email = 'test@example.com';
      const token = generateToken(email);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('should verify a valid JWT token', () => {
      const email = 'test@example.com';
      const token = generateToken(email);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.email).toBe(email);
    });

    test('should return null for invalid token', () => {
      const decoded = verifyToken('invalid-token');
      expect(decoded).toBeNull();
    });

    test('should return null for tampered token', () => {
      const token = generateToken('test@example.com');
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      const decoded = verifyToken(tamperedToken);
      expect(decoded).toBeNull();
    });
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

    test('should return 401 if authorization header format is invalid', () => {
      req.headers['authorization'] = 'InvalidFormat token123';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid authorization header format. Use: Bearer <token>'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if token is missing after Bearer', () => {
      req.headers['authorization'] = 'Bearer';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid authorization header format. Use: Bearer <token>'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for invalid JWT token', () => {
      req.headers['authorization'] = 'Bearer invalid-token';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Existing User Authentication', () => {
    test('should authenticate existing user and call next()', (done) => {
      const email = 'existing@example.com';
      const token = generateToken(email);
      req.headers['authorization'] = `Bearer ${token}`;
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: email });
      });

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(req.userEmail).toBe(email);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        done();
      });
    });

    test('should return 401 if user not found in database', (done) => {
      const email = 'nonexistent@example.com';
      const token = generateToken(email);
      req.headers['authorization'] = `Bearer ${token}`;
      
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
      const email = 'test@example.com';
      const token = generateToken(email);
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
  });

  describe('Token Email Validation', () => {
    test('should accept valid email in token', (done) => {
      const email = 'test@example.com';
      const token = generateToken(email);
      req.headers['authorization'] = `Bearer ${token}`;
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: email });
      });

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(mockDb.get).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        done();
      });
    });

    test('should accept email with subdomain in token', (done) => {
      const email = 'test@mail.example.com';
      const token = generateToken(email);
      req.headers['authorization'] = `Bearer ${token}`;
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: email });
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
