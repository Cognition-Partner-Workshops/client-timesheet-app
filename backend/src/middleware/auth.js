const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    const db = getDatabase();
    
    // Check if user exists
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
  } catch (jwtError) {
    if (jwtError.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (jwtError.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('JWT verification error:', jwtError);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = {
  authenticateUser
};
