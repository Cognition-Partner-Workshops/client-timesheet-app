/**
 * @fileoverview Express server configuration for the Time Tracking API.
 * 
 * This module sets up the main Express application with security middleware,
 * rate limiting, logging, and route handlers for the time tracking system.
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
 * Server port number. Defaults to 3001 if PORT environment variable is not set.
 * @type {number}
 */
const PORT = process.env.PORT || 3001;

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

/**
 * Security middleware using Helmet to set various HTTP headers.
 * Protects against common web vulnerabilities like XSS, clickjacking, etc.
 */
app.use(helmet());

/**
 * CORS configuration to allow cross-origin requests from the frontend.
 * @see https://expressjs.com/en/resources/middleware/cors.html
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

/**
 * HTTP request logging using Morgan in 'combined' format.
 * Logs: remote-addr, remote-user, date, method, url, http-version, status, res[content-length], referrer, user-agent
 */
app.use(morgan('combined'));

/**
 * Body parsing middleware for JSON and URL-encoded data.
 * JSON body limit set to 10MB to accommodate larger payloads.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =============================================================================
// ROUTES
// =============================================================================

/**
 * Health check endpoint for monitoring and load balancer health checks.
 * @route GET /health
 * @returns {Object} Status object with 'OK' status and current timestamp
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * Authentication routes - handles user login and session management.
 * @see ./routes/auth.js
 */
app.use('/api/auth', authRoutes);

/**
 * Client management routes - CRUD operations for clients.
 * @see ./routes/clients.js
 */
app.use('/api/clients', clientRoutes);

/**
 * Work entry routes - CRUD operations for time tracking entries.
 * @see ./routes/workEntries.js
 */
app.use('/api/work-entries', workEntryRoutes);

/**
 * Report routes - generates reports and exports (CSV, PDF).
 * @see ./routes/reports.js
 */
app.use('/api/reports', reportRoutes);

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Global error handler middleware.
 * Catches and processes all errors thrown in route handlers.
 */
app.use(errorHandler);

/**
 * 404 handler for undefined routes.
 * Returns a JSON error response for any unmatched routes.
 */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// =============================================================================
// SERVER INITIALIZATION
// =============================================================================

/**
 * Initializes the database and starts the Express server.
 * 
 * This function performs the following steps:
 * 1. Initializes the SQLite database and creates tables if needed
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
