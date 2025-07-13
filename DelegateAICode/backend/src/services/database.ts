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

//connect to character and ai in schema?
export const saveCampaignSession = async (
  userId: string,
  sessionId: string,
  sessionData: any
): Promise<void> => {
  const prisma = getDatabase();

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      transcript: sessionData.transcript,
      recordings: sessionData.recordings,
      updatedAt: new Date()
    }
  });
};

//connect to character and ai in schema?
export const loadCampaignSession = async (
  userId: string,
  sessionId: string
): Promise<any | null> => {
  const prisma = getDatabase();

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      userId
    },
    select: {
      id: true,
      transcript: true,
      recordings: true,
      updatedAt: true
    }
  });

  return session;
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

export const getCampaignHistory = async (
  userId: string,
  options: { limit: number; offset: number }
): Promise<any[]> => {
  const prisma = getDatabase();

  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    skip: options.offset,
    take: options.limit,
    select: { //modify to fit frontend 
      id: true,
      campaignId: true,
      startedAt: true,
      endedAt: true,
      transcript: true,
      updatedAt: true
    }
  });

  return sessions;
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
