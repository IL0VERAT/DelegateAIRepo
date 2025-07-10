/**
 * ERROR HANDLER MIDDLEWARE
 * ========================
 * 
 * Centralized error handling with:
 * - Structured error responses
 * - Error logging and monitoring
 * - Security-conscious error messages
 * - Development vs production error details
 */

import { Request, Response, NextFunction } from 'express';
import { environmentInfo } from '../config/environment';
import logger from '../utils/logger';

interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  isOperational = true;

  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  statusCode = 401;
  code = 'AUTHENTICATION_ERROR';
  isOperational = true;

  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;
  code = 'AUTHORIZATION_ERROR';
  isOperational = true;

  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  code = 'NOT_FOUND';
  isOperational = true;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  code = 'CONFLICT';
  isOperational = true;

  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  statusCode = 429;
  code = 'RATE_LIMIT_ERROR';
  isOperational = true;

  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ServiceUnavailableError extends Error {
  statusCode = 503;
  code = 'SERVICE_UNAVAILABLE';
  isOperational = true;

  constructor(message: string = 'Service temporarily unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Determine if error should expose details in production
 */
function isOperationalError(error: ApiError): boolean {
  return error.isOperational === true;
}

/**
 * Generate error ID for tracking
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format error response
 */
function formatErrorResponse(error: ApiError, req: Request, errorId: string) {
  const isDevelopment = environmentInfo.isDevelopment;
  
  const baseResponse = {
    error: true,
    errorId,
    code: error.code || 'INTERNAL_ERROR',
    message: error.message,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // In development, include more details
  if (isDevelopment) {
    return {
      ...baseResponse,
      stack: error.stack,
      details: error.details,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params
    };
  }

  // In production, only include details for operational errors
  if (isOperationalError(error) && error.details) {
    return {
      ...baseResponse,
      details: error.details
    };
  }

  return baseResponse;
}

/**
 * Log error with appropriate level
 */
function logError(error: ApiError, req: Request, errorId: string) {
  const errorInfo = {
    errorId,
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    isOperational: error.isOperational,
    request: {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      body: req.body,
      query: req.query,
      params: req.params
    }
  };

  if (isOperationalError(error)) {
    logger.warn('Operational error occurred:', errorInfo);
  } else {
    logger.error('System error occurred:', errorInfo);
  }
}

/**
 * Main error handler middleware
 */
const errorHandler = (error: ApiError, req: Request, res: Response, next: NextFunction): void => {
  const errorId = generateErrorId();
  
  // Set default status code if not set
  const statusCode = error.statusCode || 500;
  
  // Log the error
  logError(error, req, errorId);
  
  // Send error response
  const errorResponse = formatErrorResponse(error, req, errorId);
  
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Promise Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString()
  });
  
  // In production, you might want to restart the process
  if (!environmentInfo.isDevelopment) {
    logger.error('Shutting down due to unhandled promise rejection');
    process.exit(1);
  }
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', {
    name: error.name,
    message: error.message,
    stack: error.stack
  });
  
  // Always exit on uncaught exceptions
  logger.error('Shutting down due to uncaught exception');
  process.exit(1);
});

export default errorHandler;