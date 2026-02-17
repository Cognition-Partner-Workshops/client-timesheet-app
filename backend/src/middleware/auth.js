/**
 * @file Email-based authentication middleware.
 *
 * Every protected route uses {@link authenticateUser} to identify the caller
 * via the `x-user-email` request header.  If the email belongs to an existing
 * user the request proceeds; otherwise a new user row is inserted
 * automatically (auto-registration).
 *
 * @module middleware/auth
 */

const { getDatabase } = require('../database/init');

/**
 * Express middleware that authenticates (and optionally registers) users by
 * the email address supplied in the `x-user-email` header.
 *
 * On success the validated email is stored on `req.userEmail` for downstream
 * handlers to consume.
 *
 * @param {import('express').Request}  req  - Express request; expects `x-user-email` header.
 * @param {import('express').Response} res  - Express response.
 * @param {import('express').NextFunction} next - Express next callback.
 * @returns {void}
 *
 * @throws 401 if the header is missing.
 * @throws 400 if the email format is invalid.
 * @throws 500 on database errors.
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
