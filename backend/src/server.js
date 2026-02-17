/**
 * @file Express application entry point for the employee time-tracking API.
 *
 * Configures security middleware (Helmet, CORS, rate limiting), request
 * logging, body parsing, route mounting, and centralised error handling,
 * then initialises the SQLite database and starts listening.
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

/** @type {import('express').Application} */
const app = express();

/** Server port – defaults to 3001 when the PORT env var is not set. */
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

/**
 * Global rate limiter applied to every request.
 * Allows a maximum of 100 requests per IP within a 15-minute window.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(morgan('combined'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * GET /health
 * Lightweight health-check endpoint used by load balancers and uptime monitors.
 *
 * @returns {Object} 200 – `{ status: 'OK', timestamp: string }`
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);

app.use(errorHandler);

/**
 * Catch-all handler for unmatched routes.
 * Returns a 404 JSON response.
 */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Initialises the SQLite database and starts the Express server.
 * Exits the process with code 1 if database initialisation fails.
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
