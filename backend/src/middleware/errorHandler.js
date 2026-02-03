/**
 * @fileoverview Centralized error handling middleware for the Express application.
 * Provides consistent error responses for different error types including
 * validation errors, database errors, and generic server errors.
 * @module middleware/errorHandler
 */

/**
 * Express error handling middleware that processes and formats error responses.
 * Handles different error types with appropriate HTTP status codes and messages:
 * - Joi validation errors (400): Returns detailed validation error messages
 * - SQLite database errors (500): Returns generic database error message
 * - Custom errors: Uses provided status code and message
 * - Unknown errors (500): Returns generic internal server error
 * 
 * @param {Error} err - The error object to handle.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 * 
 * @example
 * // Register as the last middleware in Express app
 * app.use(errorHandler);
 * 
 * // Errors thrown or passed to next() will be handled
 * router.post('/data', (req, res, next) => {
 *   const { error } = schema.validate(req.body);
 *   if (error) return next(error); // Joi error handled automatically
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
