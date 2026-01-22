/**
 * @fileoverview Express.js Backend Server Entry Point
 * 
 * This is the main entry point for the Employee Time Tracking API server.
 * It configures and initializes the Express application with all necessary
 * middleware, routes, and database connections.
 * 
 * The server provides RESTful API endpoints for:
 * - User authentication (email-only login with JWT tokens)
 * - Client management (CRUD operations for tracking clients)
 * - Work entry tracking (logging billable hours against clients)
 * - Report generation (aggregated hours with CSV/PDF export)
 * 
 * @requires express - Web application framework
 * @requires cors - Cross-Origin Resource Sharing middleware
 * @requires helmet - Security headers middleware
 * @requires morgan - HTTP request logging middleware
 * @requires express-rate-limit - Rate limiting middleware
 * 
 * @example
 * // Start the server in development mode:
 * // npm run dev
 * 
 * // Start the server in production mode:
 * // npm start
 * 
 * @see {@link ./routes/auth} for authentication endpoints
 * @see {@link ./routes/clients} for client management endpoints
 * @see {@link ./routes/workEntries} for work entry endpoints
 * @see {@link ./routes/reports} for report generation endpoints
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
 * Configured with security middleware, rate limiting, logging, and API routes.
 * @type {express.Application}
 */
const app = express();

/**
 * Server port number.
 * Defaults to 3001 if PORT environment variable is not set.
 * @type {number}
 */
const PORT = process.env.PORT || 3001;

/**
 * Security Middleware Configuration
 * 
 * Helmet sets various HTTP headers to help protect the app from well-known
 * web vulnerabilities (XSS, clickjacking, etc.).
 * 
 * CORS is configured to allow requests only from the frontend origin,
 * with credentials support for cookie-based sessions.
 */
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

/**
 * Rate Limiter Configuration
 * 
 * Limits each IP address to 100 requests per 15-minute window.
 * This helps prevent brute-force attacks and API abuse.
 * @type {express.RequestHandler}
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

/**
 * HTTP Request Logging
 * 
 * Uses Morgan in 'combined' format for detailed Apache-style logging.
 * Logs include: remote-addr, remote-user, date, method, url, http-version,
 * status, content-length, referrer, and user-agent.
 */
app.use(morgan('combined'));

/**
 * Request Body Parsing
 * 
 * Configures Express to parse JSON bodies (up to 10MB) and URL-encoded data.
 * The 10MB limit accommodates larger payloads like report exports.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * Health Check Endpoint
 * 
 * GET /health - Returns server status and current timestamp.
 * Used by load balancers and monitoring systems to verify server availability.
 * 
 * @route GET /health
 * @returns {Object} 200 - { status: 'OK', timestamp: ISO8601 string }
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * API Route Registration
 * 
 * All API routes are prefixed with /api and organized by resource:
 * - /api/auth - Authentication (login, user info)
 * - /api/clients - Client CRUD operations
 * - /api/work-entries - Work entry CRUD operations
 * - /api/reports - Report generation and export
 */
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);

/**
 * Global Error Handler
 * 
 * Catches all errors thrown by route handlers and middleware.
 * Formats error responses consistently and logs errors for debugging.
 */
app.use(errorHandler);

/**
 * 404 Not Found Handler
 * 
 * Catches all requests that don't match any defined routes.
 * Returns a JSON error response with 404 status.
 */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Initializes the database and starts the HTTP server.
 * 
 * This function performs the following steps:
 * 1. Initializes the SQLite in-memory database with required tables
 * 2. Creates necessary indexes for query performance
 * 3. Starts the Express server on the configured port
 * 
 * If database initialization fails, the process exits with code 1.
 * 
 * @async
 * @function startServer
 * @returns {Promise<void>}
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
