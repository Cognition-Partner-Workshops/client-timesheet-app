 t/**
 * @fileoverview Main server entry point for the Client Timesheet API.
 * This module configures and starts the Express server with all middleware,
 * routes, and database initialization.
 *
 * @module server
 * @description Express server configuration with security middleware, rate limiting,
 * API routes, error handling, and Swagger documentation.
 *
 * @example
 * // Start the server
 * npm start
 *
 * // Development mode with auto-reload
 * npm run dev
 *
 * @see {@link module:swagger} for API documentation setup
 * @see {@link module:database/init} for database initialization
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
const { setupSwagger } = require('./swagger');

/**
 * Express application instance.
 * @constant {Object} app
 */
const app = express();

/**
 * Server port number. Defaults to 3001 if PORT environment variable is not set.
 * @constant {number} PORT
 */
const PORT = process.env.PORT || 3001;

// Security middleware - Helmet adds various HTTP headers for security
app.use(helmet());

// CORS configuration - Allow requests from frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

/**
 * Rate limiter configuration.
 * Limits each IP to 100 requests per 15-minute window to prevent abuse.
 *
 * @constant {Object} limiter
 * @property {number} windowMs - Time window in milliseconds (15 minutes)
 * @property {number} max - Maximum requests per window per IP
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// HTTP request logging using Morgan
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Setup Swagger API documentation (available at /api-docs)
setupSwagger(app);

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check endpoint
 *     description: |
 *       Returns the current server status and timestamp.
 *       Use this endpoint to verify the server is running and responsive.
 *
 *       **No authentication required.**
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *             example:
 *               status: OK
 *               timestamp: '2024-01-15T10:30:00.000Z'
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);

// Global error handling middleware
app.use(errorHandler);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Initializes the database and starts the Express server.
 *
 * @async
 * @function startServer
 * @description Performs the following startup sequence:
 * 1. Initializes SQLite database with schema
 * 2. Starts HTTP server on configured port
 * 3. Logs startup information including API docs URL
 *
 * @throws {Error} If database initialization fails
 * @throws {Error} If server fails to start
 *
 * @example
 * // Called automatically when module is loaded
 * // Or can be called manually for testing:
 * await startServer();
 */
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
