const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authRoutes = require('../../routes/auth');
const { getDatabase } = require('../../database/init');

jest.mock('../../database/init');
jest.mock('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
// Add error handler for Joi validation
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
    bcrypt.hash.mockResolvedValue('hashed_password');
    bcrypt.compare.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register new user', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null); // User doesn't exist
      });

      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call(this, null);
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'newuser@example.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.token).toBeDefined();
    });

    test('should return 409 if user already exists', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { email: 'existing@example.com' });
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'existing@example.com', password: 'password123' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User with this email already exists');
    });

    test('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid-email', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    test('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    test('should return 400 for password too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'short' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login existing user with correct password', async () => {
      const existingUser = {
        email: 'existing@example.com',
        password_hash: 'hashed_password',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, existingUser);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'existing@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe('existing@example.com');
      expect(response.body.token).toBeDefined();
    });

    test('should return 401 for non-existent user', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });

    test('should return 401 for incorrect password', async () => {
      const existingUser = {
        email: 'existing@example.com',
        password_hash: 'hashed_password',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, existingUser);
      });

      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'existing@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });

    test('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email', password: 'password123' });

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
        .send({ email: 'test@example.com', password: 'password123' });

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

      const validToken = jwt.sign({ email: 'test@example.com' }, JWT_SECRET, { expiresIn: '1h' });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, user);
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    test('should return 401 if no Authorization header provided', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Authorization header required' });
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid token' });
    });

    test('should return 404 if user not found', async () => {
      const validToken = jwt.sign({ email: 'test@example.com' }, JWT_SECRET, { expiresIn: '1h' });

      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT email FROM users WHERE email = ?')) {
          // Auth middleware check - user exists for auth
          callback(null, { email: 'test@example.com' });
        } else {
          // /me endpoint check - user not found
          callback(null, null);
        }
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });

    test('should handle database error', async () => {
      const validToken = jwt.sign({ email: 'test@example.com' }, JWT_SECRET, { expiresIn: '1h' });

      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT email FROM users WHERE email = ?')) {
          callback(null, { email: 'test@example.com' });
        } else {
          callback(new Error('Database error'), null);
        }
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});
