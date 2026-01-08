const express = require('express');
const { getDatabase } = require('../database/init');
const { emailSchema } = require('../validation/schemas');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Login endpoint - creates user if doesn't exist
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = emailSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { email } = value;
    const db = getDatabase();

    // Check if user exists
    const result = await db.query('SELECT email, created_at FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return res.json({
        message: 'Login successful',
        user: {
          email: row.email,
          createdAt: row.created_at
        }
      });
    } else {
      // Create new user
      await db.query('INSERT INTO users (email) VALUES ($1)', [email]);

      res.status(201).json({
        message: 'User created and logged in successfully',
        user: {
          email: email,
          createdAt: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Database error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    next(error);
  }
});

// Get current user info
router.get('/me', authenticateUser, async (req, res, next) => {
  try {
    const db = getDatabase();

    const result = await db.query('SELECT email, created_at FROM users WHERE email = $1', [req.userEmail]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const row = result.rows[0];
    res.json({
      user: {
        email: row.email,
        createdAt: row.created_at
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    next(error);
  }
});

module.exports = router;
