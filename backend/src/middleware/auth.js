const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

// JWT secret from environment variable with secure fallback for development only
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'dev-secret-change-in-production');

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

// JWT token expiration time
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

/**
 * Generate a JWT token for a user
 * @param {string} email - User's email address
 * @returns {string} JWT token
 */
function generateToken(email) {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} Decoded token payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Authentication middleware that validates JWT tokens
 * Supports both Authorization header (Bearer token) and x-user-email header for backward compatibility
 */
function authenticateUser(req, res, next) {
  // First, try to get JWT from Authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded && decoded.email) {
      req.userEmail = decoded.email;
      return verifyUserExists(req, res, next);
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  // Fallback to x-user-email header for backward compatibility
  // This should be deprecated in future versions
  const userEmail = req.headers['x-user-email'];
  
  if (!userEmail) {
    return res.status(401).json({ error: 'Authentication required. Please provide a valid JWT token in the Authorization header.' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  req.userEmail = userEmail;
  verifyUserExists(req, res, next);
}

/**
 * Helper function to verify user exists in database and create if not
 */
function verifyUserExists(req, res, next) {
  const db = getDatabase();
  
  db.get('SELECT email FROM users WHERE email = ?', [req.userEmail], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!row) {
      // Create new user
      db.run('INSERT INTO users (email) VALUES (?)', [req.userEmail], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ error: 'Failed to create user' });
        }
        next();
      });
    } else {
      next();
    }
  });
}

module.exports = {
  authenticateUser,
  generateToken,
  verifyToken,
  JWT_SECRET
};
