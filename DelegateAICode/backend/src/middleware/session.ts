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
import { getRedisClient } from '../services/redis';
import { redisConfig, securityConfig, environmentInfo } from '../config/environment';
import logger from '../utils/logger';

const RedisStore = require('connect-redis')(session);

// Grab the single shared Redis client (or null if unavailable)
const redisClient = getRedisClient();

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
  } else {
  logger.warn('⚠️ Redis not available for sessions, using memory store');
}

const sessionMiddleware = session(sessionConfig);

export default sessionMiddleware;