const crypto = require('crypto');

// Log levels with numeric priority
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Current log level (can be set via environment variable)
const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info;

// Service name for log identification
const SERVICE_NAME = process.env.SERVICE_NAME || 'client-timesheet-app';

// Generate a unique correlation ID
function generateCorrelationId() {
  return crypto.randomUUID();
}

// Format log entry as structured JSON
function formatLogEntry(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const correlationId = context.correlationId || generateCorrelationId();
  
  const logEntry = {
    timestamp,
    level,
    service: SERVICE_NAME,
    correlationId,
    message,
    ...context,
  };

  // Remove undefined values
  Object.keys(logEntry).forEach(key => {
    if (logEntry[key] === undefined) {
      delete logEntry[key];
    }
  });

  return logEntry;
}

// Core logging function
function log(level, message, context = {}) {
  if (LOG_LEVELS[level] > currentLogLevel) {
    return;
  }

  const logEntry = formatLogEntry(level, message, context);
  const jsonLog = JSON.stringify(logEntry);

  switch (level) {
    case 'error':
      console.error(jsonLog);
      break;
    case 'warn':
      console.warn(jsonLog);
      break;
    case 'debug':
      console.debug(jsonLog);
      break;
    default:
      console.log(jsonLog);
  }

  return logEntry;
}

// Logger interface
const logger = {
  error: (message, context = {}) => log('error', message, context),
  warn: (message, context = {}) => log('warn', message, context),
  info: (message, context = {}) => log('info', message, context),
  debug: (message, context = {}) => log('debug', message, context),
  
  // Create a child logger with preset context
  child: (defaultContext = {}) => ({
    error: (message, context = {}) => log('error', message, { ...defaultContext, ...context }),
    warn: (message, context = {}) => log('warn', message, { ...defaultContext, ...context }),
    info: (message, context = {}) => log('info', message, { ...defaultContext, ...context }),
    debug: (message, context = {}) => log('debug', message, { ...defaultContext, ...context }),
  }),
};

// Business event types for standardized logging
const BusinessEvents = {
  // Authentication events
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILURE: 'auth.login.failure',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_TOKEN_INVALID: 'auth.token.invalid',
  
  // Client events
  CLIENT_CREATED: 'client.created',
  CLIENT_UPDATED: 'client.updated',
  CLIENT_DELETED: 'client.deleted',
  CLIENT_VIEWED: 'client.viewed',
  CLIENT_LIST_VIEWED: 'client.list.viewed',
  
  // Work entry events
  WORK_ENTRY_CREATED: 'work_entry.created',
  WORK_ENTRY_UPDATED: 'work_entry.updated',
  WORK_ENTRY_DELETED: 'work_entry.deleted',
  WORK_ENTRY_VIEWED: 'work_entry.viewed',
  WORK_ENTRY_LIST_VIEWED: 'work_entry.list.viewed',
  
  // Report events
  REPORT_GENERATED: 'report.generated',
  REPORT_EXPORTED_CSV: 'report.exported.csv',
  REPORT_EXPORTED_PDF: 'report.exported.pdf',
  
  // SLO events
  SLO_METRICS_RETRIEVED: 'slo.metrics.retrieved',
  SLO_QUALITY_GATE_PASSED: 'slo.quality_gate.passed',
  SLO_QUALITY_GATE_FAILED: 'slo.quality_gate.failed',
  SLO_THRESHOLD_BREACH: 'slo.threshold.breach',
  
  // System events
  SYSTEM_STARTUP: 'system.startup',
  SYSTEM_SHUTDOWN: 'system.shutdown',
  DATABASE_CONNECTED: 'database.connected',
  DATABASE_ERROR: 'database.error',
  REQUEST_RECEIVED: 'request.received',
  REQUEST_COMPLETED: 'request.completed',
  REQUEST_ERROR: 'request.error',
};

// Business logger for domain-specific events
const businessLogger = {
  logEvent: (eventType, data = {}) => {
    return logger.info(`Business event: ${eventType}`, {
      eventType,
      eventCategory: eventType.split('.')[0],
      ...data,
    });
  },
  
  // Authentication logging
  logLoginSuccess: (userEmail, correlationId) => {
    return businessLogger.logEvent(BusinessEvents.AUTH_LOGIN_SUCCESS, {
      userEmail,
      correlationId,
    });
  },
  
  logLoginFailure: (userEmail, reason, correlationId) => {
    return logger.warn(`Authentication failed: ${reason}`, {
      eventType: BusinessEvents.AUTH_LOGIN_FAILURE,
      userEmail,
      reason,
      correlationId,
    });
  },
  
  logAuthSuccess: (userEmail, correlationId) => {
    return businessLogger.logEvent(BusinessEvents.AUTH_LOGIN_SUCCESS, {
      userEmail,
      correlationId,
    });
  },
  
  logAuthFailure: (reason, correlationId) => {
    return logger.warn(`Authentication failed: ${reason}`, {
      eventType: BusinessEvents.AUTH_LOGIN_FAILURE,
      reason,
      correlationId,
    });
  },
  
  // Client logging
  logClientCreated: (clientId, clientName, userEmail, correlationId) => {
    return businessLogger.logEvent(BusinessEvents.CLIENT_CREATED, {
      clientId,
      clientName,
      userEmail,
      correlationId,
    });
  },
  
  logClientUpdated: (clientId, changes, userEmail, correlationId) => {
    return businessLogger.logEvent(BusinessEvents.CLIENT_UPDATED, {
      clientId,
      changes: Object.keys(changes),
      userEmail,
      correlationId,
    });
  },
  
  logClientDeleted: (clientId, userEmail, correlationId) => {
    return businessLogger.logEvent(BusinessEvents.CLIENT_DELETED, {
      clientId,
      userEmail,
      correlationId,
    });
  },
  
  // Work entry logging
  logWorkEntryCreated: (entryId, clientId, hours, userEmail, correlationId) => {
    return businessLogger.logEvent(BusinessEvents.WORK_ENTRY_CREATED, {
      entryId,
      clientId,
      hours,
      userEmail,
      correlationId,
    });
  },
  
  logWorkEntryUpdated: (entryId, changes, userEmail, correlationId) => {
    return businessLogger.logEvent(BusinessEvents.WORK_ENTRY_UPDATED, {
      entryId,
      changes: Object.keys(changes),
      userEmail,
      correlationId,
    });
  },
  
  logWorkEntryDeleted: (entryId, userEmail, correlationId) => {
    return businessLogger.logEvent(BusinessEvents.WORK_ENTRY_DELETED, {
      entryId,
      userEmail,
      correlationId,
    });
  },
  
  // Report logging
  logReportGenerated: (reportType, clientId, userEmail, correlationId) => {
    return businessLogger.logEvent(BusinessEvents.REPORT_GENERATED, {
      reportType,
      clientId,
      userEmail,
      correlationId,
    });
  },
  
  logReportExported: (format, clientId, entryCount, userEmail, correlationId) => {
    const eventType = format === 'csv' 
      ? BusinessEvents.REPORT_EXPORTED_CSV 
      : BusinessEvents.REPORT_EXPORTED_PDF;
    
    return businessLogger.logEvent(eventType, {
      format,
      clientId,
      entryCount,
      userEmail,
      correlationId,
    });
  },
  
  // SLO logging
  logSLOMetrics: (metrics, correlationId) => {
    const eventType = metrics.qualityGates?.passed 
      ? BusinessEvents.SLO_QUALITY_GATE_PASSED 
      : BusinessEvents.SLO_QUALITY_GATE_FAILED;
    
    return businessLogger.logEvent(eventType, {
      availability: metrics.availability?.current,
      latencyP95: metrics.latency?.p95?.current,
      errorRate: metrics.errorRate?.current,
      throughput: metrics.throughput?.requestsPerMinute,
      qualityGatesPassed: metrics.qualityGates?.passed,
      correlationId,
    });
  },
  
  logSLOThresholdBreach: (metric, current, target, correlationId) => {
    return logger.warn(`SLO threshold breach: ${metric}`, {
      eventType: BusinessEvents.SLO_THRESHOLD_BREACH,
      metric,
      current,
      target,
      correlationId,
    });
  },
  
  logQualityGatesChecked: (passed, gates, correlationId) => {
    const eventType = passed 
      ? BusinessEvents.SLO_QUALITY_GATE_PASSED 
      : BusinessEvents.SLO_QUALITY_GATE_FAILED;
    
    return businessLogger.logEvent(eventType, {
      passed,
      gatesCount: gates.length,
      failedGates: gates.filter(g => !g.passed).map(g => g.name),
      correlationId,
    });
  },
};

// Metrics logger for SLO-related metrics
const metricsLogger = {
  logRequestMetrics: (data) => {
    return logger.info('Request metrics', {
      eventType: 'metrics.request',
      method: data.method,
      path: data.path,
      statusCode: data.statusCode,
      durationMs: data.durationMs,
      userEmail: data.userEmail,
      correlationId: data.correlationId,
    });
  },
  
  logLatencyMetrics: (data) => {
    return logger.debug('Latency metrics', {
      eventType: 'metrics.latency',
      endpoint: data.endpoint,
      durationMs: data.durationMs,
      percentile: data.percentile,
      correlationId: data.correlationId,
    });
  },
  
  logErrorMetrics: (data) => {
    return logger.info('Error metrics', {
      eventType: 'metrics.error',
      endpoint: data.endpoint,
      statusCode: data.statusCode,
      errorType: data.errorType,
      correlationId: data.correlationId,
    });
  },
  
  logThroughputMetrics: (requestsPerMinute, timeWindow, correlationId) => {
    return logger.debug('Throughput metrics', {
      eventType: 'metrics.throughput',
      requestsPerMinute,
      timeWindow,
      correlationId,
    });
  },
};

module.exports = {
  logger,
  businessLogger,
  metricsLogger,
  BusinessEvents,
  generateCorrelationId,
  LOG_LEVELS,
};
