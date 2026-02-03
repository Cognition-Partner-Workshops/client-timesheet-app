/**
 * @fileoverview Authentication routes for user login and profile management.
 * 
 * Provides endpoints for:
 * - User login with auto-registration
 * - Retrieving current user information
 * 
 * Uses email-based authentication without passwords for simplicity.
 * 
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
 * @description Authenticates a user by email. Creates a new user account if one doesn't exist.
 * 
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * 
 * @returns {Object} 200 - Login successful for existing user
 * @returns {Object} 201 - New user created and logged in
 * @returns {Object} 400 - Validation error (invalid email format)
 * @returns {Object} 500 - Internal server error
 * 
 * @example
 * // Request
 * POST /api/auth/login
 * { "email": "user@example.com" }
 * 
 * // Response (existing user)
 * { "message": "Login successful", "user": { "email": "user@example.com", "createdAt": "2024-01-01T00:00:00Z" } }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = emailSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { email } = value;
    const db = getDatabase();

    db.get('SELECT email, created_at FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (row) {
        return res.json({
          message: 'Login successful',
          user: {
            email: row.email,
            createdAt: row.created_at
          }
        });
      } else {
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
 * @description Retrieves the current authenticated user's information.
 * 
 * @requires authenticateUser middleware - x-user-email header must be present
 * 
 * @returns {Object} 200 - User information retrieved successfully
 * @returns {Object} 401 - Unauthorized (missing or invalid email header)
 * @returns {Object} 404 - User not found
 * @returns {Object} 500 - Internal server error
 * 
 * @example
 * // Request
 * GET /api/auth/me
 * Headers: { "x-user-email": "user@example.com" }
 * 
 * // Response
 * { "user": { "email": "user@example.com", "createdAt": "2024-01-01T00:00:00Z" } }
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
