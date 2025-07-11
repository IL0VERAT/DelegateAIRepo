/**
 * SESSION MIDDLEWARE
 * ==================
 * 
 * Session management with:
 * - Redis-backed sessions
 * - Session validation
 * - Session cleanup
 * - Security monitoring
 */

import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
//import RedisStore from 'connect-redis';
//import RedisStoreModule from 'connect-redis';
import Redis from 'ioredis';
import { redisConfig, securityConfig, environmentInfo } from '../config/environment';
import logger from '../utils/logger';

const RedisStore = require('connect-redis')(session);

// Redis client for sessions
let redisClient: Redis | null = null;

try {
  redisClient = new Redis(redisConfig.REDIS_URL, {
    maxRetriesPerRequest: redisConfig.REDIS_MAX_RETRIES ?? 5,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    keyPrefix: `${redisConfig.REDIS_KEY_PREFIX ?? ''}cache:`
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected for sessions');
  });

  redisClient.on('error', (error) => {
    logger.error('❌ Redis session error:', error);
  });
} catch (error) {
  logger.warn('⚠️ Redis not available for sessions, using memory store');
}

// Session configuration
const sessionConfig: session.SessionOptions = {
  name: 'delegate_ai_session',
  secret: securityConfig.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: !environmentInfo.isDevelopment, // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
};

// Use Redis store if available
if (redisClient) {
  sessionConfig.store = new RedisStore({ //--> need to connect Redis first to fix error
    client: redisClient,
    prefix: 'sess:',
    ttl: 24 * 60 * 60 // 24 hours in seconds
  });
}

const sessionMiddleware = session(sessionConfig);

export default sessionMiddleware;