const express = require('express');
const { getDatabase } = require('../database/init');
const { emailSchema, mobileNumberSchema, verifyCodeSchema } = require('../validation/schemas');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Generate a random 6-digit auth code
function generateAuthCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

// Request auth code for mobile login
router.post('/request-code', async (req, res, next) => {
  try {
    const { error, value } = mobileNumberSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { mobileNumber } = value;
    const db = getDatabase();
    const authCode = generateAuthCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiration

    // Delete any existing unused codes for this mobile number
    db.run('DELETE FROM auth_codes WHERE mobile_number = ? AND used = 0', [mobileNumber], (err) => {
      if (err) {
        console.error('Error deleting old auth codes:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Insert new auth code
      db.run(
        'INSERT INTO auth_codes (mobile_number, code, expires_at) VALUES (?, ?, ?)',
        [mobileNumber, authCode, expiresAt],
        function(err) {
          if (err) {
            console.error('Error creating auth code:', err);
            return res.status(500).json({ error: 'Failed to generate auth code' });
          }

          // In a real application, you would send the code via SMS here
          // For demo purposes, we return the code in the response
          res.json({
            message: 'Auth code sent successfully',
            // In production, remove the code from response and send via SMS
            code: authCode,
            expiresIn: 300 // 5 minutes in seconds
          });
        }
      );
    });
  } catch (error) {
    next(error);
  }
});

// Verify auth code and login with mobile number
router.post('/verify-code', async (req, res, next) => {
  try {
    const { error, value } = verifyCodeSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { mobileNumber, code } = value;
    const db = getDatabase();

    // Find valid auth code
    db.get(
      `SELECT * FROM auth_codes 
       WHERE mobile_number = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
       ORDER BY created_at DESC LIMIT 1`,
      [mobileNumber, code],
      (err, authCodeRow) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!authCodeRow) {
          return res.status(401).json({ error: 'Invalid or expired auth code' });
        }

        // Mark auth code as used
        db.run('UPDATE auth_codes SET used = 1 WHERE id = ?', [authCodeRow.id], (err) => {
          if (err) {
            console.error('Error marking auth code as used:', err);
          }
        });

        // Check if user exists with this mobile number
        db.get('SELECT email, mobile_number, created_at FROM users WHERE mobile_number = ?', [mobileNumber], (err, userRow) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          if (userRow) {
            // User exists
            return res.json({
              message: 'Login successful',
              user: {
                email: userRow.email,
                mobileNumber: userRow.mobile_number,
                createdAt: userRow.created_at
              }
            });
          } else {
            // Create new user with mobile number (email will be null)
            db.run(
              'INSERT INTO users (email, mobile_number) VALUES (?, ?)',
              [null, mobileNumber],
              function(err) {
                if (err) {
                  console.error('Error creating user:', err);
                  return res.status(500).json({ error: 'Failed to create user' });
                }

                res.status(201).json({
                  message: 'User created and logged in successfully',
                  user: {
                    email: null,
                    mobileNumber: mobileNumber,
                    createdAt: new Date().toISOString()
                  }
                });
              }
            );
          }
        });
      }
    );
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
