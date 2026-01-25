const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const workEntryRoutes = require('./routes/workEntries');
const reportRoutes = require('./routes/reports');

const { initializeDatabase } = require('./database/init');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/work-entries', workEntryRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler - must be before error handler
app.use('*', (req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

// Error handling - must be last
app.use(errorHandler);

// Validate required environment variables
function validateEnvironment() {
  const warnings = [];
  
  if (!process.env.JWT_SECRET) {
    warnings.push('JWT_SECRET is not set. Using default value is insecure for production.');
  }
  
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be set and at least 32 characters in production');
    }
    if (!process.env.FRONTEND_URL) {
      warnings.push('FRONTEND_URL is not set. CORS may not work correctly.');
    }
  }
  
  warnings.forEach(warning => logger.warn(warning));
}

// Initialize database and start server
async function startServer() {
  try {
    validateEnvironment();
    await initializeDatabase();
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
        logger.info(`Health check: http://localhost:${PORT}/health`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
}

startServer();

module.exports = app;
