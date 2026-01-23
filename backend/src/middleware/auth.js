/**
 * @module middleware/auth
 * @description Authentication middleware for the timesheet application.
 * Provides email-based user authentication with automatic user creation.
 * Designed for trusted internal network environments where email-only authentication is acceptable.
 */

const { getDatabase } = require('../database/init');

/**
 * Express middleware that authenticates users based on the x-user-email header.
 * Validates the email format and automatically creates new users if they don't exist.
 *
 * Authentication flow:
 * 1. Extracts email from x-user-email header
 * 2. Validates email format using regex
 * 3. Checks if user exists in database
 * 4. Creates user if not found
 * 5. Sets req.userEmail for downstream middleware/routes
 *
 * @param {import('express').Request} req - Express request object. Expects x-user-email header.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 *
 * @throws {401} Returns 401 if x-user-email header is missing.
 * @throws {400} Returns 400 if email format is invalid.
 * @throws {500} Returns 500 if database operation fails.
 *
 * @example
 * // Use as route middleware
 * router.get('/protected', authenticateUser, (req, res) => {
 *   console.log('Authenticated user:', req.userEmail);
 *   res.json({ user: req.userEmail });
 * });
 *
 * @example
 * // Use for all routes in a router
 * router.use(authenticateUser);
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
