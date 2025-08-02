import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore, { RedisReply } from 'rate-limit-redis';
import type { Options as RedisStoreOptions } from 'rate-limit-redis';
import rateLimitRedis from 'rate-limit-redis';
import { RedisClientType } from 'redis';
import { getRedisClient } from '../services/redis';
import logger from '../utils/logger';
import assert from 'assert';

// Grab the single shared Redis client (or null if unavailable)
const redisClient = getRedisClient();


if (!redisClient) {
  console.warn('⚠️ Redis unavailable, falling back to in-memory store');
}//DEBUG

if (redisClient) {
  redisClient.ping().catch(() => {
    console.warn('⚠️ Redis connected but unhealthy. Consider falling back to memory.');
  });
}//DEBUG

interface RateLimitOptions {
  windowMs: number | ((req: Request) => number);
  maxRequests: number | ((req: Request) => number);
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
export const createRateLimiter = (options: RateLimitOptions) => {
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

  const resolvedWindowMs = typeof windowMs === 'function' ? windowMs : () => windowMs;
  const resolvedMaxRequests = typeof maxRequests === 'function' ? maxRequests : () => maxRequests;

  const limitConfig: any = {
    
    windowMs: typeof windowMs === 'function' ? windowMs : windowMs,
    max: resolvedMaxRequests,
    message: {
      error: 'Rate limit exceeded',
      message: options.message || 'Too many requests, please wait 24 hours for your account to refresh',
      retryAfter: (req: Request) => Math.ceil(resolvedWindowMs(req) / 1000)
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
      const userLimit = resolvedMaxRequests(req);
      const retryAfterSec = Math.ceil(resolvedWindowMs(req) / 1000);
      
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
        retryAfter: retryAfterSec,
        limit: userLimit,
        windowMs:  resolvedWindowMs(req)
      });
    }
  };

  // Use Redis store if available
if (redisClient) {
  limitConfig.store = new RedisStore({
    prefix: 'rl:',
    sendCommand: async (command: string, ...args: any[]): Promise<RedisReply> => {
      try {
        // Convert all arguments to RedisArgument type (string | Buffer)
        const processedArgs = args.map((arg: any): string => {
          if (arg === null || arg === undefined) return '';
          if (typeof arg === 'object') return JSON.stringify(arg);
          return String(arg);
        });

        const result = await redisClient.sendCommand([command, ...processedArgs]);
        return result as unknown as RedisReply;
      } catch (error) {
        console.error('Redis sendCommand error:', error);
        console.error('Command:', command, 'Args:', args);
        throw error;
      }
    }
  });
  }

  return rateLimit(limitConfig);
};

/**
 * Predefined rate limiters for common use cases
 */

// General API rate limiter - 100 requests per 15 minutes
const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many API requests from this IP, please try again later'
});

// Strict rate limiter for sensitive operations - 10 requests per 15 minutes
const strictRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many requests for this operation, please try again later'
});

// Authentication rate limiter - 5 attempts per 15 minutes
const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true
});

// AI request rate limiter - 30 requests per minute
const aiRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Too many AI requests, please try again later'
});

//subscription rate limiter
const subscriptionRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'Too many subscription attempts, please try again shortly'
});

// File upload rate limiter - 10 uploads per hour
const uploadRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Too many file uploads, please try again later'
});

// Search rate limiter - 50 searches per minute
const searchRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 50,
  message: 'Too many search requests, please try again later'
});

/**
 * Adaptive rate limiter based on user role
 */

// Predefined adaptive limiters (computed once)
const adaptiveLimiters: Record<string, ReturnType<typeof createRateLimiter>> = {

  admin: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 200,
    message: 'Rate limit exceeded for admin users',
    keyGenerator: (req: Request) => `adaptive:admin:${req.user?.id || req.ip}`
  }),
  premium: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
    message: 'Rate limit exceeded for premium users',
    keyGenerator: (req: Request) => `adaptive:premium:${req.user?.id || req.ip}`
  }),
  user: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 60,
    message: 'Rate limit exceeded for regular users',
    keyGenerator: (req: Request) => `adaptive:user:${req.user?.id || req.ip}`
  }),
  anonymous: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: 'Rate limit exceeded for anonymous users',
    keyGenerator: (req: Request) => `adaptive:anon:${req.ip}`
  }),
};

// Middleware that selects the correct limiter
const adaptiveRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const role = req.user?.role || 'anonymous';
  const limiter = adaptiveLimiters[role] || adaptiveLimiters['anonymous'];
  return limiter(req, res, next);
};

/**
 * Burst protection middleware
 */
const burstProtection = createRateLimiter({
  windowMs: 1000, // 1 second
  maxRequests: 5, // 5 requests per second
  message: 'Too many requests in a short time, please slow down'
});

/**
 * IP-based rate limiter (ignores authentication)
 */
const ipRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 200,
  message: 'Too many requests from this IP address',
  keyGenerator: (req: Request) => `ip:${req.ip}`
});

/**
 * Endpoint-specific rate limiters
 */
const endpointRateLimits = {
  // Health check - very permissive
  health: createRateLimiter({
    windowMs: 1 * 60 * 1000,
    maxRequests: 100,
    message: 'Too many health check requests'
  }),

  // Login attempts - strict
  login: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many login attempts, please try again later',
    skipSuccessfulRequests: true,
    keyGenerator: (req: Request) => `login:${req.ip}`
  }),

  // Password reset - very strict
  passwordReset: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset attempts, please try again later'
  }),

  // Registration - moderate
  register: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: 'Too many registration attempts, please try again later'
  }),

  // Contact form - moderate
  contact: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many contact form submissions, please try again later'
  })
};

/**
 * Rate limit status middleware (adds headers with current limits)
 */
const rateLimitStatus = (req: Request, res: Response, next: NextFunction): void => {
  // Add custom headers with rate limit info
  res.setHeader('X-RateLimit-Policy', 'dynamic');
  res.setHeader('X-RateLimit-User-Role', req.user?.role || 'anonymous');
  
  next();
};

/**
 * Clear rate limit for a specific key (admin function)
 */
const clearRateLimit = async (key: string): Promise<void> => {
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
const getRateLimitInfo = async (key: string): Promise<any> => {
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

//global rate limit --> hits all users
const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 500,
  message: 'Too many requests to the server, please slow down'
});

export {
  globalRateLimiter,
  apiRateLimit,
  strictRateLimit,
  authRateLimit,
  aiRateLimit,
  uploadRateLimit,
  searchRateLimit,
  adaptiveRateLimit,
  burstProtection,
  ipRateLimit,
  endpointRateLimits,
  rateLimitStatus,
  clearRateLimit,
  getRateLimitInfo,
  subscriptionRateLimit
};
