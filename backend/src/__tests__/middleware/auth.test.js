const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../../middleware/auth');

jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Validation', () => {
    test('should return 401 if Authorization header is missing', () => {
      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if Authorization header does not start with Bearer', () => {
      req.headers['authorization'] = 'Basic some-token';

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should authenticate with valid JWT token and call next()', () => {
      req.headers['authorization'] = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ email: 'test@example.com' });

      authenticateUser(req, res, next);

      expect(req.userEmail).toBe('test@example.com');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 401 for expired token', () => {
      req.headers['authorization'] = 'Bearer expired-token';
      const expiredError = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => { throw expiredError; });

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access token expired'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for invalid token', () => {
      req.headers['authorization'] = 'Bearer invalid-token';
      const invalidError = new Error('invalid signature');
      invalidError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => { throw invalidError; });

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid access token'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Token Extraction', () => {
    test('should extract email from JWT payload', () => {
      req.headers['authorization'] = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ email: 'user@example.com' });

      authenticateUser(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(req.userEmail).toBe('user@example.com');
    });

    test('should accept token with subdomain email', () => {
      req.headers['authorization'] = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ email: 'test@mail.example.com' });

      authenticateUser(req, res, next);

      expect(req.userEmail).toBe('test@mail.example.com');
      expect(next).toHaveBeenCalled();
    });
  });
});
