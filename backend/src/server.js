/**
 * @fileoverview Main Express server configuration for the Client Timesheet Application.
 * This file sets up the Express application with security middleware, rate limiting,
 * logging, and API routes for authentication, clients, work entries, and reports.
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
 * Helmet adds various HTTP headers for security.
 */
app.use(helmet());

/**
 * CORS configuration allowing requests from the frontend application.
 * Defaults to localhost:5173 for development.
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
 * Uses 'combined' format for detailed logging.
 */
app.use(morgan('combined'));

/**
 * Body parsing middleware configuration.
 * Supports JSON payloads up to 10MB and URL-encoded data.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * Health check endpoint for monitoring and load balancer health checks.
 * @route GET /health
 * @returns {Object} Status object with 'OK' status and current timestamp
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * API Routes Configuration
 * - /api/auth: Authentication endpoints (login, user info)
 * - /api/clients: Client CRUD operations
 * - /api/work-entries: Work entry CRUD operations
 * - /api/reports: Report generation and export endpoints
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
 * Returns a JSON error response for any undefined routes.
 */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Initializes the database and starts the Express server.
 * This function sets up the SQLite database tables and indexes,
 * then starts listening for incoming HTTP requests.
 * @async
 * @function startServer
 * @throws {Error} If database initialization fails or server cannot start
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
