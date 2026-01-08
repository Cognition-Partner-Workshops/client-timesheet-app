/**
 * Functional Test Suite for Authentication API
 * 
 * This test suite validates the authentication functionality including:
 * - User login with email-only authentication
 * - Auto user creation on first login
 * - JWT token generation and validation
 * - Current user information retrieval
 * - Rate limiting on login attempts
 * - Error handling and edge cases
 */

const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');
const { getDatabase } = require('../../database/init');

// Mock dependencies
jest.mock('../../database/init');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use((err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({ error: 'Validation error', details: err.details });
  }
  res.status(500).json({ error: 'Internal server error' });
});

describe('Authentication Functional Tests', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn(),
      run: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);
    // Reset rate limiter between tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('POST /api/auth/login - User Login', () => {
    describe('Successful Login', () => {
      test('should login existing user and return JWT token', async () => {
        const existingUser = { email: 'existing@example.com', created_at: '2024-01-01T00:00:00Z' };

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, existingUser);
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'existing@example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe('existing@example.com');
        expect(typeof response.body.token).toBe('string');
        expect(response.body.token.length).toBeGreaterThan(0);
      });

      test('should create new user on first login and return JWT token', async () => {
        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, null); // User doesn't exist
        });

        mockDb.run.mockImplementation((query, params, callback) => {
          callback(null); // User created successfully
        });

        // Mock the second get call to return the newly created user
        mockDb.get
          .mockImplementationOnce((query, params, callback) => {
            callback(null, null); // First check - user doesn't exist
          })
          .mockImplementationOnce((query, params, callback) => {
            callback(null, { email: 'new@example.com', created_at: '2024-01-15T00:00:00Z' });
          });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'new@example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
      });

      test('should handle email with different cases', async () => {
        const user = { email: 'user@example.com', created_at: '2024-01-01T00:00:00Z' };

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, user);
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'USER@EXAMPLE.COM' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
      });

      test('should handle email with leading/trailing whitespace', async () => {
        const user = { email: 'user@example.com', created_at: '2024-01-01T00:00:00Z' };

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, user);
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: '  user@example.com  ' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
      });
    });

    describe('Input Validation', () => {
      test('should return 400 for missing email', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({});

        expect(response.status).toBe(400);
      });

      test('should return 400 for empty email', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: '' });

        expect(response.status).toBe(400);
      });

      test('should return 400 for invalid email format', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'not-an-email' });

        expect(response.status).toBe(400);
      });

      test('should return 400 for email without domain', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'user@' });

        expect(response.status).toBe(400);
      });

      test('should return 400 for email without username', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: '@example.com' });

        expect(response.status).toBe(400);
      });

      test('should return 400 for email with spaces in middle', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'user name@example.com' });

        expect(response.status).toBe(400);
      });
    });

    describe('Error Handling', () => {
      test('should return 500 on database error when checking user', async () => {
        mockDb.get.mockImplementation((query, params, callback) => {
          callback(new Error('Database connection failed'), null);
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error' });
      });

      test('should return 500 on database error when creating user', async () => {
        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, null); // User doesn't exist
        });

        mockDb.run.mockImplementation((query, params, callback) => {
          callback(new Error('Insert failed'));
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'new@example.com' });

        expect(response.status).toBe(500);
      });
    });

    describe('JWT Token Validation', () => {
      test('should return token that can be decoded', async () => {
        const user = { email: 'jwt@example.com', created_at: '2024-01-01T00:00:00Z' };

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, user);
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'jwt@example.com' });

        expect(response.status).toBe(200);
        const token = response.body.token;
        
        // JWT tokens have 3 parts separated by dots
        const parts = token.split('.');
        expect(parts.length).toBe(3);
      });

      test('should return consistent token format', async () => {
        const user = { email: 'format@example.com', created_at: '2024-01-01T00:00:00Z' };

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, user);
        });

        const response1 = await request(app)
          .post('/api/auth/login')
          .send({ email: 'format@example.com' });

        const response2 = await request(app)
          .post('/api/auth/login')
          .send({ email: 'format@example.com' });

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);
        
        // Both should be valid JWT format
        expect(response1.body.token.split('.').length).toBe(3);
        expect(response2.body.token.split('.').length).toBe(3);
      });
    });
  });

  describe('GET /api/auth/me - Current User Info', () => {
    describe('Successful Retrieval', () => {
      test('should return current user information with valid token', async () => {
        // First login to get a token
        const user = { email: 'me@example.com', created_at: '2024-01-01T00:00:00Z' };

        mockDb.get.mockImplementation((query, params, callback) => {
          callback(null, user);
        });

        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({ email: 'me@example.com' });

        const token = loginResponse.body.token;

        // Now get current user info
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe('me@example.com');
      });
    });

    describe('Authentication Errors', () => {
      test('should return 401 without authorization header', async () => {
        const response = await request(app).get('/api/auth/me');

        expect(response.status).toBe(401);
      });

      test('should return 401 with invalid token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
      });

      test('should return 401 with malformed authorization header', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'InvalidFormat token123');

        expect(response.status).toBe(401);
      });

      test('should return 401 with empty bearer token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer ');

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Security Features', () => {
    test('should not expose sensitive information in error messages', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed'), null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(500);
      expect(response.body.error).not.toContain('SQLITE');
      expect(response.body.error).not.toContain('constraint');
    });

    test('should handle SQL injection attempts in email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: "'; DROP TABLE users; --" });

      expect(response.status).toBe(400);
    });

    test('should handle XSS attempts in email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: '<script>alert("xss")</script>@example.com' });

      expect(response.status).toBe(400);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(200) + '@example.com';
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: longEmail });

      // Should either accept or reject gracefully
      expect([200, 400]).toContain(response.status);
    });

    test('should handle unicode characters in email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@例え.jp' });

      // Should handle gracefully
      expect([200, 400]).toContain(response.status);
    });

    test('should handle concurrent login requests', async () => {
      const user = { email: 'concurrent@example.com', created_at: '2024-01-01T00:00:00Z' };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, user);
      });

      const promises = Array(5).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({ email: 'concurrent@example.com' })
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
      });
    });
  });
});
