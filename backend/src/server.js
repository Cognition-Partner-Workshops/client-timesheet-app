/**
 * @fileoverview Main Express server configuration and application entry point.
 * 
 * This module sets up the Express application with:
 * - Security middleware (Helmet, CORS, rate limiting)
 * - Request logging (Morgan)
 * - Body parsing for JSON and URL-encoded data
 * - API route mounting
 * - Centralized error handling
 * - Database initialization
 * 
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
 * @constant {number}
 */
const PORT = process.env.PORT || 3001;

/**
 * Security middleware configuration.
 * - Helmet: Sets various HTTP headers for security
 * - CORS: Enables Cross-Origin Resource Sharing for the frontend
 */
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

/**
 * Rate limiter configuration.
 * Limits each IP to 100 requests per 15-minute window to prevent abuse.
 * @constant {import('express-rate-limit').RateLimitRequestHandler}
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

/**
 * Request logging middleware.
 * Uses 'combined' format for detailed Apache-style logs.
 */
app.use(morgan('combined'));

/**
 * Body parsing middleware.
 * - JSON: Parses JSON request bodies (max 10MB)
 * - URL-encoded: Parses URL-encoded form data
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * @route GET /health
 * @description Health check endpoint for monitoring and load balancers.
 * Returns server status and current timestamp.
 * 
 * @returns {Object} 200 - { status: 'OK', timestamp: ISO8601 string }
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * API route mounting.
 * All API routes are prefixed with /api for clear separation.
 * 
 * @see module:routes/auth - Authentication endpoints (/api/auth)
 * @see module:routes/clients - Client management endpoints (/api/clients)
 * @see module:routes/workEntries - Work entry endpoints (/api/work-entries)
 * @see module:routes/reports - Report generation endpoints (/api/reports)
 */
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);

/**
 * Centralized error handling middleware.
 * Must be registered after all routes.
 * @see module:middleware/errorHandler
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
 * Initializes the database and starts the HTTP server.
 * 
 * @async
 * @function startServer
 * @returns {Promise<void>}
 * @throws {Error} If database initialization or server startup fails
 * 
 * @example
 * // Server starts automatically when this module is executed
 * // node src/server.js
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
