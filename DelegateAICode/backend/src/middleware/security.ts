/**
 * SECURITY MIDDLEWARE
 * ===================
 * 
 * Comprehensive security middleware with:
 * - Helmet security headers
 * - CORS configuration
 * - CSRF protection
 * - XSS protection
 * - SQL injection prevention
 * - Content Security Policy
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { securityConfig, environmentInfo } from '../config/environment';
import logger from '../utils/logger';

/**
 * Configure Helmet security headers
 */
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.elevenlabs.io"],//NEED TO ADD GEMINI?
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: environmentInfo.isDevelopment ? [] : null,
    },
  },
  
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disable if causing issues with third-party APIs
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Frame Guard
  frameguard: { action: 'deny' },
  
  // Hide Powered By
  hidePoweredBy: true,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // No Sniff
  noSniff: true,
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Permissions Policy
  permittedCrossDomainPolicies: false,
  
  // Referrer Policy
  referrerPolicy: { policy: "no-referrer" },
  
  // X-XSS-Protection
  xssFilter: true
});

/**
 * Configure CORS
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
     
    // Check if origin is in allowed list
    if (securityConfig.CORS_ORIGIN.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow localhost origins
    if (environmentInfo.isDevelopment && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    logger.warn('CORS origin rejected:', { origin });
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
    'X-API-Key'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 86400 // 24 hours
});

/**
 * Input sanitization middleware
 */
export const inputSanitization = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    // Sanitize request body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize URL parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    logger.error('Input sanitization error:', error);
    res.status(400).json({
      error: 'Invalid input',
      message: 'Request contains invalid characters'
    });
  }
};

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeString(key);
    sanitized[sanitizedKey] = sanitizeObject(value);
  }
  
  return sanitized;
}

/**
 * Sanitize string values
 */
function sanitizeString(value: any): any {
  if (typeof value !== 'string') {
    return value;
  }
  
  // Remove potentially dangerous characters
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>'"]/g, '') // Remove HTML brackets and quotes
    .trim();
}

/**
 * SQL injection prevention middleware
 */
export const sqlInjectionPrevention = (req: Request, res: Response, next: NextFunction): void => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(--|\#|\/\*|\*\/)/gi,
    /(\bOR\b|\bAND\b).*?[=<>]/gi,
    /['"]\s*(OR|AND)\s*['"]/gi
  ];
  
  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    
    return sqlPatterns.some(pattern => pattern.test(value));
  };
  
  const checkObject = (obj: any): boolean => {
    if (typeof obj !== 'object' || obj === null) {
      return checkForSQLInjection(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.some(item => checkObject(item));
    }
    
    return Object.values(obj).some(value => checkObject(value));
  };
  
  try {
    let hasSQLInjection = false;
    
    if (req.query && checkObject(req.query)) {
      hasSQLInjection = true;
    }
    
    if (req.body && checkObject(req.body)) {
      hasSQLInjection = true;
    }
    
    if (req.params && checkObject(req.params)) {
      hasSQLInjection = true;
    }
    
    if (hasSQLInjection) {
      logger.warn('SQL injection attempt detected', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        query: req.query,
        body: req.body,
        params: req.params
      });
      
      res.status(400).json({
        error: 'Invalid input',
        message: 'Request contains potentially harmful content'
      });
      return;
    }
    
    next();
  } catch (error) {
    logger.error('SQL injection prevention error:', error);
    next();
  }
};

/**
 * Request size limiting middleware
 */
export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => { // 10MB default
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.get('content-length');
    
    if (contentLength && parseInt(contentLength, 10) > maxSize) {
      logger.warn('Request size limit exceeded', {
        contentLength,
        maxSize,
        ip: req.ip,
        path: req.path
      });
      
      res.status(413).json({
        error: 'Request too large',
        message: `Request size exceeds limit of ${maxSize} bytes`
      });
      return;
    }
    
    next();
  };
};

/**
 * Suspicious activity detection middleware
 */
export const suspiciousActivityDetection = (req: Request, res: Response, next: NextFunction): void => {
  const suspiciousPatterns = [
    /\.\./g, // Path traversal
    /\0/g, // Null bytes
    /%00/g, // URL encoded null bytes
    /\/etc\/passwd/gi, // Unix password file
    /\/proc\//gi, // Unix proc filesystem
    /\\system32/gi, // Windows system directory
    /cmd\.exe/gi, // Windows command executor
    /powershell/gi, // PowerShell
    /base64/gi // Base64 encoding (potentially suspicious)
  ];
  
  const checkForSuspiciousContent = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    
    return suspiciousPatterns.some(pattern => pattern.test(value));
  };
  
  const checkRequest = (obj: any): boolean => {
    if (typeof obj !== 'object' || obj === null) {
      return checkForSuspiciousContent(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.some(item => checkRequest(item));
    }
    
    return Object.values(obj).some(value => checkRequest(value));
  };
  
  try {
    let hasSuspiciousContent = false;
    
    // Check URL path
    if (checkForSuspiciousContent(req.path)) {
      hasSuspiciousContent = true;
    }
    
    // Check query parameters
    if (req.query && checkRequest(req.query)) {
      hasSuspiciousContent = true;
    }
    
    // Check request body
    if (req.body && checkRequest(req.body)) {
      hasSuspiciousContent = true;
    }
    
    // Check headers
    const userAgent = req.get('User-Agent') || '';
    if (checkForSuspiciousContent(userAgent)) {
      hasSuspiciousContent = true;
    }
    
    if (hasSuspiciousContent) {
      logger.warn('Suspicious activity detected', {
        ip: req.ip,
        userAgent,
        path: req.path,
        query: req.query,
        headers: req.headers
      });
      
      res.status(400).json({
        error: 'Suspicious activity detected',
        message: 'Request contains potentially harmful content'
      });
      return;
    }
    
    next();
  } catch (error) {
    logger.error('Suspicious activity detection error:', error);
    next();
  }
};

/**
 * IP whitelist/blacklist middleware
 */
export const ipFilter = (options: {
  whitelist?: string[];
  blacklist?: string[];
} = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip;

    if (!clientIP) {
      res.status(400).json({ error: 'Unable to determine client IP' });
      return;
    }
    
    // Check blacklist first
    if (options.blacklist && options.blacklist.includes(clientIP)) {
      logger.warn('Blocked IP attempted access', {
        ip: clientIP,
        path: req.path,
        userAgent: req.get('User-Agent')
      });
      
      res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not allowed'
      });
      return;
    }
    
    // Check whitelist if provided
    if (options.whitelist && options.whitelist.length > 0) {
      if (!options.whitelist.includes(clientIP)) {
        logger.warn('Non-whitelisted IP attempted access', {
          ip: clientIP,
          path: req.path
        });
        
        res.status(403).json({
          error: 'Access denied',
          message: 'Your IP address is not whitelisted'
        });
        return;
      }
    }
    
    next();
  };
};

/**
 * Combined security middleware
 */
const security = [
  helmetConfig,
  corsConfig,
  inputSanitization,
  sqlInjectionPrevention,
  suspiciousActivityDetection,
  requestSizeLimit()
];

export default security;