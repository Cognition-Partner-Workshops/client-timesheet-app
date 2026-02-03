/**
 * @fileoverview Authentication middleware for email-based user verification.
 * Provides simple authentication using x-user-email header with auto user creation.
 * Designed for trusted internal network environments without password requirements.
 * @module middleware/auth
 */

const { getDatabase } = require('../database/init');

/**
 * Express middleware that authenticates users based on email header.
 * Validates the x-user-email header, checks email format, and auto-creates
 * new users if they don't exist in the database.
 * 
 * Authentication flow:
 * 1. Extract email from x-user-email header
 * 2. Validate email format using regex
 * 3. Check if user exists in database
 * 4. Create user if not exists
 * 5. Set req.userEmail for downstream handlers
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 * 
 * @example
 * // Use as route middleware
 * router.use(authenticateUser);
 * 
 * @example
 * // Use on specific route
 * router.get('/protected', authenticateUser, (req, res) => {
 *   console.log(req.userEmail); // User's email is available
 * });
 * 
 * @throws {401} If x-user-email header is missing.
 * @throws {400} If email format is invalid.
 * @throws {500} If database operation fails.
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
