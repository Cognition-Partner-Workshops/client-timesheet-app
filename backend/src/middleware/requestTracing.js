const { logger, metricsLogger, generateCorrelationId } = require('../utils/logger');

// Request tracing middleware - adds correlation ID and logs request lifecycle
function requestTracingMiddleware(req, res, next) {
  // Generate or use existing correlation ID from header
  const correlationId = req.headers['x-correlation-id'] || 
                        req.headers['x-request-id'] || 
                        generateCorrelationId();
  
  // Attach correlation ID to request for use in route handlers
  req.correlationId = correlationId;
  
  // Set correlation ID in response header for client tracking
  res.setHeader('X-Correlation-ID', correlationId);
  
  // Record request start time
  const startTime = Date.now();
  const startHrTime = process.hrtime();
  
  // Extract request metadata
  const requestMetadata = {
    correlationId,
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection?.remoteAddress,
    userEmail: req.headers['x-user-email'] || req.userEmail,
  };

  // Log request received (skip health checks to reduce noise)
  if (req.path !== '/health') {
    logger.info('Request received', {
      eventType: 'request.received',
      ...requestMetadata,
    });
  }

  // Capture response finish event
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const hrDuration = process.hrtime(startHrTime);
    const durationNs = hrDuration[0] * 1e9 + hrDuration[1];
    
    const responseMetadata = {
      ...requestMetadata,
      statusCode: res.statusCode,
      durationMs,
      durationNs,
      contentLength: res.getHeader('content-length'),
    };

    // Skip health check logging to reduce noise
    if (req.path === '/health') {
      return;
    }

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', {
        eventType: 'request.error',
        errorType: 'server_error',
        ...responseMetadata,
      });
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', {
        eventType: 'request.error',
        errorType: 'client_error',
        ...responseMetadata,
      });
    } else {
      logger.info('Request completed', {
        eventType: 'request.completed',
        ...responseMetadata,
      });
    }

    // Log metrics for SLO tracking
    metricsLogger.logRequestMetrics({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs,
      userEmail: requestMetadata.userEmail,
      correlationId,
    });
  });

  // Handle request errors
  res.on('error', (error) => {
    logger.error('Request error', {
      eventType: 'request.error',
      errorType: 'connection_error',
      error: error.message,
      stack: error.stack,
      ...requestMetadata,
    });
  });

  next();
}

// Trace context helper - creates a trace context object for passing through the application
function createTraceContext(req) {
  return {
    correlationId: req.correlationId,
    userEmail: req.userEmail,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  };
}

// Middleware to attach trace context to request
function attachTraceContext(req, res, next) {
  req.traceContext = createTraceContext(req);
  next();
}

module.exports = {
  requestTracingMiddleware,
  createTraceContext,
  attachTraceContext,
};
