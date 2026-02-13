/**
 * Centralized Error-Handling Middleware
 *
 * Registered as the **last** middleware in the Express stack (see server.js)
 * so that any error passed via `next(err)` from route handlers or preceding
 * middleware is caught here and returned as a consistent JSON response.
 *
 * Error classification (checked in order):
 *  1. Joi validation errors (`err.isJoi === true`)
 *     — returned as 400 with an array of human-readable messages.
 *     — triggered when route handlers call `schema.validate()` and forward
 *       the error object to `next()`.
 *  2. SQLite errors (`err.code` starts with "SQLITE_")
 *     — returned as 500 with a generic message to avoid leaking internals.
 *  3. Everything else
 *     — uses `err.status` if set, otherwise defaults to 500.
 *
 * Convention: route handlers that detect domain-level errors (e.g. "not found")
 * typically respond directly with `res.status(4xx).json(...)` instead of
 * using this handler. This middleware is the safety net for unexpected or
 * framework-level errors.
 *
 * Related files:
 *  - server.js               — registers this handler after all routes
 *  - validation/schemas.js   — Joi schemas whose errors flow through here
 *  - database/init.js        — source of SQLITE_* error codes
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details.map(detail => detail.message)
    });
  }

  if (err.code && err.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      error: 'Database error',
      message: 'An error occurred while processing your request'
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
}

module.exports = {
  errorHandler
};
