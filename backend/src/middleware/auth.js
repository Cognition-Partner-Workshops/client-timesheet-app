/**
 * @fileoverview Authentication middleware for email-based user verification.
 * Provides simple email-based authentication without passwords.
 * Automatically creates new users on first login attempt.
 * @module middleware/auth
 */

const { getDatabase } = require('../database/init');

/**
 * Express middleware that authenticates users based on email header.
 * Validates the x-user-email header, checks email format, and ensures
 * the user exists in the database (creating them if necessary).
 * 
 * Authentication flow:
 * 1. Extract email from x-user-email header
 * 2. Validate email format using regex
 * 3. Check if user exists in database
 * 4. Create user if not found
 * 5. Attach userEmail to request object for downstream handlers
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 * 
 * @example
 * // Usage in route definition
 * router.use(authenticateUser);
 * 
 * // Or for specific routes
 * router.get('/protected', authenticateUser, (req, res) => {
 *   console.log(req.userEmail); // Access authenticated user's email
 * });
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
