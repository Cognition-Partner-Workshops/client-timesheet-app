/**
 * @fileoverview Centralised error-handling middleware for the Express app.
 *
 * Catches errors forwarded via `next(err)` from route handlers and returns a
 * consistently-shaped JSON error response.  Handles Joi validation errors and
 * SQLite driver errors as special cases.
 *
 * @module middleware/errorHandler
 */

/**
 * Express error-handling middleware (four-parameter signature).
 *
 * Categorises the error and responds with the appropriate HTTP status code:
 *  - **400** - Joi validation errors (`err.isJoi === true`).  The response
 *    includes a `details` array of human-readable messages.
 *  - **500** - SQLite errors (error code starting with `SQLITE_`).  A generic
 *    message is returned to avoid leaking internal database details.
 *  - **err.status || 500** - Everything else falls through to a default
 *    handler that uses the status attached to the error object, or 500.
 *
 * @param {Error} err  - The error object thrown or passed to `next()`.
 * @param {import('express').Request} req  - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware.
 * @returns {void}
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details.map(detail => detail.message)
    });
  }

  // SQLite errors
  if (err.code && err.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      error: 'Database error',
      message: 'An error occurred while processing your request'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
}

module.exports = {
  errorHandler
};
