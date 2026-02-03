const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getDatabase } = require('../database/init');
const { registerSchema, loginSchema } = require('../validation/schemas');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const SALT_ROUNDS = 12;

// Register endpoint - creates new user with password
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { email, password } = value;
    const db = getDatabase();

    // Check if user already exists
    db.get('SELECT email FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (row) {
        return res.status(409).json({ error: 'User already exists' });
      }

      try {
        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create new user
        db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash], function(err) {
          if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ error: 'Failed to create user' });
          }

          res.status(201).json({
            message: 'User registered successfully',
            user: {
              email: email,
              createdAt: new Date().toISOString()
            }
          });
        });
      } catch (hashError) {
        console.error('Error hashing password:', hashError);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login endpoint - authenticates user and returns JWT
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { email, password } = value;
    const db = getDatabase();

    // Check if user exists
    db.get('SELECT email, password_hash, created_at FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!row) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      try {
        // Verify password
        const passwordMatch = await bcrypt.compare(password, row.password_hash);
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate session ID
        const sessionId = crypto.randomUUID();
        
        // Generate JWT token
        const token = jwt.sign(
          { 
            email: row.email,
            sessionId: sessionId
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        // Calculate expiration time (24 hours from now)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // Store session in database
        db.run(
          'INSERT INTO sessions (id, user_email, token, expires_at) VALUES (?, ?, ?, ?)',
          [sessionId, row.email, token, expiresAt],
          function(err) {
            if (err) {
              console.error('Error creating session:', err);
              return res.status(500).json({ error: 'Failed to create session' });
            }

            res.json({
              message: 'Login successful',
              token: token,
              user: {
                email: row.email,
                createdAt: row.created_at
              }
            });
          }
        );
      } catch (compareError) {
        console.error('Error comparing password:', compareError);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (error) {
    next(error);
  }
});

// Logout endpoint - invalidates session
router.post('/logout', authenticateUser, (req, res) => {
  const db = getDatabase();
  
  // Delete the session from database
  db.run('DELETE FROM sessions WHERE user_email = ? AND token = ?', [req.userEmail, req.token], function(err) {
    if (err) {
      console.error('Error deleting session:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }

    res.json({ message: 'Logged out successfully' });
  });
});

// Logout all sessions endpoint
router.post('/logout-all', authenticateUser, (req, res) => {
  const db = getDatabase();
  
  // Delete all sessions for this user
  db.run('DELETE FROM sessions WHERE user_email = ?', [req.userEmail], function(err) {
    if (err) {
      console.error('Error deleting sessions:', err);
      return res.status(500).json({ error: 'Failed to logout from all sessions' });
    }

    res.json({ message: 'Logged out from all sessions successfully' });
  });
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

// Refresh token endpoint
router.post('/refresh', authenticateUser, (req, res) => {
  const db = getDatabase();
  
  // Generate new session ID
  const newSessionId = crypto.randomUUID();
  
  // Generate new JWT token
  const newToken = jwt.sign(
    { 
      email: req.userEmail,
      sessionId: newSessionId
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Calculate new expiration time
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Delete old session and create new one
  db.run('DELETE FROM sessions WHERE user_email = ? AND token = ?', [req.userEmail, req.token], function(err) {
    if (err) {
      console.error('Error deleting old session:', err);
      return res.status(500).json({ error: 'Failed to refresh token' });
    }

    db.run(
      'INSERT INTO sessions (id, user_email, token, expires_at) VALUES (?, ?, ?, ?)',
      [newSessionId, req.userEmail, newToken, expiresAt],
      function(err) {
        if (err) {
          console.error('Error creating new session:', err);
          return res.status(500).json({ error: 'Failed to refresh token' });
        }

        res.json({
          message: 'Token refreshed successfully',
          token: newToken
        });
      }
    );
  });
});

module.exports = router;
