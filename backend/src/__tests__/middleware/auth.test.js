const { authenticateUser, generateToken, verifyToken, JWT_SECRET } = require('../../middleware/auth');
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

  describe('Email Header Validation', () => {
    test('should return 401 if no authentication provided', () => {
      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication required. Please provide a valid JWT token in the Authorization header.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 400 if email format is invalid', () => {
      req.headers['x-user-email'] = 'invalid-email';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid email format'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should accept valid email format', () => {
      req.headers['x-user-email'] = 'test@example.com';
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: 'test@example.com' });
      });

      authenticateUser(req, res, next);

      expect(mockDb.get).toHaveBeenCalled();
    });
  });

  describe('Existing User Authentication', () => {
    test('should authenticate existing user and call next()', (done) => {
      req.headers['x-user-email'] = 'existing@example.com';
      
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
      req.headers['x-user-email'] = 'test@example.com';
      
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

  describe('New User Creation', () => {
    test('should create new user if not exists and call next()', (done) => {
      req.headers['x-user-email'] = 'newuser@example.com';
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null); // User doesn't exist
      });
      
      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(mockDb.run).toHaveBeenCalledWith(
          'INSERT INTO users (email) VALUES (?)',
          ['newuser@example.com'],
          expect.any(Function)
        );
        expect(req.userEmail).toBe('newuser@example.com');
        expect(next).toHaveBeenCalled();
        done();
      });
    });

    test('should handle error when creating new user', (done) => {
      req.headers['x-user-email'] = 'newuser@example.com';
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });
      
      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('Insert failed'));
      });

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Failed to create user'
        });
        expect(next).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Email Format Edge Cases', () => {
    test('should reject email without @', () => {
      req.headers['x-user-email'] = 'notanemail';
      authenticateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should reject email without domain', () => {
      req.headers['x-user-email'] = 'test@';
      authenticateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should reject email without TLD', () => {
      req.headers['x-user-email'] = 'test@domain';
      authenticateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should accept email with subdomain', () => {
      req.headers['x-user-email'] = 'test@mail.example.com';
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: 'test@mail.example.com' });
      });

      authenticateUser(req, res, next);
      expect(mockDb.get).toHaveBeenCalled();
    });
  });

  describe('JWT Token Authentication', () => {
    test('should authenticate with valid JWT Bearer token', (done) => {
      const token = generateToken('jwt@example.com');
      req.headers.authorization = `Bearer ${token}`;
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: 'jwt@example.com' });
      });

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(req.userEmail).toBe('jwt@example.com');
        expect(next).toHaveBeenCalled();
        done();
      });
    });

    test('should return 401 for invalid JWT token', () => {
      req.headers.authorization = 'Bearer invalid-token';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for expired JWT token', () => {
      // Create a token that's already expired by using a very short expiration
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign({ email: 'test@example.com' }, JWT_SECRET, { expiresIn: '-1s' });
      req.headers.authorization = `Bearer ${expiredToken}`;

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
    });

    test('should return 401 for JWT token without email claim', () => {
      const jwt = require('jsonwebtoken');
      const tokenWithoutEmail = jwt.sign({ userId: 123 }, JWT_SECRET, { expiresIn: '1h' });
      req.headers.authorization = `Bearer ${tokenWithoutEmail}`;

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
    });

    test('should create new user when authenticating with JWT for new user', (done) => {
      const token = generateToken('newjwtuser@example.com');
      req.headers.authorization = `Bearer ${token}`;
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null); // User doesn't exist
      });
      
      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      authenticateUser(req, res, next);

      setImmediate(() => {
        expect(mockDb.run).toHaveBeenCalledWith(
          'INSERT INTO users (email) VALUES (?)',
          ['newjwtuser@example.com'],
          expect.any(Function)
        );
        expect(next).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Token Generation and Verification', () => {
    test('generateToken should create a valid JWT token', () => {
      const token = generateToken('test@example.com');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('verifyToken should return decoded payload for valid token', () => {
      const token = generateToken('verify@example.com');
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.email).toBe('verify@example.com');
    });

    test('verifyToken should return null for invalid token', () => {
      const result = verifyToken('invalid-token');
      expect(result).toBeNull();
    });

    test('verifyToken should return null for tampered token', () => {
      const token = generateToken('test@example.com');
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      const result = verifyToken(tamperedToken);
      expect(result).toBeNull();
    });

    test('JWT_SECRET should be defined', () => {
      expect(JWT_SECRET).toBeDefined();
      expect(typeof JWT_SECRET).toBe('string');
    });
  });

  describe('Authorization Header Edge Cases', () => {
    test('should ignore Authorization header that does not start with Bearer', () => {
      req.headers.authorization = 'Basic sometoken';
      req.headers['x-user-email'] = 'fallback@example.com';
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: 'fallback@example.com' });
      });

      authenticateUser(req, res, next);

      // Should fall back to x-user-email header
      expect(mockDb.get).toHaveBeenCalled();
    });

    test('should handle empty Bearer token', () => {
      req.headers.authorization = 'Bearer ';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
