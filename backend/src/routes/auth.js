const express = require('express');
const { getDatabase } = require('../database/init');
const { emailSchema } = require('../validation/schemas');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

function handleDbError(res, err, message = 'Internal server error') {
  console.error('Database error:', err);
  return res.status(500).json({ error: message });
}

function formatUserResponse(row) {
  return { email: row.email, createdAt: row.created_at };
}

function findUserByEmail(db, email, callback) {
  db.get('SELECT email, created_at FROM users WHERE email = ?', [email], callback);
}

function createUser(db, email, callback) {
  db.run('INSERT INTO users (email) VALUES (?)', [email], callback);
}

router.post('/login', async (req, res, next) => {
  const { error, value } = emailSchema.validate(req.body);
  if (error) return next(error);

  const { email } = value;
  const db = getDatabase();

  findUserByEmail(db, email, (err, row) => {
    if (err) return handleDbError(res, err);

    if (row) {
      return res.json({ message: 'Login successful', user: formatUserResponse(row) });
    }

    createUser(db, email, function(err) {
      if (err) return handleDbError(res, err, 'Failed to create user');

      res.status(201).json({
        message: 'User created and logged in successfully',
        user: { email: email, createdAt: new Date().toISOString() }
      });
    });
  });
});

router.get('/me', authenticateUser, (req, res) => {
  const db = getDatabase();

  findUserByEmail(db, req.userEmail, (err, row) => {
    if (err) return handleDbError(res, err);
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json({ user: formatUserResponse(row) });
  });
});

module.exports = router;
