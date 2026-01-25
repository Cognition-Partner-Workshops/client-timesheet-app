const express = require('express');
const { getDatabase } = require('../database/init');
const { loginSchema } = require('../validation/schemas');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Login endpoint - creates user if doesn't exist
// Supports login via email or mobile number
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { email, mobile } = value;
    const db = getDatabase();

    if (email) {
      // Login with email
      db.get('SELECT email, mobile, created_at FROM users WHERE email = ?', [email], (err, row) => {
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
              mobile: row.mobile,
              createdAt: row.created_at
            }
          });
        } else {
          // Create new user with email
          db.run('INSERT INTO users (email) VALUES (?)', [email], function(err) {
            if (err) {
              console.error('Error creating user:', err);
              return res.status(500).json({ error: 'Failed to create user' });
            }

            res.status(201).json({
              message: 'User created and logged in successfully',
              user: {
                email: email,
                mobile: null,
                createdAt: new Date().toISOString()
              }
            });
          });
        }
      });
    } else if (mobile) {
      // Login with mobile number
      db.get('SELECT email, mobile, created_at FROM users WHERE mobile = ?', [mobile], (err, row) => {
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
              mobile: row.mobile,
              createdAt: row.created_at
            }
          });
        } else {
          // Create new user with mobile - generate a placeholder email
          const placeholderEmail = `mobile_${mobile.replace(/\+/g, '')}@timetracker.local`;
          db.run('INSERT INTO users (email, mobile) VALUES (?, ?)', [placeholderEmail, mobile], function(err) {
            if (err) {
              console.error('Error creating user:', err);
              return res.status(500).json({ error: 'Failed to create user' });
            }

            res.status(201).json({
              message: 'User created and logged in successfully',
              user: {
                email: placeholderEmail,
                mobile: mobile,
                createdAt: new Date().toISOString()
              }
            });
          });
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get current user info
router.get('/me', authenticateUser, (req, res) => {
  const db = getDatabase();
  
  db.get('SELECT email, mobile, created_at FROM users WHERE email = ?', [req.userEmail], (err, row) => {
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
        mobile: row.mobile,
        createdAt: row.created_at
      }
    });
  });
});

module.exports = router;
