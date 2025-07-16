/**
 * Health Check Routes for Delegate AI
 * ===================================
 * 
 * Provides health monitoring endpoints for the application. 
 */

import express, { Request, Response } from 'express';
import { PrismaClient }  from '@prisma/client';
import geminiService from '../services/gemini';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Basic health check
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
 * Detailed health check
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const checks = await Promise.allSettled([
      checkDatabase(),
      checkGemini(),
      checkSystem()
    ]);

    const [database, gemini, system] = checks.map(check => 
      check.status === 'fulfilled' ? check.value : { status: 'unhealthy', error: check.reason?.message }
    ) as { status: string }[];

    const overallStatus = [database, gemini, system].every(check => check.status === 'healthy') 
      ? 'healthy' 
      : 'unhealthy';

    const health = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database,
        gemini,
        system
      }
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
 * Database health check
 */
async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      responseTime: 0,
      details: 'Database connection successful'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * OpenAI service health check
 */
async function checkGemini() {
  try {
    const health = await geminiService.healthCheck();
    return health;
  } catch (error) {
    return {
      status: 'unhealthy',
      error: 'Gemini service check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * System health check
 */
async function checkSystem() {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      status: 'healthy',
      details: {
        uptime: process.uptime(),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB'
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        platform: process.platform,
        nodeVersion: process.version
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: 'System check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default router;

