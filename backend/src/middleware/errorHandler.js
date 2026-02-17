/**
 * @file Centralised Express error-handling middleware.
 *
 * Catches all errors forwarded via `next(err)` and translates them into
 * consistent JSON responses.  Recognised error categories:
 *
 * - **Joi validation errors** → 400 with human-readable detail messages.
 * - **SQLite errors** (codes prefixed `SQLITE_`) → 500 with a generic message.
 * - **All other errors** → status from `err.status` (or 500) with the error
 *   message.
 *
 * @module middleware/errorHandler
 */

/**
 * Express error-handling middleware (four-argument signature).
 *
 * @param {Error}  err  - The error object thrown or passed to `next()`.
 * @param {import('express').Request}  req  - Express request.
 * @param {import('express').Response} res  - Express response.
 * @param {import('express').NextFunction} next - Express next callback (unused but required by Express).
 * @returns {void}
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
