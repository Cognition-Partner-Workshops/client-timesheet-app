/**
 * Authentication Middleware
 *
 * Provides the `authenticateUser` Express middleware that gates protected
 * routes. Every request to a protected route must include an `x-user-email`
 * HTTP header (injected automatically by the frontend's Axios request
 * interceptor — see frontend/src/api/client.ts).
 *
 * Authentication flow:
 *  1. Extract the `x-user-email` header from the incoming request.
 *  2. Validate that it is a syntactically valid email address.
 *  3. Look the email up in the `users` table.
 *     - If the user exists, continue to the next handler.
 *     - If not, auto-create the user row (email-only signup) then continue.
 *  4. Attach the verified email to `req.userEmail` so downstream handlers
 *     can use it for data-scoping queries (multi-tenancy at the data layer).
 *
 * Used by:
 *  - routes/clients.js   (router-level: all routes)
 *  - routes/workEntries.js (router-level: all routes)
 *  - routes/reports.js   (router-level: all routes)
 *  - routes/auth.js      (per-route: GET /me only)
 *
 * Related files:
 *  - database/init.js              — provides getDatabase() singleton
 *  - frontend/src/api/client.ts    — injects the x-user-email header
 *  - frontend/src/contexts/AuthContext.tsx — stores email in localStorage
 */
const { getDatabase } = require('../database/init');

function authenticateUser(req, res, next) {
  const userEmail = req.headers['x-user-email'];
  
  if (!userEmail) {
    return res.status(401).json({ error: 'User email required in x-user-email header' });
  }

  // Validate email format before touching the database
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const db = getDatabase();
  
  // Upsert pattern: look up the user, auto-create on first encounter.
  // This is intentional — the app uses passwordless email-only auth.
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
