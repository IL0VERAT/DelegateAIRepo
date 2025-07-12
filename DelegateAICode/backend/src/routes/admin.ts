/**
 * Admin Routes for Delegate AI
 * ============================
 * 
 * Comprehensive admin console functionality.
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin, logUserAction } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Admin Dashboard Overview
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [
      userCount,
      sessionCount,
      messageCount,
      transcriptCount,
      recentUsers,
      systemStats 
    ] = await Promise.all([
      prisma.user.count(),
      prisma.session.count(),
      prisma.message.count(),
      prisma.transcript.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      }),
      {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV
      }
    ]);

    await logUserAction(req, 'admin_dashboard_accessed', 'admin');

    res.json({
      overview: {
        users: userCount,
        sessions: sessionCount,
        messages: messageCount,
        transcripts: transcriptCount
      },
      recentUsers,
      system: systemStats
    });

  } catch (error) {
    logger.error('Admin dashboard error:', error);
    res.status(500).json({
      error: 'Failed to load dashboard',
      code: 'ADMIN_DASHBOARD_FAILED'
    });
  }
});

/**
 * System Health Check
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      environment: process.env.NODE_ENV
    };

    res.json(health);

  } catch (error) {
    logger.error('Admin health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * System Analytics
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = req.query;
    
    const endDate = toDate ? new Date(toDate as string) : new Date();
    const startDate = fromDate ? new Date(fromDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      userGrowth,
      sessionActivity,
      messageVolume,
      errorLogs
    ] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.session.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.message.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.auditLog.count({
        where: {
          timestamp: { gte: startDate, lte: endDate },
          success: false
        }
      })
    ]);

    res.json({
      period: { startDate, endDate },
      metrics: {
        userGrowth,
        sessionActivity,
        messageVolume,
        errorCount: errorLogs
      }
    });

  } catch (error) {
    logger.error('Admin analytics error:', error);
    res.status(500).json({
      error: 'Failed to generate analytics',
      code: 'ADMIN_ANALYTICS_FAILED'
    });
  }
});

export default router;