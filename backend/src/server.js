/**
 * @fileoverview Express application entrypoint for the Client Timesheet API.
 *
 * Configures global middleware (security headers, CORS, rate limiting, logging,
 * body parsing), mounts route handlers, and starts the HTTP server after the
 * database has been initialised.
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

const app = express();

/** @type {number} Port the server listens on; defaults to 3001. */
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

/**
 * Global rate limiter applied to every request.
 * Allows a maximum of 100 requests per IP address within a 15-minute window.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * @route GET /health
 * @description Lightweight health-check endpoint used by load balancers and
 *              the Docker HEALTHCHECK directive to verify the service is up.
 * @returns {{ status: string, timestamp: string }} JSON with "OK" status and
 *          an ISO-8601 timestamp.
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Initialises the SQLite database and starts the Express server.
 *
 * If the database fails to initialise the process exits with code 1 so that
 * container orchestrators can restart the service automatically.
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
