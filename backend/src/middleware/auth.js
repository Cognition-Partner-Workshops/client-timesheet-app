/**
 * @fileoverview Authentication middleware for email-based user authentication.
 * This module provides middleware that validates user identity via email header
 * and automatically creates new user accounts when needed.
 * @module middleware/auth
 */

const { getDatabase } = require('../database/init');

/**
 * Regular expression pattern for validating email addresses.
 * @constant {RegExp}
 * @private
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Express middleware that authenticates users based on the x-user-email header.
 * If the user doesn't exist in the database, a new user account is automatically created.
 * On successful authentication, sets req.userEmail for use in subsequent middleware/routes.
 * 
 * @function authenticateUser
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Use as route middleware
 * router.use(authenticateUser);
 * 
 * // Or on specific routes
 * router.get('/protected', authenticateUser, (req, res) => {
 *   console.log(req.userEmail); // User's email is available
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
