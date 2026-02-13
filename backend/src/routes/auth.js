/**
 * Auth Route Module — Login & Current-User Endpoints
 *
 * Mounted at `/api/auth` (see server.js). Handles two endpoints:
 *
 *  POST /api/auth/login
 *    - Validates the email with Joi (emailSchema).
 *    - Looks up the user in the `users` table; auto-creates on first login.
 *    - Returns the user object (email + createdAt). No password required.
 *    - This is the only public (unauthenticated) write endpoint.
 *
 *  GET /api/auth/me
 *    - Protected by `authenticateUser` middleware.
 *    - Returns the current user's profile from the database.
 *    - Used by AuthContext on page load to verify a stored session.
 *
 * Related files:
 *  - middleware/auth.js       — authenticateUser middleware used by GET /me
 *  - validation/schemas.js    — emailSchema for POST /login body validation
 *  - database/init.js         — getDatabase() singleton
 *  - frontend/src/api/client.ts — login() and getCurrentUser() call these
 *  - frontend/src/contexts/AuthContext.tsx — consumes both endpoints
 */
const express = require('express');
const { getDatabase } = require('../database/init');
const { emailSchema } = require('../validation/schemas');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

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

// Protected endpoint — requires x-user-email header (via authenticateUser).
// Called by the frontend's AuthContext on mount to rehydrate the session.
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
