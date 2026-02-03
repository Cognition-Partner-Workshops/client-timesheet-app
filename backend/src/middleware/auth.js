const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

// JWT secret - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'timesheet-app-secret-key-change-in-production';
const JWT_EXPIRATION = '24h';

// Generate JWT token
function generateToken(email) {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// JWT-based authentication middleware
function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  // Extract token from "Bearer <token>" format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization header format. Use: Bearer <token>' });
  }

  const token = parts[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const userEmail = decoded.email;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return res.status(400).json({ error: 'Invalid email format in token' });
  }

  const db = getDatabase();
  
  // Verify user exists in database
  db.get('SELECT email FROM users WHERE email = ?', [userEmail], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!row) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.userEmail = userEmail;
    next();
  });
}

module.exports = {
  authenticateUser,
  generateToken,
  verifyToken,
  JWT_SECRET
};
