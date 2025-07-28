/**
 * Redis Service for Delegate AI
 * =============================
 * 
 * Handles Redis connection for caching, session storage, and real-time features.
 */
import Redis from 'ioredis';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

/**
 * Initialize Redis connection
 */
export const initializeRedis = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    logger.info('Redis URL not configured, skipping Redis initialization');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl,{ tls: {} });


    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });
    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    // Optionally await a ping to be sure
    await redisClient.ping();
    logger.info('Redis service initialized successfully');

    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    redisClient = null;
    return null;
  }
};

/**
 * Get Redis client
 */
export const getRedisClient = () => {
  return redisClient;
};

/**
 * Redis health check
 */
export const checkRedisHealth = async (): Promise<boolean> => {
  if (!redisClient) return false;
  try {
    return (await redisClient.ping()) === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

export { redisClient };