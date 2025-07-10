/**
 * Logger Utility for Delegate AI
 * ==============================
 * 
 * Production-ready logging with structured output, multiple transports, and log levels.
 */

import winston from 'winston';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  http: 'magenta',
  debug: 'gray'
};

// Add colors to winston
winston.addColors(logColors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports
const transports: winston.transport[] = [];

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug'
    })
  );
} else {
  // Production console with less verbose output
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
      ),
      level: 'info'
    })
  );
}

// File transports for production
if (process.env.NODE_ENV === 'production') {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels: logLevels,
  defaultMeta: {
    service: 'delegate-ai-backend',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports,
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ],
  exitOnError: false
});

// Create specialized loggers for different components
export const createLogger = (component: string) => {
  return logger.child({ component });
};

// HTTP request logger
export const httpLogger = createLogger('http');

// Database logger
export const dbLogger = createLogger('database');

// Auth logger
export const authLogger = createLogger('auth');

// Voice logger
export const voiceLogger = createLogger('voice');

// WebSocket logger
export const wsLogger = createLogger('websocket');

// Rate limiter logger
export const rateLimitLogger = createLogger('rateLimit');

// Helper functions for structured logging
export const logError = (message: string, error: Error, meta?: any) => {
  logger.error(message, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    ...meta
  });
};

export const logUserAction = (userId: string, action: string, details?: any) => {
  logger.info('User action', {
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...details
  });
};

export const logApiCall = (method: string, endpoint: string, statusCode: number, duration: number, meta?: any) => {
  httpLogger.info('API call', {
    method,
    endpoint,
    statusCode,
    duration,
    ...meta
  });
};

export const logDatabaseQuery = (query: string, duration: number, success: boolean) => {
  dbLogger.debug('Database query', {
    query: query.substring(0, 200), // Truncate long queries
    duration,
    success,
    timestamp: new Date().toISOString()
  });
};

export const logAuthEvent = (event: string, userId?: string, success: boolean = true, meta?: any) => {
  authLogger.info('Auth event', {
    event,
    userId,
    success,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

export const logVoiceProcessing = (type: string, duration: number, fileSize?: number, meta?: any) => {
  voiceLogger.info('Voice processing', {
    type,
    duration,
    fileSize,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

export const logWebSocketEvent = (event: string, connectionId: string, meta?: any) => {
  wsLogger.debug('WebSocket event', {
    event,
    connectionId,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

export const logRateLimit = (identifier: string, endpoint: string, blocked: boolean, meta?: any) => {
  rateLimitLogger.warn('Rate limit event', {
    identifier,
    endpoint,
    blocked,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Performance monitoring helpers
export const startTimer = () => {
  return Date.now();
};

export const endTimer = (startTime: number) => {
  return Date.now() - startTime;
};

export const logPerformance = (operation: string, duration: number, meta?: any) => {
  logger.debug('Performance metric', {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Security logging helpers
export const logSecurityEvent = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', meta?: any) => {
  const logLevel = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';
  
  logger.log(logLevel, 'Security event', {
    securityEvent: event,
    severity,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

export const logSuspiciousActivity = (activity: string, identifier: string, meta?: any) => {
  logger.warn('Suspicious activity detected', {
    activity,
    identifier,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Health check logging
export const logHealthCheck = (service: string, status: 'healthy' | 'unhealthy', details?: any) => {
  const logLevel = status === 'healthy' ? 'debug' : 'warn';
  
  logger.log(logLevel, 'Health check', {
    service,
    status,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Startup logging
export const logStartup = (message: string, meta?: any) => {
  logger.info('🚀 ' + message, {
    startup: true,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Shutdown logging
export const logShutdown = (message: string, meta?: any) => {
  logger.info('🛑 ' + message, {
    shutdown: true,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

export default logger;