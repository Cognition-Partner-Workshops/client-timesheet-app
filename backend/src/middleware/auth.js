/**
 * @fileoverview Authentication middleware for the Client Timesheet Application.
 * Implements simple email-based authentication using the x-user-email header.
 * Automatically creates new users if they don't exist in the database.
 * @module middleware/auth
 */

const { getDatabase } = require('../database/init');

/**
 * Regular expression pattern for validating email addresses.
 * Matches standard email format: local@domain.tld
 * @constant {RegExp}
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Express middleware that authenticates users based on the x-user-email header.
 * This middleware performs the following steps:
 * 1. Extracts email from x-user-email header
 * 2. Validates email format using regex
 * 3. Checks if user exists in database
 * 4. Creates new user if not found (auto-registration)
 * 5. Attaches userEmail to request object for downstream handlers
 * 
 * @function authenticateUser
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * router.use(authenticateUser);
 * router.get('/protected', (req, res) => {
 *   console.log(req.userEmail);
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
