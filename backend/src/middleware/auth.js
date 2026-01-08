const { getDatabase } = require('../database/init');

// Simple email-based authentication middleware
async function authenticateUser(req, res, next) {
  const userEmail = req.headers['x-user-email'];

  if (!userEmail) {
    return res.status(401).json({ error: 'User email required in x-user-email header' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const db = getDatabase();

  try {
    // Check if user exists
    const result = await db.query('SELECT email FROM users WHERE email = $1', [userEmail]);

    if (result.rows.length === 0) {
      // Create new user
      await db.query('INSERT INTO users (email) VALUES ($1)', [userEmail]);
    }

    req.userEmail = userEmail;
    next();
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  authenticateUser
};
