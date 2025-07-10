/**
 * CACHE MIDDLEWARE
 * ================
 * 
 * Response caching middleware with:
 * - Redis-backed caching
 * - Cache key generation
 * - Cache invalidation
 * - Conditional caching
 */

import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { redisConfig } from '../config/environment';
import logger from '../utils/logger';
 
// Redis client for caching
let redisClient: Redis | null = null;

try {
  redisClient = new Redis(redisConfig.REDIS_URL, {
    maxRetriesPerRequest: redisConfig.REDIS_MAX_RETRIES ?? 5,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    keyPrefix: `${redisConfig.REDIS_KEY_PREFIX ?? ''}cache:`
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected for caching');
  });

  redisClient.on('error', (error) => {
    logger.error('❌ Redis cache error:', error);
  });
} catch (error) {
  logger.warn('⚠️ Redis not available for caching');
}

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
  vary?: string[]; // Headers to vary cache on
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req: Request, keyGenerator?: (req: Request) => string): string {
  if (keyGenerator) {
    return keyGenerator(req);
  }
  
  const key = `${req.method}:${req.path}`;
  const queryString = new URLSearchParams(req.query as any).toString();
  
  return queryString ? `${key}?${queryString}` : key;
}

/**
 * Check if request should be cached
 */
function shouldCache(req: Request, condition?: (req: Request) => boolean): boolean {
  // Only cache GET requests by default
  if (req.method !== 'GET') {
    return false;
  }
  
  // Don't cache authenticated requests by default
  if (req.user && !condition) {
    return false;
  }
  
  // Use custom condition if provided
  if (condition) {
    return condition(req);
  }
  
  return true;
}

/**
 * Cache middleware
 */
export const cache = (options: CacheOptions = {}) => {
  const { ttl = 300, keyGenerator, condition, vary } = options; // Default 5 minutes
  
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip caching if Redis is not available
    if (!redisClient) {
      return next();
    }
    
    // Check if request should be cached
    if (!shouldCache(req, condition)) {
      return next();
    }
    
    try {
      const cacheKey = generateCacheKey(req, keyGenerator);
      
      // Try to get from cache
      const cachedResponse = await redisClient.get(cacheKey);
      
      if (cachedResponse) {
        const parsed = JSON.parse(cachedResponse);
        
        // Set cache headers
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        
        // Set vary headers if specified
        if (vary) {
          res.setHeader('Vary', vary.join(', '));
        }
        
        // Send cached response
        res.status(parsed.statusCode).json(parsed.data);
        
        logger.debug('Cache hit', { cacheKey });
        return;
      }
      
      // Cache miss - intercept response
      const originalJson = res.json;
      
      res.json = function(data: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const cacheData = {
            statusCode: res.statusCode,
            data
          };
          
          // Store in cache
          redisClient!.setex(cacheKey, ttl, JSON.stringify(cacheData))
            .then(() => {
              logger.debug('Response cached', { cacheKey, ttl });
            })
            .catch((error) => {
              logger.warn('Failed to cache response', { error, cacheKey });
            });
        }
        
        // Set cache headers
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        
        // Set vary headers if specified
        if (vary) {
          res.setHeader('Vary', vary.join(', '));
        }
        
        return originalJson.call(this, data);
      };
      
      next();
      
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 */
export const invalidateCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!redisClient) {
      return next();
    }
    
    try {
      const keys = await redisClient.keys(`*${pattern}*`);
      
      if (keys.length > 0) {
        await redisClient.del(...keys);
        logger.info('Cache invalidated', { pattern, keysDeleted: keys.length });
      }
      
      next();
      
    } catch (error) {
      logger.error('Cache invalidation error:', error);
      next();
    }
  };
};

/**
 * Clear all cache
 */
export const clearCache = async (): Promise<void> => {
  if (!redisClient) {
    return;
  }
  
  try {
    const keys = await redisClient.keys('*');
    
    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.info('All cache cleared', { keysDeleted: keys.length });
    }
    
  } catch (error) {
    logger.error('Failed to clear cache:', error);
  }
};

/**
 * Predefined cache configurations
 */
export const cacheConfigs = {
  // Short cache for frequently changing data
  short: cache({ ttl: 60 }), // 1 minute
  
  // Medium cache for semi-static data
  medium: cache({ ttl: 300 }), // 5 minutes
  
  // Long cache for static data
  long: cache({ ttl: 3600 }), // 1 hour
  
  // Public cache (ignores authentication)
  public: cache({
    ttl: 300,
    condition: () => true // Always cache regardless of auth
  }),
  
  // User-specific cache
  userSpecific: cache({
    ttl: 300,
    keyGenerator: (req: Request) => {
      const baseKey = `${req.method}:${req.path}`;
      const userId = req.user?.id || 'anonymous';
      return `${baseKey}:user:${userId}`;
    },
    condition: () => true
  })
};

export default cache;