/**
 * Users Routes for Delegate AI
 * ============================
 * 
 * Handles user management and profile operations.
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireAdmin, logUserAction } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get Current User Profile
 */
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        loginCount: true,
        preferences: true,
        timezone: true,
        language: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({ user });

  } catch (error) {
    logger.error('Failed to get user profile:', error);
    res.status(500).json({
      error: 'Failed to retrieve user profile',
      code: 'PROFILE_RETRIEVAL_FAILED'
    });
  }
});

/**
 * Update User Profile
 */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { displayName, preferences, timezone, language } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName,
        preferences,
        timezone,
        language,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        preferences: true,
        timezone: true,
        language: true,
        updatedAt: true
      }
    });

    await logUserAction(req, 'profile_updated', 'users', { updates: Object.keys(req.body) });

    res.json({ user: updatedUser });

  } catch (error) {
    logger.error('Failed to update user profile:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      code: 'PROFILE_UPDATE_FAILED'
    });
  }
});

/**
 * Get User Statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [sessionCount, messageCount, transcriptCount] = await Promise.all([
      prisma.session.count({ where: { userId } }),
      prisma.message.count({ where: { userId } }),
      prisma.transcript.count({ where: { userId } })
    ]);

    res.json({
      sessions: sessionCount,
      messages: messageCount,
      transcripts: transcriptCount
    });

  } catch (error) {
    logger.error('Failed to get user statistics:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      code: 'STATS_RETRIEVAL_FAILED'
    });
  }
});

/**
 * Admin: Get All Users
 */
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { displayName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          loginCount: true
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    logger.error('Failed to get users:', error);
    res.status(500).json({
      error: 'Failed to retrieve users',
      code: 'USERS_RETRIEVAL_FAILED'
    });
  }
});

export default router;