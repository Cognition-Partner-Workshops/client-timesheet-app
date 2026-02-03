/**
 * @fileoverview Authentication middleware for the timesheet application.
 * 
 * Provides email-based authentication using the x-user-email header.
 * This is a simplified authentication mechanism suitable for internal
 * applications where users are trusted. For production use, consider
 * implementing JWT tokens or OAuth.
 * 
 * @module middleware/auth
 */

const { getDatabase } = require('../database/init');

/**
 * Regular expression pattern for validating email addresses.
 * Matches standard email format: local@domain.tld
 * @constant {RegExp}
 * @private
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Express middleware that authenticates users based on email header.
 * 
 * Authentication flow:
 * 1. Extracts email from x-user-email header
 * 2. Validates email format using regex
 * 3. Checks if user exists in database
 * 4. Creates new user if not found (auto-registration)
 * 5. Attaches userEmail to request object for downstream use
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Apply to all routes in a router
 * router.use(authenticateUser);
 * 
 * @example
 * // Apply to specific route
 * router.get('/protected', authenticateUser, (req, res) => {
 *   console.log('Authenticated user:', req.userEmail);
 * });
 */
function authenticateUser(req, res, next) {
  const userEmail = req.headers['x-user-email'];
  
  if (!userEmail) {
    return res.status(401).json({ error: 'User email required in x-user-email header' });
  }

  if (!EMAIL_REGEX.test(userEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const db = getDatabase();
  
  db.get('SELECT email FROM users WHERE email = ?', [userEmail], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!row) {
      db.run('INSERT INTO users (email) VALUES (?)', [userEmail], (err) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ error: 'Failed to create user' });
        }
        
        req.userEmail = userEmail;
        next();
      });
    } else {
      req.userEmail = userEmail;
      next();
    }
  });
}

module.exports = {
  authenticateUser
};
