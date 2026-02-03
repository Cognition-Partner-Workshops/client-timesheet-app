/**
 * @fileoverview Main Express server entry point for the Client Timesheet Application.
 * This module configures and starts the HTTP server with all middleware, routes,
 * and database initialization.
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
 * Server port number, defaults to 3001 if not specified in environment.
 * @type {number}
 */
const PORT = process.env.PORT || 3001;

/* ============================================
   Security Middleware Configuration
   ============================================ */

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

/* ============================================
   Logging and Body Parsing
   ============================================ */

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ============================================
   Health Check Endpoint
   ============================================ */

/**
 * Health check endpoint for monitoring and load balancer health checks.
 * @route GET /health
 * @returns {Object} Status object with 'OK' status and current timestamp
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/* ============================================
   API Routes
   ============================================ */

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);

/* ============================================
   Error Handling
   ============================================ */

app.use(errorHandler);

/**
 * Catch-all handler for undefined routes.
 * @route * (all unmatched routes)
 * @returns {Object} Error object with 'Route not found' message
 */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ============================================
   Server Initialization
   ============================================ */

/**
 * Initializes the database and starts the Express server.
 * This function is called automatically when the module is loaded.
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
