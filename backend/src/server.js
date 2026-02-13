/**
 * Backend Entrypoint — Express Application Setup
 *
 * This file is the main entry point for the backend server. It assembles the
 * full Express middleware stack, mounts all API route modules, and starts the
 * HTTP server after the database is ready.
 *
 * Middleware stack (applied in order):
 *  1. helmet        — Sets security-related HTTP headers
 *  2. cors          — Restricts cross-origin requests to the frontend origin
 *  3. rateLimit     — Global rate limiter (100 req / 15 min per IP)
 *  4. morgan        — HTTP request logging ("combined" format)
 *  5. express.json  — Parses JSON request bodies (10 MB limit)
 *  6. express.urlencoded — Parses URL-encoded form bodies
 *
 * Route hierarchy:
 *  /health           — Unauthenticated health-check probe
 *  /api/auth         — Login and current-user endpoints  (routes/auth.js)
 *  /api/clients      — Client CRUD                       (routes/clients.js)
 *  /api/work-entries  — Work-entry CRUD                   (routes/workEntries.js)
 *  /api/reports      — Report generation & export         (routes/reports.js)
 *
 * After routes, two terminal handlers are registered:
 *  - errorHandler  — Catches thrown/next(err) errors and returns JSON
 *  - 404 fallback  — Returns 404 for any unmatched route
 *
 * Startup sequence (see startServer()):
 *  1. Initialize SQLite database and create tables (database/init.js)
 *  2. Bind to PORT (default 3001, overridable via env)
 *  3. Exit with code 1 on any initialization failure
 *
 * Related files:
 *  - database/init.js          — DB connection singleton & schema creation
 *  - middleware/auth.js        — Per-request user authentication
 *  - middleware/errorHandler.js — Centralized error formatting
 *  - validation/schemas.js     — Joi schemas used inside route handlers
 *  - docker/overrides/server.js — Production override that also serves static
 *                                  frontend assets and adds extra security
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
const PORT = process.env.PORT || 3001;

// Security middleware — helmet sets headers like X-Content-Type-Options,
// Strict-Transport-Security, etc. CORS is locked to the frontend origin so
// browsers reject requests from unknown origins.
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Global rate limiter — prevents abuse across all endpoints.
// A stricter per-route limiter can be added to sensitive paths like /api/auth.
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

// Health check — used by Docker HEALTHCHECK, deployment scripts, and uptime
// monitors. Intentionally unauthenticated so external probes can reach it.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API route mounting — each module is an Express Router that applies its own
// authentication middleware (via authenticateUser) where needed.
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);

// Centralized error handler — must be registered after all routes so that
// next(err) calls from route handlers are caught here.
app.use(errorHandler);

// Catch-all 404 — any request that didn't match a route above gets a
// structured JSON error rather than Express's default HTML response.
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize the database schema (creates tables & indexes if they don't
// exist), then bind the HTTP server. If anything fails during startup the
// process exits with code 1 so container orchestrators can detect the failure.
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
