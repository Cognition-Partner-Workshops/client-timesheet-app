/**
 * @fileoverview Express server configuration and application entry point.
 * Sets up middleware, routes, error handling, and database initialization.
 * Configures security headers, CORS, rate limiting, and request logging.
 * @module server
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const workEntryRoutes = require('./routes/workEntries');
const reportRoutes = require('./routes/reports');

const { initializeDatabase } = require('./database/init');
const { errorHandler } = require('./middleware/errorHandler');

/**
 * Express application instance.
 * @type {import('express').Application}
 */
const app = express();

/**
 * Server port number. Defaults to 3001 if PORT environment variable is not set.
 * @type {number}
 */
const PORT = process.env.PORT || 3001;

// Security middleware - Helmet sets various HTTP headers for security
app.use(helmet());

// CORS configuration - allows requests from frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

/**
 * Rate limiter configuration to prevent abuse.
 * Limits each IP to 100 requests per 15-minute window.
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// HTTP request logging using Morgan in 'combined' format
app.use(morgan('combined'));

// Body parsing middleware for JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * @route GET /health
 * @description Health check endpoint for monitoring and load balancer probes.
 * Returns server status and current timestamp.
 * 
 * @returns {Object} 200 - Server status with timestamp.
 * @example
 * // Response
 * { "status": "OK", "timestamp": "2024-01-15T10:30:00.000Z" }
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);

// Centralized error handling middleware - must be registered after routes
app.use(errorHandler);

/**
 * @route * (catch-all)
 * @description 404 handler for undefined routes.
 * Returns a JSON error response for any unmatched routes.
 * 
 * @returns {Object} 404 - Route not found error.
 */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Initializes the database and starts the Express server.
 * Logs server URL and health check endpoint on successful startup.
 * Exits process with code 1 on initialization failure.
 * 
 * @async
 * @returns {Promise<void>}
 */
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
