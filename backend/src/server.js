const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const workEntryRoutes = require('./routes/workEntries');
const reportRoutes = require('./routes/reports');

const { initializeDatabase, closeDatabase, checkDatabaseHealth } = require('./database/init');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

let server = null;
let isShuttingDown = false;

function structuredLog(level, message, meta = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'client-timesheet-api',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    ...meta
  };
  console.log(JSON.stringify(logEntry));
}

const jsonLogFormat = morgan((tokens, req, res) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    type: 'http_request',
    service: 'client-timesheet-api',
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: parseInt(tokens.status(req, res), 10),
    responseTime: parseFloat(tokens['response-time'](req, res)),
    contentLength: tokens.res(req, res, 'content-length'),
    userAgent: tokens['user-agent'](req, res),
    remoteAddr: tokens['remote-addr'](req, res)
  });
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Structured JSON logging for CloudWatch
app.use(jsonLogFormat);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Liveness probe - basic server health
app.get('/health/live', (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'SHUTTING_DOWN', timestamp: new Date().toISOString() });
  }
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Readiness probe - checks database connectivity
app.get('/health/ready', async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'SHUTTING_DOWN', timestamp: new Date().toISOString() });
  }

  try {
    const dbHealthy = await checkDatabaseHealth();
    if (dbHealthy) {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        checks: { database: 'healthy' }
      });
    } else {
      res.status(503).json({
        status: 'UNHEALTHY',
        timestamp: new Date().toISOString(),
        checks: { database: 'unhealthy' }
      });
    }
  } catch (error) {
    structuredLog('error', 'Health check failed', { error: error.message });
    res.status(503).json({
      status: 'UNHEALTHY',
      timestamp: new Date().toISOString(),
      checks: { database: 'error' }
    });
  }
});

// Legacy health check for backwards compatibility
app.get('/health', async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'SHUTTING_DOWN', timestamp: new Date().toISOString() });
  }

  try {
    const dbHealthy = await checkDatabaseHealth();
    res.status(dbHealthy ? 200 : 503).json({
      status: dbHealthy ? 'OK' : 'UNHEALTHY',
      timestamp: new Date().toISOString(),
      checks: { database: dbHealthy ? 'healthy' : 'unhealthy' }
    });
  } catch (error) {
    res.status(503).json({
      status: 'UNHEALTHY',
      timestamp: new Date().toISOString(),
      checks: { database: 'error' }
    });
  }
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

async function gracefulShutdown(signal) {
  structuredLog('info', `Received ${signal}, starting graceful shutdown`);
  isShuttingDown = true;

  const shutdownTimeout = parseInt(process.env.SHUTDOWN_TIMEOUT || '30000', 10);

  const forceShutdown = setTimeout(() => {
    structuredLog('error', 'Forced shutdown due to timeout');
    process.exit(1);
  }, shutdownTimeout);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      structuredLog('info', 'HTTP server closed');
    }

    await closeDatabase();
    structuredLog('info', 'Database connections closed');

    clearTimeout(forceShutdown);
    structuredLog('info', 'Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    structuredLog('error', 'Error during shutdown', { error: error.message });
    clearTimeout(forceShutdown);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  structuredLog('error', 'Uncaught exception', { error: error.message, stack: error.stack });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  structuredLog('error', 'Unhandled rejection', { reason: String(reason) });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    structuredLog('info', 'Database initialized successfully');

    server = app.listen(PORT, () => {
      structuredLog('info', 'Server started', { port: PORT });
      structuredLog('info', 'Health check endpoints available', {
        liveness: `/health/live`,
        readiness: `/health/ready`,
        legacy: `/health`
      });
    });
  } catch (error) {
    structuredLog('error', 'Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();

module.exports = app;
