/**
 * @fileoverview Authentication middleware for the Client Timesheet API.
 *
 * Implements a simple email-based authentication scheme.  Every protected
 * request must include the caller's email address in the `x-user-email` HTTP
 * header.  If the email does not yet exist in the `users` table the middleware
 * auto-creates the account before forwarding the request.
 *
 * @module middleware/auth
 */

const { getDatabase } = require('../database/init');

/**
 * Express middleware that authenticates requests by email.
 *
 * Steps:
 * 1. Reads the `x-user-email` header from the incoming request.
 * 2. Validates that the value matches a basic email format.
 * 3. Looks the email up in the `users` table.
 *    - If the user exists, attaches `req.userEmail` and calls `next()`.
 *    - If the user does not exist, inserts a new row first, then continues.
 *
 * On success `req.userEmail` is set so downstream handlers can scope database
 * queries to the authenticated user.
 *
 * @param {import('express').Request} req  - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware.
 * @returns {void}
 */
function authenticateUser(req, res, next) {
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
  
  // Check if user exists, create if not
  db.get('SELECT email FROM users WHERE email = ?', [userEmail], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!row) {
      // Create new user
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
