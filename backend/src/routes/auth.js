/**
 * @fileoverview Authentication routes for user login and profile retrieval.
 * Provides endpoints for email-based authentication with auto user creation.
 * @module routes/auth
 */

const express = require('express');
const { getDatabase } = require('../database/init');
const { emailSchema } = require('../validation/schemas');
const { authenticateUser } = require('../middleware/auth');

/**
 * Express router for authentication endpoints.
 * @type {import('express').Router}
 */
const router = express.Router();

/**
 * @route POST /api/auth/login
 * @description Authenticates a user by email. Creates a new user account if the email
 * doesn't exist in the database. Returns user information on successful login.
 * 
 * @param {Object} req.body - Request body.
 * @param {string} req.body.email - User's email address.
 * 
 * @returns {Object} 200 - Login successful for existing user.
 * @returns {Object} 201 - User created and logged in successfully.
 * @returns {Object} 400 - Validation error (invalid email format).
 * @returns {Object} 500 - Internal server error.
 * 
 * @example
 * // Request
 * POST /api/auth/login
 * { "email": "user@example.com" }
 * 
 * // Response (existing user)
 * { "message": "Login successful", "user": { "email": "user@example.com", "createdAt": "2024-01-01T00:00:00.000Z" } }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = emailSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { email } = value;
    const db = getDatabase();

    // Check if user exists
    db.get('SELECT email, created_at FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (row) {
        // User exists
        return res.json({
          message: 'Login successful',
          user: {
            email: row.email,
            createdAt: row.created_at
          }
        });
      } else {
        // Create new user
        db.run('INSERT INTO users (email) VALUES (?)', [email], function(err) {
          if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ error: 'Failed to create user' });
          }

          res.status(201).json({
            message: 'User created and logged in successfully',
            user: {
              email: email,
              createdAt: new Date().toISOString()
            }
          });
        });
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/auth/me
 * @description Retrieves the current authenticated user's profile information.
 * Requires authentication via x-user-email header.
 * 
 * @param {string} req.headers.x-user-email - User's email for authentication.
 * 
 * @returns {Object} 200 - User profile information.
 * @returns {Object} 401 - Unauthorized (missing or invalid email header).
 * @returns {Object} 404 - User not found.
 * @returns {Object} 500 - Internal server error.
 * 
 * @example
 * // Request
 * GET /api/auth/me
 * Headers: { "x-user-email": "user@example.com" }
 * 
 * // Response
 * { "user": { "email": "user@example.com", "createdAt": "2024-01-01T00:00:00.000Z" } }
 */
router.get('/me', authenticateUser, (req, res) => {
  const db = getDatabase();
  
  db.get('SELECT email, created_at FROM users WHERE email = ?', [req.userEmail], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        email: row.email,
        createdAt: row.created_at
      }
    });
  });
});

module.exports = router;
