/**
 * @fileoverview Centralized error handling middleware for the Express application.
 * Handles different error types including Joi validation errors, SQLite database errors,
 * and generic application errors with appropriate HTTP status codes.
 * @module middleware/errorHandler
 */

/**
 * Express error handling middleware that processes all errors thrown in route handlers.
 * Provides consistent error response format across the application.
 * 
 * Error types handled:
 * - Joi validation errors (400 Bad Request): Returns validation details
 * - SQLite database errors (500 Internal Server Error): Returns generic database error message
 * - Custom errors with status: Uses provided status code and message
 * - Unknown errors (500 Internal Server Error): Returns generic error message
 * 
 * @function errorHandler
 * @param {Error} err - The error object thrown by route handlers
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * app.use(errorHandler);
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
