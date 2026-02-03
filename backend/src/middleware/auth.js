/**
 * @fileoverview Authentication middleware for email-based user verification.
 * 
 * This module provides middleware that authenticates users based on their email
 * address passed in the x-user-email header. It implements a simple authentication
 * scheme suitable for internal/trusted network environments.
 * 
 * @module middleware/auth
 * @requires ../database/init
 */

const { getDatabase } = require('../database/init');

/**
 * Express middleware that authenticates users based on email header.
 * 
 * This middleware:
 * 1. Extracts the user email from the 'x-user-email' header
 * 2. Validates the email format using a regex pattern
 * 3. Checks if the user exists in the database
 * 4. Creates a new user record if they don't exist
 * 5. Attaches the user email to the request object for downstream handlers
 * 
 * @function authenticateUser
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Usage in route definition
 * router.use(authenticateUser);
 * 
 * @example
 * // Access user email in route handler
 * router.get('/data', (req, res) => {
 *   const userEmail = req.userEmail;
 *   // ... handle request
 * });
 */
function authenticateUser(req, res, next) {
  const userEmail = req.headers['x-user-email'];
  
  if (!userEmail) {
    return res.status(401).json({ error: 'User email required in x-user-email header' });
  }

  /** @type {RegExp} Email validation pattern */
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
