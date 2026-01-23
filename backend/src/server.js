/**
 * @module server
 * @description Main Express server configuration and entry point for the timesheet application.
 * Configures middleware stack, routes, and initializes the database.
 *
 * Middleware stack (in order):
 * 1. Helmet - Security headers
 * 2. CORS - Cross-origin resource sharing
 * 3. Rate limiting - Request throttling
 * 4. Morgan - HTTP request logging
 * 5. Body parsing - JSON and URL-encoded data
 *
 * Routes:
 * - /api/auth - Authentication endpoints
 * - /api/clients - Client management
 * - /api/work-entries - Work entry management
 * - /api/reports - Report generation
 * - /health - Health check endpoint
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
 * Helmet sets various HTTP headers for security (XSS protection, clickjacking prevention, etc.)
 */
app.use(helmet());

/**
 * CORS configuration.
 * Allows requests from the frontend URL specified in environment variables.
 * Defaults to localhost:5173 for development.
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

/**
 * Rate limiter configuration.
 * Limits each IP to 100 requests per 15-minute window to prevent abuse.
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

/**
 * HTTP request logging using Morgan in 'combined' format.
 * Logs: remote-addr, remote-user, date, method, url, http-version, status, content-length, referrer, user-agent
 */
app.use(morgan('combined'));

/**
 * Body parsing middleware.
 * Parses JSON bodies up to 10MB and URL-encoded data.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * @route GET /health
 * @description Health check endpoint for monitoring and load balancer health probes.
 * Returns current server status and timestamp.
 *
 * @returns {Object} 200 - Server is healthy
 * @returns {string} 200.status - "OK"
 * @returns {string} 200.timestamp - Current ISO timestamp
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * API route mounting.
 * All API routes are prefixed with /api.
 */
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);

/**
 * Centralized error handling middleware.
 * Must be registered after all routes.
 */
app.use(errorHandler);

/**
 * 404 handler for unmatched routes.
 * Catches all requests that don't match any defined route.
 */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Initializes the database and starts the Express server.
 * Logs server URL and health check endpoint on successful startup.
 * Exits with code 1 if initialization fails.
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
