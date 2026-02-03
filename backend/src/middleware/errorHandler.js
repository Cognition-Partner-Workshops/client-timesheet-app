function errorHandler(err, req, res, next) {
  // Log error details for debugging (server-side only)
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    code: err.code,
    path: req.path,
    method: req.method
  });

  // Joi validation errors - safe to expose validation details
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details.map(detail => detail.message)
    });
  }

  // JWT errors - don't expose specific JWT error details
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication failed'
    });
  }

  // SQLite errors - don't expose database details
  if (err.code && err.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      error: 'An error occurred while processing your request'
    });
  }

  // Rate limit errors
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Too many requests, please try again later'
    });
  }

  // Default error - don't expose internal error messages in production
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: isProduction ? 'Internal server error' : (err.message || 'Internal server error')
  });
}

module.exports = {
  errorHandler
};
