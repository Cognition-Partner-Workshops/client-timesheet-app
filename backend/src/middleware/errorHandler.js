/**
 * @fileoverview Global error handling middleware for the Time Tracker application.
 * Provides centralized error handling for validation errors, database errors, and general exceptions.
 * @module middleware/errorHandler
 */

/**
 * Express error handling middleware that processes different types of errors
 * and returns appropriate HTTP responses.
 * 
 * Handles the following error types:
 * - Joi validation errors (400 Bad Request)
 * - SQLite database errors (500 Internal Server Error)
 * - General errors (uses error status or defaults to 500)
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
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
