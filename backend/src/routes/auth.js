/**
 * @file Authentication routes.
 *
 * Provides a simple email-based login flow: callers POST an email address and
 * receive back user details.  If the email does not yet exist a new user row
 * is created automatically (auto-registration).
 *
 * Routes:
 * - `POST /api/auth/login` – Log in or register by email.
 * - `GET  /api/auth/me`    – Retrieve the currently authenticated user.
 *
 * @module routes/auth
 */

const express = require('express');
const { getDatabase } = require('../database/init');
const { emailSchema } = require('../validation/schemas');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /login
 *
 * Accepts `{ email }` in the request body.  If a user with that address
 * already exists the existing record is returned (200); otherwise a new user
 * is inserted and the response status is 201.
 *
 * @route POST /api/auth/login
 * @param {Object} req.body
 * @param {string} req.body.email - A valid email address (validated by {@link emailSchema}).
 * @returns {Object} 200 | 201 – `{ message, user: { email, createdAt } }`
 * @throws  400 when validation fails.
 * @throws  500 on database errors.
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
 * GET /me
 *
 * Returns profile data for the authenticated user identified by the
 * `x-user-email` header (enforced by {@link authenticateUser} middleware).
 *
 * @route GET /api/auth/me
 * @returns {Object} 200 – `{ user: { email, createdAt } }`
 * @throws  404 if the user row cannot be found.
 * @throws  500 on database errors.
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
