/**
 * @fileoverview Express server configuration and application entry point.
 * Sets up middleware, routes, security features, and database initialization.
 * This is the main entry point for the backend API server.
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

/**
 * Security middleware configuration.
 * Helmet adds various HTTP headers for security.
 * CORS is configured to allow requests from the frontend URL.
 */
app.use(helmet());
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
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

/**
 * HTTP request logging middleware using Morgan.
 * Uses 'combined' format for detailed access logs.
 */
app.use(morgan('combined'));

/**
 * Body parsing middleware configuration.
 * Supports JSON payloads up to 10MB and URL-encoded data.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * @route GET /health
 * @description Health check endpoint for monitoring and load balancer probes.
 * Returns server status and current timestamp.
 * 
 * @returns {Object} 200 - Server health status with timestamp.
 * 
 * @example
 * // Response
 * { "status": "OK", "timestamp": "2024-01-15T10:30:00.000Z" }
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * API route mounting.
 * All API routes are prefixed with /api for clear separation.
 */
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);

/**
 * Global error handling middleware.
 * Must be registered after all routes.
 */
app.use(errorHandler);

/**
 * 404 handler for unmatched routes.
 * Catches all requests that don't match defined routes.
 */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Initializes the database and starts the Express server.
 * This is the main application bootstrap function.
 * 
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If database initialization or server startup fails.
 * 
 * @example
 * // Called automatically when this module is executed
 * startServer();
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
