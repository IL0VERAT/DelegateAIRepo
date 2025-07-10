/**
 * Database Service for Delegate AI
 * ================================
 * 
 * Handles database initialization, connection management, and health monitoring.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

let prisma: PrismaClient;

/**
 * Initialize database connection
 */
export const initializeDatabase = async (): Promise<PrismaClient> => {
  try {
    if (!prisma) {
      prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        errorFormat: 'pretty',
      });

      // Test the connection
      await prisma.$connect();
      
      logger.info('Database connection established successfully');
    }

    return prisma;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
};

/**
 * Get database client instance
 */
export const getDatabase = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return prisma;
};

/**
 * Health check for database
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      logger.info('Database connection closed');
    }
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

export { prisma };