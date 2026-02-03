/**
 * @fileoverview Authentication middleware for the Time Tracker API.
 * 
 * This module provides email-based authentication middleware that validates
 * user identity via the x-user-email header. It automatically creates new
 * user accounts for first-time users.
 * 
 * @module middleware/auth
 */

const { getDatabase } = require('../database/init');

/**
 * Express middleware that authenticates users based on email header.
 * 
 * This middleware:
 * 1. Extracts the user email from the x-user-email header
 * 2. Validates the email format using regex
 * 3. Checks if the user exists in the database
 * 4. Creates a new user account if they don't exist
 * 5. Attaches the user email to req.userEmail for downstream handlers
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 * 
 * @example
 * // Apply to all routes in a router
 * router.use(authenticateUser);
 * 
 * @example
 * // Apply to a specific route
 * router.get('/protected', authenticateUser, (req, res) => {
 *   console.log('User email:', req.userEmail);
 * });
 */
function authenticateUser(req, res, next) {
  const userEmail = req.headers['x-user-email'];
  
  if (!userEmail) {
    return res.status(401).json({ error: 'User email required in x-user-email header' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
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
