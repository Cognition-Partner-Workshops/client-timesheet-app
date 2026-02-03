/**
 * @fileoverview Centralized error handling middleware for Express application.
 * Processes different error types and returns appropriate HTTP responses.
 * Handles Joi validation errors, SQLite database errors, and generic errors.
 * @module middleware/errorHandler
 */

/**
 * Express error handling middleware that processes all errors in the application.
 * Provides consistent error response format across all endpoints.
 * 
 * Error types handled:
 * - Joi validation errors: Returns 400 with validation details
 * - SQLite errors: Returns 500 with generic database error message
 * - Custom errors with status: Returns specified status code
 * - Generic errors: Returns 500 with error message
 * 
 * @param {Error} err - The error object to handle.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 * 
 * @example
 * // Register as last middleware in Express app
 * app.use(errorHandler);
 * 
 * @example
 * // Pass errors from route handlers
 * router.post('/data', (req, res, next) => {
 *   const { error } = schema.validate(req.body);
 *   if (error) return next(error); // Will be caught by errorHandler
 * });
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
