/**
 * @fileoverview Centralized error handling middleware for Express.
 * 
 * This module provides a unified error handler that processes different types
 * of errors (validation, database, generic) and returns appropriate HTTP responses.
 * It ensures consistent error response format across the entire API.
 * 
 * @module middleware/errorHandler
 */

/**
 * Express error handling middleware that processes all errors thrown in route handlers.
 * 
 * Handles the following error types:
 * - Joi validation errors: Returns 400 with validation details
 * - SQLite database errors: Returns 500 with generic database error message
 * - Generic errors: Returns the error's status code or 500 with error message
 * 
 * @function errorHandler
 * @param {Error} err - The error object thrown or passed to next()
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Usage in Express app
 * app.use(errorHandler);
 * 
 * @example
 * // Triggering from a route handler
 * router.post('/data', (req, res, next) => {
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
