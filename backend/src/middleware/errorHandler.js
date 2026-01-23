/**
 * @module middleware/errorHandler
 * @description Centralized error handling middleware for the timesheet application.
 * Processes all errors thrown in the application and returns appropriate HTTP responses.
 * Handles Joi validation errors, SQLite database errors, and generic application errors.
 */

/**
 * Express error handling middleware that processes all application errors.
 * Must be registered as the last middleware in the Express middleware chain.
 *
 * Error handling behavior:
 * - Joi validation errors: Returns 400 with validation details
 * - SQLite errors (codes starting with SQLITE_): Returns 500 with generic database error message
 * - Custom errors with status property: Returns the specified status code
 * - All other errors: Returns 500 with error message or generic message
 *
 * All errors are logged to console for debugging purposes.
 *
 * @param {Error} err - The error object thrown by previous middleware or route handlers.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function (unused but required for Express error middleware signature).
 * @returns {void}
 *
 * @example
 * // Register as the last middleware
 * app.use(errorHandler);
 *
 * @example
 * // Throwing a custom error with status
 * const error = new Error('Resource not found');
 * error.status = 404;
 * next(error);
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
