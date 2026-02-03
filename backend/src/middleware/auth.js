const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// JWT-based authentication middleware
function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  // Check for Bearer token format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
  }

  const token = parts[1];

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const db = getDatabase();
    
    // Verify session exists and is not expired
    db.get(
      'SELECT * FROM sessions WHERE token = ? AND user_email = ? AND expires_at > datetime("now")',
      [token, decoded.email],
      (err, session) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (!session) {
          return res.status(401).json({ error: 'Session expired or invalid' });
        }
        
        // Verify user still exists
        db.get('SELECT email FROM users WHERE email = ?', [decoded.email], (err, user) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          
          if (!user) {
            return res.status(401).json({ error: 'User not found' });
          }
          
          // Set user info on request
          req.userEmail = decoded.email;
          req.sessionId = decoded.sessionId;
          req.token = token;
          next();
        });
      }
    );
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
