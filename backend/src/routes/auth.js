/**
 * @fileoverview Authentication routes for the Time Tracker application.
 * Provides login functionality with automatic user creation.
 * Uses email-based authentication without passwords for simplicity.
 * @module routes/auth
 */

const express = require('express');
const { getDatabase } = require('../database/init');
const { emailSchema } = require('../validation/schemas');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticates a user by email. Creates a new user if one doesn't exist.
 * This is a simplified authentication system without passwords.
 * @route POST /api/auth/login
 * @param {Object} body - Request body
 * @param {string} body.email - User's email address (required)
 * @returns {Object} 200 - Login successful with existing user
 * @returns {Object} 201 - New user created and logged in
 * @returns {Object} 400 - Validation error (invalid email format)
 * @returns {Object} 500 - Internal server error
 * @example
 * // Request: { email: 'user@example.com' }
 * // Response: { message: 'Login successful', user: { email, createdAt } }
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
 * GET /api/auth/me
 * Retrieves the current authenticated user's information.
 * Requires the x-user-email header to be set.
 * @route GET /api/auth/me
 * @returns {Object} 200 - User information
 * @returns {Object} 401 - Not authenticated (missing or invalid email header)
 * @returns {Object} 404 - User not found in database
 * @returns {Object} 500 - Internal server error
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
