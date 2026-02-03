/**
 * @fileoverview Centralized error handling middleware for the Client Timesheet Application.
 * Provides consistent error response formatting for various error types including
 * validation errors, database errors, and generic application errors.
 * 
 * @module middleware/errorHandler
 */

/**
 * Express error handling middleware that processes and formats error responses.
 * This middleware catches all errors thrown in route handlers and middleware,
 * providing appropriate HTTP status codes and user-friendly error messages.
 * 
 * Handles the following error types:
 * - Joi validation errors (400 Bad Request)
 * - SQLite database errors (500 Internal Server Error)
 * - Custom errors with status codes
 * - Generic errors (500 Internal Server Error)
 * 
 * @function errorHandler
 * @param {Error} err - The error object thrown by previous middleware or route handlers
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function (required for error middleware signature)
 * @returns {void}
 * 
 * @example
 * // Register as the last middleware in the chain
 * app.use(errorHandler);
 * 
 * // Errors thrown in routes will be caught and formatted
 * router.post('/data', (req, res, next) => {
 *   const { error } = schema.validate(req.body);
 *   if (error) return next(error); // Will be handled by errorHandler
 * });
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
