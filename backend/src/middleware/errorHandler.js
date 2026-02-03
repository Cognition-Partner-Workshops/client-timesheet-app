/**
 * @fileoverview Centralized error handling middleware for the Express application.
 * 
 * Provides consistent error responses across all API endpoints by catching
 * and formatting errors from various sources including validation, database,
 * and application errors.
 * 
 * @module middleware/errorHandler
 */

/**
 * Express error handling middleware that processes all errors thrown in the application.
 * 
 * Handles the following error types:
 * - Joi validation errors: Returns 400 with detailed validation messages
 * - SQLite database errors: Returns 500 with generic database error message
 * - Custom errors with status: Returns the specified status code
 * - Unknown errors: Returns 500 with generic error message
 * 
 * @param {Error} err - The error object thrown or passed to next()
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Register as the last middleware in Express app
 * app.use(errorHandler);
 * 
 * @example
 * // Trigger from route handler
 * router.post('/', (req, res, next) => {
 *   const { error } = schema.validate(req.body);
 *   if (error) return next(error); // Handled by errorHandler
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
