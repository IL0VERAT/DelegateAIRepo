/**
 * MIDDLEWARE INDEX - UPDATED FOR SUBSCRIPTION SERVICE
 * ==================================================
 * 
 * Central export for all middleware functions
 */

export { default as auth } from './auth';
export { default as errorHandler } from './errorHandler';
export { default as requestLogger } from './requestLogger';
export { default as rateLimiter } from './rateLimiter';
export { default as security } from './security';
export { default as cache } from './cache';

// Export types
//export type { AuthRequest } from './auth';