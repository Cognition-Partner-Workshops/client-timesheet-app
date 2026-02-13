const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getDatabase } = require('../database/init');
const { loginSchema, registerSchema } = require('../validation/schemas');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

function generateAccessToken(email) {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { email, password } = value;
    const db = getDatabase();

    db.get('SELECT email FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (row) {
        return res.status(409).json({ error: 'User already exists' });
      }

      try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        db.run(
          'INSERT INTO users (email, password_hash) VALUES (?, ?)',
          [email, passwordHash],
          function (err) {
            if (err) {
              console.error('Error creating user:', err);
              return res.status(500).json({ error: 'Failed to create user' });
            }

            const accessToken = generateAccessToken(email);
            const refreshToken = generateRefreshToken();
            const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString();

            db.run(
              'INSERT INTO refresh_tokens (user_email, token, expires_at) VALUES (?, ?, ?)',
              [email, refreshToken, expiresAt],
              function (err) {
                if (err) {
                  console.error('Error storing refresh token:', err);
                  return res.status(500).json({ error: 'Failed to complete registration' });
                }

                res.status(201).json({
                  message: 'User registered successfully',
                  user: {
                    email: email,
                    createdAt: new Date().toISOString(),
                  },
                  accessToken,
                  refreshToken,
                });
              }
            );
          }
        );
      } catch (hashError) {
        console.error('Error hashing password:', hashError);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { email, password } = value;
    const db = getDatabase();

    db.get('SELECT email, password_hash, created_at FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!row) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (!row.password_hash) {
        return res.status(401).json({ error: 'Account requires password setup. Please register.' });
      }

      try {
        const isValid = await bcrypt.compare(password, row.password_hash);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const accessToken = generateAccessToken(email);
        const refreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString();

        db.run(
          'INSERT INTO refresh_tokens (user_email, token, expires_at) VALUES (?, ?, ?)',
          [email, refreshToken, expiresAt],
          function (err) {
            if (err) {
              console.error('Error storing refresh token:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
              message: 'Login successful',
              user: {
                email: row.email,
                createdAt: row.created_at,
              },
              accessToken,
              refreshToken,
            });
          }
        );
      } catch (compareError) {
        console.error('Error comparing passwords:', compareError);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const db = getDatabase();

    db.get(
      'SELECT user_email, expires_at FROM refresh_tokens WHERE token = ?',
      [refreshToken],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!row) {
          return res.status(401).json({ error: 'Invalid refresh token' });
        }

        if (new Date(row.expires_at) < new Date()) {
          db.run('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
          return res.status(401).json({ error: 'Refresh token expired' });
        }

        db.run('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken], (err) => {
          if (err) {
            console.error('Error deleting old refresh token:', err);
          }

          const newAccessToken = generateAccessToken(row.user_email);
          const newRefreshToken = generateRefreshToken();
          const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString();

          db.run(
            'INSERT INTO refresh_tokens (user_email, token, expires_at) VALUES (?, ?, ?)',
            [row.user_email, newRefreshToken, expiresAt],
            (err) => {
              if (err) {
                console.error('Error storing new refresh token:', err);
                return res.status(500).json({ error: 'Internal server error' });
              }

              res.json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              });
            }
          );
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

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
