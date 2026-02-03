/**
 * @fileoverview Authentication routes for user login and profile retrieval.
 * 
 * This module provides endpoints for email-based authentication. Users can
 * log in with just their email address, and new users are automatically
 * created on first login. This simplified auth is designed for trusted
 * internal network environments.
 * 
 * @module routes/auth
 * @requires express
 * @requires ../database/init
 * @requires ../validation/schemas
 * @requires ../middleware/auth
 */

const express = require('express');
const { getDatabase } = require('../database/init');
const { emailSchema } = require('../validation/schemas');
const { authenticateUser } = require('../middleware/auth');

/**
 * Express router for authentication endpoints.
 * @type {express.Router}
 */
const router = express.Router();

/**
 * Login endpoint - authenticates user or creates new account.
 * 
 * @route POST /api/auth/login
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @returns {Object} 200 - Login successful with user data
 * @returns {Object} 201 - New user created and logged in
 * @returns {Object} 400 - Validation error
 * @returns {Object} 500 - Server error
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
 * Get current authenticated user's profile information.
 * 
 * @route GET /api/auth/me
 * @middleware authenticateUser - Validates x-user-email header
 * @returns {Object} 200 - User profile data
 * @returns {Object} 401 - Unauthorized (missing or invalid email header)
 * @returns {Object} 404 - User not found
 * @returns {Object} 500 - Server error
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
