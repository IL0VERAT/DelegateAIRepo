/**
 * REQUEST LOGGER MIDDLEWARE
 * =========================
 * 
 * Comprehensive request logging with:
 * - Request/response logging
 * - Performance monitoring
 * - Security event tracking
 * - User activity logging
 * - Privacy-aware logging
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

interface RequestLogData {
  requestId: string;
  method: string;
  url: string;
  path: string;
  query: any;
  params: any;
  ip: string;
  userAgent?: string;
  userId?: string;
  userRole?: string;
  timestamp: string;
  duration?: number;
  statusCode?: number;
  responseSize?: number;
  error?: boolean;
}

/**
 * Sanitize request body for logging (remove sensitive data)
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'auth',
    'apiKey',
    'api_key',
    'clientSecret',
    'client_secret'
  ];

  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });

  // Also check nested objects
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeBody(sanitized[key]);
    }
  });

  return sanitized;
}

/**
 * Sanitize headers for logging
 */
function sanitizeHeaders(headers: any): any {
  const sanitized = { ...headers };
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
    'x-access-token'
  ];

  sensitiveHeaders.forEach(header => {
    if (header in sanitized) {
      sanitized[header] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Determine if request should be logged
 */
function shouldLogRequest(req: Request): boolean {
  // Skip health checks and static assets
  const skipPaths = [
    '/health',
    '/favicon.ico',
    '/robots.txt',
    '.css',
    '.js',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico'
  ];

  return !skipPaths.some(path => req.path.includes(path));
}

/**
 * Get request size in bytes
 */
function getRequestSize(req: Request): number {
  const contentLength = req.get('content-length');
  if (contentLength) {
    return parseInt(contentLength, 10);
  }
  
  // Estimate size if not provided
  if (req.body) {
    return Buffer.byteLength(JSON.stringify(req.body), 'utf8');
  }
  
  return 0;
}

/**
 * Main request logger middleware
 */
const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Skip logging for certain requests
  if (!shouldLogRequest(req)) {
    return next();
  }

  const requestId = uuidv4();
  const startTime = Date.now();

  // Add request ID to request object for tracing
  req.requestId = requestId;

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  const requestData: RequestLogData = {
    requestId,
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    params: req.params,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    userRole: req.user?.role,
    timestamp: new Date().toISOString()
  };

  // Log request start
  logger.info('HTTP Request Started', {
    ...requestData,
    headers: sanitizeHeaders(req.headers),
    body: sanitizeBody(req.body),
    requestSize: getRequestSize(req)
  });

  // Override res.end to capture response data
  const originalEnd = res.end;
  let responseLogged = false;

  res.end = function(chunk?: any, encoding?: any) {
    if (!responseLogged) {
      const duration = Date.now() - startTime;
      const responseSize = res.get('content-length') ? 
        parseInt(res.get('content-length') as string, 10) : 
        (chunk ? Buffer.byteLength(chunk, encoding) : 0);

      const responseData = {
        ...requestData,
        duration,
        statusCode: res.statusCode,
        responseSize,
        error: res.statusCode >= 400
      };

      // Log response with appropriate level
      if (res.statusCode >= 500) {
        logger.error('HTTP Request Completed with Server Error', responseData);
      } else if (res.statusCode >= 400) {
        logger.warn('HTTP Request Completed with Client Error', responseData);
      } else {
        logger.info('HTTP Request Completed Successfully', responseData);
      }

      // Log slow requests
      if (duration > 5000) {
        logger.warn('Slow Request Detected', {
          ...responseData,
          performance: 'slow'
        });
      }

      responseLogged = true;
    }

    return originalEnd.call(this, chunk, encoding);
  };

  // Handle cases where res.end is not called (e.g., connection closed)
  res.on('close', () => {
    if (!responseLogged) {
      const duration = Date.now() - startTime;
      
      logger.warn('HTTP Request Connection Closed', {
        ...requestData,
        duration,
        statusCode: res.statusCode || 0,
        connectionClosed: true
      });
      
      responseLogged = true;
    }
  });

  next();
};

/**
 * Express types extension for request ID
 */
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Security events logger middleware
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Log potential security events
  const securityEvents = [
    '/login',
    '/register',
    '/password-reset',
    '/admin',
    '/api/v1/admin'
  ];

  const isSecurityEndpoint = securityEvents.some(endpoint => 
    req.path.includes(endpoint)
  );

  if (isSecurityEndpoint) {
    logger.info('Security Event', {
      type: 'auth_attempt',
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      userId: req.user?.id
    });
  }

  next();
};

/**
 * User activity logger middleware
 */
export const activityLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Only log for authenticated users
  if (!req.user) {
    return next();
  }

  // Track user activity for analytics
  const activityData = {
    userId: req.user.id,
    action: `${req.method}:${req.path}`,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    sessionId: req.user.sessionId
  };

  // Log user activity (you might want to store this in a separate analytics store)
  logger.info('User Activity', activityData);

  next();
};

/**
 * API usage logger for rate limiting and analytics
 */
export const apiUsageLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Track API usage patterns
  const usageData = {
    endpoint: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    userId: req.user?.id || 'anonymous',
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };

  // Log API usage (you might want to store this in a time-series database)
  logger.debug('API Usage', usageData);

  next();
};

/**
 * Error logging middleware (to be used with error handler)
 */
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Request Error', {
    requestId: req.requestId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.user?.id
    }
  });

  next(error);
};

export default requestLogger;