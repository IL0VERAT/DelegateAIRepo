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
import { redisConfig } from '../config/environment';
import logger from '../utils/logger';
import { getRedisClient } from '../services/redis';
 

/**
 * Generate cache key from request
 */
function generateCacheKey(req: Request, keyGenerator?: (req: Request) => string): string {
  if (keyGenerator) return keyGenerator(req);
  const key = `${req.method}:${req.path}`;
  const queryString = new URLSearchParams(req.query as any).toString();
  return queryString ? `${key}?${queryString}` : key;
}

/**
 * Check if request should be cached
 */
function shouldCache(req: Request, condition?: (req: Request) => boolean): boolean {
  if (req.method !== 'GET') return false;
  if (req.user && !condition) return false;
  return condition ? condition(req) : true;
}

/**
 * Cache middleware
 */
export const cache = (options: {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
  vary?: string[];
} = {}) => {
  const { ttl = 300, keyGenerator, condition, vary } = options;

  // grab the single shared client
  const redisClient = getRedisClient();

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!redisClient) return next();          // no Redis → skip
    if (!shouldCache(req, condition)) return next();

    try {
      const cacheKey = generateCacheKey(req, keyGenerator);
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        const { statusCode, data } = JSON.parse(cached);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        if (vary) res.setHeader('Vary', vary.join(', '));
        logger.debug('Cache hit', { cacheKey });
        res.status(statusCode).json(data);
        return;
      }

      // wrap res.json to intercept the response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const payload = JSON.stringify({ statusCode: res.statusCode, data: body });
          redisClient
            .set(cacheKey, payload,{ EX: ttl })
            .then(() => logger.debug('Response cached', { cacheKey, ttl }))
            .catch(err => logger.warn('Failed to cache response', { err, cacheKey }));
        }
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        if (vary) res.setHeader('Vary', vary.join(', '));
        return originalJson(body);
      };

      next();
    } catch (err) {
      logger.error('Cache middleware error:', err);
      next();
    }
  };
};

export default cache;