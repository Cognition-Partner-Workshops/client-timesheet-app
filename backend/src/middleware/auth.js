/**
 * @fileoverview Authentication middleware for the Client Timesheet Application.
 * Provides email-based authentication that validates user identity via the x-user-email header.
 * This is a simplified authentication mechanism suitable for trusted internal networks.
 * 
 * @module middleware/auth
 * @requires ../database/init
 */

const { getDatabase } = require('../database/init');

/**
 * Regular expression pattern for validating email addresses.
 * Matches standard email format: local-part@domain.extension
 * @constant {RegExp}
 * @private
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Express middleware that authenticates users based on the x-user-email header.
 * This middleware performs the following operations:
 * 1. Extracts and validates the email from the request header
 * 2. Checks if the user exists in the database
 * 3. Creates a new user record if the user doesn't exist
 * 4. Attaches the user email to the request object for downstream handlers
 * 
 * @function authenticateUser
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Use as route middleware
 * router.use(authenticateUser);
 * 
 * // Or on specific routes
 * router.get('/protected', authenticateUser, (req, res) => {
 *   console.log(req.userEmail); // Access authenticated user's email
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
