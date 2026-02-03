const express = require('express');
const rateLimit = require('express-rate-limit');
const { getDatabase } = require('../database/init');
const { emailSchema } = require('../validation/schemas');
const { authenticateUser, generateToken } = require('../middleware/auth');

const router = express.Router();

// Stricter rate limiting for auth endpoints to prevent brute force attacks
// Skip rate limiting in test environment to allow proper testing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per window
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// Login endpoint - creates user if doesn't exist, returns JWT token
router.post('/login', authLimiter, async (req, res, next) => {
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
        // User exists - generate JWT token
        const token = generateToken(email);
        return res.json({
          message: 'Login successful',
          token: token,
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

          // Generate JWT token for new user
          const token = generateToken(email);
          res.status(201).json({
            message: 'User created and logged in successfully',
            token: token,
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

// Get current user info
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
