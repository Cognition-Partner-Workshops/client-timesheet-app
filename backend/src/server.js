/**
 * @fileoverview Main Express server configuration for the Client Timesheet Application.
 * 
 * This file sets up the Express application with security middleware, rate limiting,
 * logging, and route handlers for the timesheet management API. The server provides
 * RESTful endpoints for authentication, client management, work entry tracking,
 * and report generation.
 * 
 * @module server
 * @requires express
 * @requires cors
 * @requires helmet
 * @requires morgan
 * @requires express-rate-limit
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
 * @type {express.Application}
 */
const app = express();

/**
 * Server port number, defaults to 3001 if not specified in environment.
 * @type {number}
 */
const PORT = process.env.PORT || 3001;

/**
 * Security middleware configuration.
 * Helmet helps secure Express apps by setting various HTTP headers.
 */
app.use(helmet());

/**
 * CORS configuration allowing requests from the frontend application.
 * Credentials are enabled to support cookie-based sessions if needed.
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

/**
 * Rate limiter configuration to prevent abuse.
 * Limits each IP to 100 requests per 15-minute window.
 * @type {express.RequestHandler}
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

/**
 * HTTP request logging middleware using Morgan.
 * Uses 'combined' format for detailed Apache-style logs.
 */
app.use(morgan('combined'));

/**
 * Body parsing middleware configuration.
 * Supports JSON payloads up to 10MB and URL-encoded data.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * Health check endpoint for monitoring and load balancer health probes.
 * @route GET /health
 * @returns {Object} Status object with 'OK' status and current timestamp
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * API route mounting.
 * All API routes are prefixed with /api for clear separation from static assets.
 */
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);

/**
 * Global error handling middleware.
 * Catches and processes all errors thrown in route handlers.
 */
app.use(errorHandler);

/**
 * 404 handler for unmatched routes.
 * Returns a JSON error response for any route not defined above.
 */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Initializes the database and starts the Express server.
 * 
 * This function performs the following steps:
 * 1. Initializes the SQLite database with required tables
 * 2. Starts the HTTP server on the configured port
 * 3. Logs server status and health check URL
 * 
 * @async
 * @function startServer
 * @throws {Error} If database initialization or server startup fails
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
