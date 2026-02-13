const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRoutes = require('../../routes/auth');
const { getDatabase } = require('../../database/init');

jest.mock('../../database/init');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const crypto = require('crypto');
jest.spyOn(crypto, 'randomBytes').mockReturnValue({
  toString: () => 'mock-refresh-token-hex'
});

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use((err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({ error: 'Validation error' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

describe('Auth Routes', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      get: jest.fn(),
      run: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);
    jwt.sign.mockReturnValue('mock-access-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      bcrypt.hash.mockResolvedValue('hashed-password');

      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'newuser@example.com', password: 'Test123!@' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.accessToken).toBe('mock-access-token');
      expect(response.body.refreshToken).toBe('mock-refresh-token-hex');
    });

    test('should return 409 if user already exists', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: 'existing@example.com' });
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'existing@example.com', password: 'Test123!@' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User already exists');
    });

    test('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'short' });

      expect(response.status).toBe(400);
    });

    test('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
    });

    test('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid', password: 'Test123!@' });

      expect(response.status).toBe(400);
    });

    test('should handle database error when checking user', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'Test123!@' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should handle database error when creating user', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      bcrypt.hash.mockResolvedValue('hashed-password');

      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call(this, new Error('Insert failed'));
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'Test123!@' });

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login existing user with correct password', async () => {
      const existingUser = {
        email: 'existing@example.com',
        password_hash: 'hashed-password',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, existingUser);
      });

      bcrypt.compare.mockResolvedValue(true);

      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'existing@example.com', password: 'Test123!@' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe('existing@example.com');
      expect(response.body.accessToken).toBe('mock-access-token');
      expect(response.body.refreshToken).toBe('mock-refresh-token-hex');
    });

    test('should return 401 for non-existent user', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'Test123!@' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });

    test('should return 401 for wrong password', async () => {
      const existingUser = {
        email: 'existing@example.com',
        password_hash: 'hashed-password',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, existingUser);
      });

      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'existing@example.com', password: 'WrongPass1!' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });

    test('should return 401 for user without password hash', async () => {
      const legacyUser = {
        email: 'legacy@example.com',
        password_hash: null,
        created_at: '2024-01-01T00:00:00.000Z'
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, legacyUser);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'legacy@example.com', password: 'Test123!@' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Account requires password setup. Please register.');
    });

    test('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email', password: 'Test123!@' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    test('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    test('should handle database error when checking user', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Test123!@' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should handle unexpected errors in try-catch block', async () => {
      getDatabase.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Test123!@' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('should refresh tokens with valid refresh token', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, {
          user_email: 'test@example.com',
          expires_at: new Date(Date.now() + 86400000).toISOString()
        });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        if (typeof callback === 'function') callback(null);
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBe('mock-access-token');
      expect(response.body.refreshToken).toBe('mock-refresh-token-hex');
    });

    test('should return 400 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Refresh token is required');
    });

    test('should return 401 for invalid refresh token', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid refresh token');
    });

    test('should return 401 for expired refresh token', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, {
          user_email: 'test@example.com',
          expires_at: new Date(Date.now() - 86400000).toISOString()
        });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        if (typeof callback === 'function') callback(null);
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'expired-token' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Refresh token expired');
    });

    test('should handle database error', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'some-token' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return current user info with valid token', async () => {
      const user = {
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      jwt.verify.mockReturnValue({ email: 'test@example.com' });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, user);
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    test('should return 401 if no token provided', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Access token required' });
    });

    test('should return 404 if user not found', async () => {
      jwt.verify.mockReturnValue({ email: 'test@example.com' });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });

    test('should handle database error', async () => {
      jwt.verify.mockReturnValue({ email: 'test@example.com' });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});
