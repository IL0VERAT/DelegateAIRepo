//Redis Service

import { createClient, RedisClientType } from 'redis';
//import { createClient } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType | null = null;

//Initialize Redis connection
export const initializeRedis = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    logger.info('Redis URL not configured, skipping Redis initialization');
    return null;
  }

  try {
    redisClient = createClient({
      url: redisUrl
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis client connected');
    });

    await redisClient.connect();

    logger.info('✅ Redis service initialized successfully');
    return redisClient;
  } catch (error) {
    logger.error('❌ Failed to initialize Redis:', error);
    redisClient = null;
    return null;
  }
};


//Get Redis client
export const getRedisClient = (): RedisClientType | null => redisClient;

//Redis health check
export const checkRedisHealth = async (): Promise<boolean> => {
  if (!redisClient) return false;
  try {
    const pong = await redisClient.ping();
    return pong === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};

//Close Redis connection
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

export { redisClient };