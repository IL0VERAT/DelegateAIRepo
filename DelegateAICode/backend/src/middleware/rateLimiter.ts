/**
 * RATE LIMITER MIDDLEWARE
 * ========================
 * 
 * Advanced rate limiting with:
 * - Multiple rate limiting strategies
 * - IP-based and user-based limits
 * - Redis-backed distributed limiting
 * - Adaptive rate limiting
 * - Bypass for admins
 * - Detailed logging and monitoring
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore, { RedisReply } from 'rate-limit-redis';
import Redis, { Command, Redis as RedisClient  } from 'ioredis';
import { redisConfig, securityConfig } from '../config/environment';
import logger from '../utils/logger';

// Redis client for rate limiting
let redisClient: Redis | null = null;

try {
  redisClient = new Redis(redisConfig.REDIS_URL, {
    maxRetriesPerRequest: redisConfig.REDIS_MAX_RETRIES ?? 5,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    keyPrefix: `${redisConfig.REDIS_KEY_PREFIX ?? ''}cache:`
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected for rate limiting');
  });

  redisClient.on('error', (error) => {
    logger.error('❌ Redis rate limiting error:', error);
  });
} catch (error) {
  logger.warn('⚠️ Redis not available for rate limiting, using memory store');
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  onLimitReached?: (req: Request, res: Response) => void;
}

/**
 * Create rate limiter with Redis store if available
 */
export const rateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator,
    skip,
    onLimitReached
  } = options;

  const limitConfig: any = {
    windowMs,
    max: maxRequests,
    message: {
      error: 'Rate limit exceeded',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    
    // Custom key generator
    keyGenerator: keyGenerator || ((req: Request) => {
      // Use user ID if authenticated, otherwise IP
      if (req.user?.id) {
        return `user:${req.user.id}`;
      }
      return `ip:${req.ip}`;
    }),

    // Skip function
    skip: (req: Request) => {
      // Skip rate limiting for admins
      if (req.user?.role === 'admin') {
        return true;
      }
      
      // Custom skip function
      if (skip) {
        return skip(req);
      }
      
      return false;
    },

    // Handler for when limit is reached
    handler: (req: Request, res: Response) => {
      const key = limitConfig.keyGenerator(req);
      
      logger.warn('Rate limit exceeded', {
        key,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        userId: req.user?.id
      });

      if (onLimitReached) {
        onLimitReached(req, res);
      }

      res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil(windowMs / 1000),
        limit: maxRequests,
        windowMs
      });
    }
  };

  // Use Redis store if available
  if (redisClient) {
    limitConfig.store = new RedisStore({
      prefix: 'rl:',
      sendCommand: (...args: string[]): Promise<RedisReply> => {
      const command = new Command(args[0], args.slice(1));
      return redisClient.sendCommand(command) as Promise<RedisReply>;
      }
    });
  }

  return rateLimit(limitConfig);
};

/**
 * Predefined rate limiters for common use cases
 */

// General API rate limiter - 100 requests per 15 minutes
export const apiRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many API requests from this IP, please try again later'
});

// Strict rate limiter for sensitive operations - 10 requests per 15 minutes
export const strictRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many requests for this operation, please try again later'
});

// Authentication rate limiter - 5 attempts per 15 minutes
export const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true
});

// AI request rate limiter - 30 requests per minute
export const aiRateLimit = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Too many AI requests, please try again later'
});

// File upload rate limiter - 10 uploads per hour
export const uploadRateLimit = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Too many file uploads, please try again later'
});

// Search rate limiter - 50 searches per minute
export const searchRateLimit = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 50,
  message: 'Too many search requests, please try again later'
});

/**
 * Adaptive rate limiter based on user role
 */
export const adaptiveRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const userRole = req.user?.role || 'anonymous';
  
  let windowMs: number;
  let maxRequests: number;

  switch (userRole) {
    case 'admin':
      // Admins get higher limits
      windowMs = 1 * 60 * 1000; // 1 minute
      maxRequests = 200;
      break;
    case 'premium':
      // Premium users get higher limits
      windowMs = 1 * 60 * 1000; // 1 minute
      maxRequests = 100;
      break;
    case 'user':
      // Regular users
      windowMs = 1 * 60 * 1000; // 1 minute
      maxRequests = 60;
      break;
    default:
      // Anonymous users get lower limits
      windowMs = 1 * 60 * 1000; // 1 minute
      maxRequests = 30;
  }

  const limiter = rateLimiter({
    windowMs,
    maxRequests,
    message: `Rate limit exceeded for ${userRole} users`,
    keyGenerator: (req: Request) => `adaptive:${userRole}:${req.user?.id || req.ip}`
  });

  limiter(req, res, next);
};

/**
 * Burst protection middleware
 */
export const burstProtection = rateLimiter({
  windowMs: 1000, // 1 second
  maxRequests: 5, // 5 requests per second
  message: 'Too many requests in short time, please slow down'
});

/**
 * Progressive rate limiting (increases limits over time for trusted users)
 */
export const progressiveRateLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      // Non-authenticated users get base rate limit
      return apiRateLimit(req, res, next);
    }

    const userId = req.user.id;
    const accountAge = await getAccountAge(userId); // You'd implement this
    const trustScore = await getTrustScore(userId); // You'd implement this

    let multiplier = 1;

    // Increase limits for older accounts
    if (accountAge > 30) multiplier += 0.5; // 30+ days
    if (accountAge > 90) multiplier += 0.5; // 90+ days

    // Increase limits for trusted users
    if (trustScore > 0.8) multiplier += 0.5;

    const baseLimit = 60;
    const adjustedLimit = Math.floor(baseLimit * multiplier);

    const limiter = rateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: adjustedLimit,
      message: 'Rate limit exceeded',
      keyGenerator: (req: Request) => `progressive:${userId}`
    });

    limiter(req, res, next);

  } catch (error) {
    logger.error('Progressive rate limit error:', error);
    // Fallback to standard rate limit
    apiRateLimit(req, res, next);
  }
};

/**
 * IP-based rate limiter (ignores authentication)
 */
export const ipRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 200,
  message: 'Too many requests from this IP address',
  keyGenerator: (req: Request) => `ip:${req.ip}`
});

/**
 * Endpoint-specific rate limiters
 */
export const endpointRateLimits = {
  // Health check - very permissive
  health: rateLimiter({
    windowMs: 1 * 60 * 1000,
    maxRequests: 100,
    message: 'Too many health check requests'
  }),

  // Login attempts - strict
  login: rateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many login attempts, please try again later',
    skipSuccessfulRequests: true,
    keyGenerator: (req: Request) => `login:${req.ip}`
  }),

  // Password reset - very strict
  passwordReset: rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset attempts, please try again later'
  }),

  // Registration - moderate
  register: rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: 'Too many registration attempts, please try again later'
  }),

  // Contact form - moderate
  contact: rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many contact form submissions, please try again later'
  })
};

/**
 * Utility functions (you would implement these based on your data store)
 */
async function getAccountAge(userId: string): Promise<number> {
  // Implement based on your user model
  // Return age in days
  return 0;
}

async function getTrustScore(userId: string): Promise<number> {
  // Implement based on user behavior metrics
  // Return score between 0 and 1
  return 0.5;
}

/**
 * Rate limit status middleware (adds headers with current limits)
 */
export const rateLimitStatus = (req: Request, res: Response, next: NextFunction): void => {
  // Add custom headers with rate limit info
  res.setHeader('X-RateLimit-Policy', 'dynamic');
  res.setHeader('X-RateLimit-User-Role', req.user?.role || 'anonymous');
  
  next();
};

/**
 * Clear rate limit for a specific key (admin function)
 */
export const clearRateLimit = async (key: string): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.del(`rl:${key}`);
      logger.info('Rate limit cleared for key:', key);
    } catch (error) {
      logger.error('Failed to clear rate limit:', error);
    }
  }
};

/**
 * Get rate limit info for a key
 */
export const getRateLimitInfo = async (key: string): Promise<any> => {
  if (redisClient) {
    try {
      const data = await redisClient.get(`rl:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get rate limit info:', error);
      return null;
    }
  }
  return null;
};

// Default export
export default rateLimiter;