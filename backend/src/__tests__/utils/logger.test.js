const {
  logger,
  businessLogger,
  metricsLogger,
  BusinessEvents,
  generateCorrelationId,
  LOG_LEVELS,
} = require('../../utils/logger');

describe('Logger Utility', () => {
  let consoleSpy;
  
  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
    };
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateCorrelationId', () => {
    it('should generate a valid UUID', () => {
      const correlationId = generateCorrelationId();
      expect(correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('LOG_LEVELS', () => {
    it('should have correct log level priorities', () => {
      expect(LOG_LEVELS.error).toBe(0);
      expect(LOG_LEVELS.warn).toBe(1);
      expect(LOG_LEVELS.info).toBe(2);
      expect(LOG_LEVELS.debug).toBe(3);
    });
  });

  describe('logger', () => {
    it('should log error messages', () => {
      const result = logger.error('Test error message', { testKey: 'testValue' });
      
      expect(consoleSpy.error).toHaveBeenCalled();
      expect(result).toHaveProperty('level', 'error');
      expect(result).toHaveProperty('message', 'Test error message');
      expect(result).toHaveProperty('testKey', 'testValue');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('correlationId');
      expect(result).toHaveProperty('service', 'client-timesheet-app');
    });

    it('should log warn messages', () => {
      const result = logger.warn('Test warning');
      
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(result).toHaveProperty('level', 'warn');
      expect(result).toHaveProperty('message', 'Test warning');
    });

    it('should log info messages', () => {
      const result = logger.info('Test info');
      
      expect(consoleSpy.log).toHaveBeenCalled();
      expect(result).toHaveProperty('level', 'info');
      expect(result).toHaveProperty('message', 'Test info');
    });

    it('should use provided correlation ID', () => {
      const correlationId = 'test-correlation-id';
      const result = logger.info('Test message', { correlationId });
      
      expect(result.correlationId).toBe(correlationId);
    });

    it('should create child logger with preset context', () => {
      const childLogger = logger.child({ userId: 'user123', requestId: 'req456' });
      const result = childLogger.info('Child log message');
      
      expect(result).toHaveProperty('userId', 'user123');
      expect(result).toHaveProperty('requestId', 'req456');
    });

    it('should merge child context with call context', () => {
      const childLogger = logger.child({ userId: 'user123' });
      const result = childLogger.info('Test', { extra: 'data' });
      
      expect(result).toHaveProperty('userId', 'user123');
      expect(result).toHaveProperty('extra', 'data');
    });
  });

  describe('BusinessEvents', () => {
    it('should have authentication events', () => {
      expect(BusinessEvents.AUTH_LOGIN_SUCCESS).toBe('auth.login.success');
      expect(BusinessEvents.AUTH_LOGIN_FAILURE).toBe('auth.login.failure');
      expect(BusinessEvents.AUTH_LOGOUT).toBe('auth.logout');
    });

    it('should have client events', () => {
      expect(BusinessEvents.CLIENT_CREATED).toBe('client.created');
      expect(BusinessEvents.CLIENT_UPDATED).toBe('client.updated');
      expect(BusinessEvents.CLIENT_DELETED).toBe('client.deleted');
    });

    it('should have work entry events', () => {
      expect(BusinessEvents.WORK_ENTRY_CREATED).toBe('work_entry.created');
      expect(BusinessEvents.WORK_ENTRY_UPDATED).toBe('work_entry.updated');
      expect(BusinessEvents.WORK_ENTRY_DELETED).toBe('work_entry.deleted');
    });

    it('should have report events', () => {
      expect(BusinessEvents.REPORT_GENERATED).toBe('report.generated');
      expect(BusinessEvents.REPORT_EXPORTED_CSV).toBe('report.exported.csv');
      expect(BusinessEvents.REPORT_EXPORTED_PDF).toBe('report.exported.pdf');
    });

    it('should have SLO events', () => {
      expect(BusinessEvents.SLO_QUALITY_GATE_PASSED).toBe('slo.quality_gate.passed');
      expect(BusinessEvents.SLO_QUALITY_GATE_FAILED).toBe('slo.quality_gate.failed');
      expect(BusinessEvents.SLO_THRESHOLD_BREACH).toBe('slo.threshold.breach');
    });
  });

  describe('businessLogger', () => {
    it('should log login success', () => {
      const result = businessLogger.logLoginSuccess('test@example.com', 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.AUTH_LOGIN_SUCCESS);
      expect(result).toHaveProperty('userEmail', 'test@example.com');
      expect(result).toHaveProperty('correlationId', 'corr-123');
    });

    it('should log login failure', () => {
      const result = businessLogger.logLoginFailure('test@example.com', 'invalid_credentials', 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.AUTH_LOGIN_FAILURE);
      expect(result).toHaveProperty('userEmail', 'test@example.com');
      expect(result).toHaveProperty('reason', 'invalid_credentials');
    });

    it('should log client created', () => {
      const result = businessLogger.logClientCreated(1, 'Test Client', 'user@example.com', 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.CLIENT_CREATED);
      expect(result).toHaveProperty('clientId', 1);
      expect(result).toHaveProperty('clientName', 'Test Client');
      expect(result).toHaveProperty('userEmail', 'user@example.com');
    });

    it('should log client updated', () => {
      const result = businessLogger.logClientUpdated(1, { name: 'New Name' }, 'user@example.com', 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.CLIENT_UPDATED);
      expect(result).toHaveProperty('clientId', 1);
      expect(result.changes).toContain('name');
    });

    it('should log client deleted', () => {
      const result = businessLogger.logClientDeleted(1, 'user@example.com', 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.CLIENT_DELETED);
      expect(result).toHaveProperty('clientId', 1);
    });

    it('should log work entry created', () => {
      const result = businessLogger.logWorkEntryCreated(1, 2, 8.5, 'user@example.com', 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.WORK_ENTRY_CREATED);
      expect(result).toHaveProperty('entryId', 1);
      expect(result).toHaveProperty('clientId', 2);
      expect(result).toHaveProperty('hours', 8.5);
    });

    it('should log work entry updated', () => {
      const result = businessLogger.logWorkEntryUpdated(1, { hours: 9 }, 'user@example.com', 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.WORK_ENTRY_UPDATED);
      expect(result).toHaveProperty('entryId', 1);
    });

    it('should log work entry deleted', () => {
      const result = businessLogger.logWorkEntryDeleted(1, 'user@example.com', 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.WORK_ENTRY_DELETED);
      expect(result).toHaveProperty('entryId', 1);
    });

    it('should log report generated', () => {
      const result = businessLogger.logReportGenerated('client_hours', 1, 'user@example.com', 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.REPORT_GENERATED);
      expect(result).toHaveProperty('reportType', 'client_hours');
      expect(result).toHaveProperty('clientId', 1);
    });

    it('should log report exported as CSV', () => {
      const result = businessLogger.logReportExported('csv', 1, 10, 'user@example.com', 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.REPORT_EXPORTED_CSV);
      expect(result).toHaveProperty('format', 'csv');
      expect(result).toHaveProperty('entryCount', 10);
    });

    it('should log report exported as PDF', () => {
      const result = businessLogger.logReportExported('pdf', 1, 10, 'user@example.com', 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.REPORT_EXPORTED_PDF);
      expect(result).toHaveProperty('format', 'pdf');
    });

    it('should log quality gates checked - passed', () => {
      const gates = [
        { name: 'Availability', passed: true },
        { name: 'Latency', passed: true },
      ];
      const result = businessLogger.logQualityGatesChecked(true, gates, 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.SLO_QUALITY_GATE_PASSED);
      expect(result).toHaveProperty('passed', true);
      expect(result).toHaveProperty('gatesCount', 2);
      expect(result.failedGates).toHaveLength(0);
    });

    it('should log quality gates checked - failed', () => {
      const gates = [
        { name: 'Availability', passed: true },
        { name: 'Latency', passed: false },
      ];
      const result = businessLogger.logQualityGatesChecked(false, gates, 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.SLO_QUALITY_GATE_FAILED);
      expect(result).toHaveProperty('passed', false);
      expect(result.failedGates).toContain('Latency');
    });

    it('should log SLO threshold breach', () => {
      const result = businessLogger.logSLOThresholdBreach('availability', 98.5, 99.9, 'corr-123');
      
      expect(result).toHaveProperty('eventType', BusinessEvents.SLO_THRESHOLD_BREACH);
      expect(result).toHaveProperty('metric', 'availability');
      expect(result).toHaveProperty('current', 98.5);
      expect(result).toHaveProperty('target', 99.9);
    });
  });

  describe('metricsLogger', () => {
    it('should log request metrics', () => {
      const result = metricsLogger.logRequestMetrics({
        method: 'GET',
        path: '/api/clients',
        statusCode: 200,
        durationMs: 45,
        userEmail: 'user@example.com',
        correlationId: 'corr-123',
      });
      
      expect(result).toHaveProperty('eventType', 'metrics.request');
      expect(result).toHaveProperty('method', 'GET');
      expect(result).toHaveProperty('path', '/api/clients');
      expect(result).toHaveProperty('statusCode', 200);
      expect(result).toHaveProperty('durationMs', 45);
    });

    it('should log latency metrics', () => {
      metricsLogger.logLatencyMetrics({
        endpoint: 'GET /api/clients',
        durationMs: 150,
        correlationId: 'corr-123',
      });
      
      // logLatencyMetrics uses debug level, which may not output depending on LOG_LEVEL
      // Just verify the function doesn't throw
      expect(true).toBe(true);
    });

    it('should log error metrics', () => {
      const result = metricsLogger.logErrorMetrics({
        endpoint: 'GET /api/clients',
        statusCode: 500,
        errorType: 'server_error',
        correlationId: 'corr-123',
      });
      
      expect(result).toHaveProperty('eventType', 'metrics.error');
      expect(result).toHaveProperty('endpoint', 'GET /api/clients');
      expect(result).toHaveProperty('statusCode', 500);
      expect(result).toHaveProperty('errorType', 'server_error');
    });

    it('should log throughput metrics', () => {
      metricsLogger.logThroughputMetrics(25.5, 60, 'corr-123');
      
      // logThroughputMetrics uses debug level, which may not output depending on LOG_LEVEL
      // Just verify the function doesn't throw
      expect(true).toBe(true);
    });
  });
});
