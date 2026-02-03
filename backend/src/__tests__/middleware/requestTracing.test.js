const { requestTracingMiddleware, createTraceContext, attachTraceContext } = require('../../middleware/requestTracing');

describe('Request Tracing Middleware', () => {
  let mockReq;
  let mockRes;
  let nextFn;
  let consoleSpy;
  
  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/api/clients',
      originalUrl: '/api/clients',
      headers: {},
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
    };
    
    mockRes = {
      statusCode: 200,
      setHeader: jest.fn(),
      getHeader: jest.fn().mockReturnValue('100'),
      on: jest.fn(),
    };
    
    nextFn = jest.fn();
    
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

  describe('requestTracingMiddleware', () => {
    it('should generate correlation ID when not provided', () => {
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      expect(mockReq.correlationId).toBeDefined();
      expect(mockReq.correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should use x-correlation-id header if provided', () => {
      mockReq.headers['x-correlation-id'] = 'existing-correlation-id';
      
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      expect(mockReq.correlationId).toBe('existing-correlation-id');
    });

    it('should use x-request-id header as fallback', () => {
      mockReq.headers['x-request-id'] = 'request-id-123';
      
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      expect(mockReq.correlationId).toBe('request-id-123');
    });

    it('should set X-Correlation-ID response header', () => {
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Correlation-ID', expect.any(String));
    });

    it('should call next function', () => {
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      expect(nextFn).toHaveBeenCalled();
    });

    it('should register finish event handler', () => {
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should register error event handler', () => {
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      expect(mockRes.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should skip logging for health check endpoint', () => {
      mockReq.path = '/health';
      
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      expect(nextFn).toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should log request received for non-health endpoints', () => {
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      expect(consoleSpy.log).toHaveBeenCalled();
      const logCall = consoleSpy.log.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      expect(logEntry.message).toBe('Request received');
      expect(logEntry.eventType).toBe('request.received');
    });

    it('should log request completion on finish event', () => {
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      const finishHandler = mockRes.on.mock.calls.find(call => call[0] === 'finish')[1];
      finishHandler();
      
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should log error for 5xx status codes', () => {
      mockRes.statusCode = 500;
      
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      const finishHandler = mockRes.on.mock.calls.find(call => call[0] === 'finish')[1];
      finishHandler();
      
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should log warning for 4xx status codes', () => {
      mockRes.statusCode = 404;
      
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      const finishHandler = mockRes.on.mock.calls.find(call => call[0] === 'finish')[1];
      finishHandler();
      
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('should log error on response error event', () => {
      const testError = new Error('Connection reset');
      
      requestTracingMiddleware(mockReq, mockRes, nextFn);
      
      const errorHandler = mockRes.on.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(testError);
      
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('createTraceContext', () => {
    it('should create trace context from request', () => {
      mockReq.correlationId = 'test-correlation-id';
      mockReq.userEmail = 'user@example.com';
      
      const context = createTraceContext(mockReq);
      
      expect(context).toHaveProperty('correlationId', 'test-correlation-id');
      expect(context).toHaveProperty('userEmail', 'user@example.com');
      expect(context).toHaveProperty('method', 'GET');
      expect(context).toHaveProperty('path', '/api/clients');
      expect(context).toHaveProperty('timestamp');
    });
  });

  describe('attachTraceContext', () => {
    it('should attach trace context to request', () => {
      mockReq.correlationId = 'test-correlation-id';
      
      attachTraceContext(mockReq, mockRes, nextFn);
      
      expect(mockReq.traceContext).toBeDefined();
      expect(mockReq.traceContext.correlationId).toBe('test-correlation-id');
      expect(nextFn).toHaveBeenCalled();
    });
  });
});
