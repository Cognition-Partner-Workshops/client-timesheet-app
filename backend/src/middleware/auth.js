/**
 * @fileoverview Authentication middleware for the Time Tracking API.
 * 
 * This module provides email-based authentication middleware that validates
 * user identity via the x-user-email header. Users are automatically created
 * if they don't exist in the database.
 * 
 * @module middleware/auth
 * @requires ../database/init
 */

const { getDatabase } = require('../database/init');

/**
 * Email-based authentication middleware.
 * 
 * This middleware performs the following steps:
 * 1. Extracts the user email from the 'x-user-email' header
 * 2. Validates the email format using a regex pattern
 * 3. Checks if the user exists in the database
 * 4. Creates a new user record if the user doesn't exist
 * 5. Attaches the user email to the request object for downstream handlers
 * 
 * @function authenticateUser
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Usage in route file
 * const { authenticateUser } = require('../middleware/auth');
 * router.use(authenticateUser);
 * 
 * @throws {401} If x-user-email header is missing
 * @throws {400} If email format is invalid
 * @throws {500} If database operation fails
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
