/**
 * Sessions Routes for Delegate AI
 * ===============================
 * 
 * Handles conversation session management including:
 * - Creating and configuring new sessions
 * - Updating session settings (AI model, debate strength, etc.)
 * - Session lifecycle management
 * - Session analytics and statistics
 * - Privacy compliance and data retention
 */

import express, { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { auth, logUserAction } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Create New Session
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      type = 'CHAT',
      aiModel = 'gemini-1.5-pro',
      aiTemperature = 0.7,
      aiMaxTokens = 2048,
      debateStrength = 3,
      systemPrompt,
      voiceId,
      campaignId,
      voiceSpeed = 1.0,
      voiceLanguage = 'en',
      isPrivate = false
    } = req.body;
    const userId = req.user!.id;

    // Validate inputs
    if (aiTemperature < 0 || aiTemperature > 2) {
      return res.status(400).json({
        error: 'AI temperature must be between 0 and 2',
        code: 'INVALID_TEMPERATURE'
      });
    }

    if (debateStrength < 1 || debateStrength > 5) {
      return res.status(400).json({
        error: 'Debate strength must be between 1 and 5',
        code: 'INVALID_DEBATE_STRENGTH'
      });
    }

    if (aiMaxTokens < 1 || aiMaxTokens > 4000) {
      return res.status(400).json({
        error: 'Max tokens must be between 1 and 4000',
        code: 'INVALID_MAX_TOKENS'
      });
    }

    if (!['CHAT', 'VOICE', 'HYBRID'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid session type',
        code: 'INVALID_SESSION_TYPE'
      });
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        userId,
        title: title || `${type} Session`,
        description,
        type,
        status: 'ACTIVE',
        aiTemperature,
        aiMaxTokens,
        debateStrength,
        systemPrompt,
        voiceId,
        voiceSpeed,
        voiceLanguage,
        isPrivate,
        messageCount: 0,
        totalTokens: 0,
        totalCost: 0.0,
        campaignId,
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    await logUserAction(req, 'session_created', 'sessions', {
      sessionId: session.id,
      type: session.type,
      debateStrength: session.debateStrength
    });

    logger.info('Session created', {
      userId,
      sessionId: session.id,
      type: session.type,
      debateStrength: session.debateStrength
    });

    res.status(201).json({
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        type: session.type,
        status: session.status,
        aiTemperature: session.aiTemperature,
        aiMaxTokens: session.aiMaxTokens,
        debateStrength: session.debateStrength,
        systemPrompt: session.systemPrompt,
        voiceId: session.voiceId,
        voiceSpeed: session.voiceSpeed,
        voiceLanguage: session.voiceLanguage,
        isPrivate: session.isPrivate,
        messageCount: session.messageCount,
        totalTokens: session.totalTokens,
        totalCost: session.totalCost,
        startedAt: session.startedAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });

  } catch (error) {
    logger.error('Session creation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id
    });

    res.status(500).json({
      error: 'Failed to create session',
      code: 'SESSION_CREATION_FAILED'
    });
  }
});

/**
 * Get User Sessions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status = 'ACTIVE',
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;
    const userId = req.user!.id;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      userId: userId
    };

    if (type) {
      where.type = type;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [sessions, totalSessions] = await Promise.all([
      prisma.session.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          status: true,
          aiTemperature: true,
          aiMaxTokens: true,
          debateStrength: true,
          voiceId: true,
          voiceSpeed: true,
          voiceLanguage: true,
          isPrivate: true,
          messageCount: true,
          totalTokens: true,
          totalCost: true,
          duration: true,
          startedAt: true,
          endedAt: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.session.count({ where })
    ]);

    res.json({
      sessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalSessions,
        totalPages: Math.ceil(totalSessions / limitNum),
        hasNext: skip + limitNum < totalSessions,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    logger.error('Failed to get user sessions', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id
    });

    res.status(500).json({
      error: 'Failed to retrieve sessions',
      code: 'SESSION_RETRIEVAL_FAILED'
    });
  }
});

/**
 * Get Single Session
 */
router.get('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: userId
      },
      include: {
        _count: {
          select: {
            messages: true,
            transcripts: true
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found or access denied',
        code: 'SESSION_NOT_FOUND'
      });
    }

    res.json({
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        type: session.type,
        status: session.status,
        aiTemperature: session.aiTemperature,
        aiMaxTokens: session.aiMaxTokens,
        debateStrength: session.debateStrength,
        systemPrompt: session.systemPrompt,
        voiceId: session.voiceId,
        voiceSpeed: session.voiceSpeed,
        voiceLanguage: session.voiceLanguage,
        isPrivate: session.isPrivate,
        messageCount: session.messageCount,
        totalTokens: session.totalTokens,
        totalCost: session.totalCost,
        duration: session.duration,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        counts: {
          messages: session._count.messages,
          transcripts: session._count.transcripts
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get session', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
      sessionId: req.params.sessionId
    });

    res.status(500).json({
      error: 'Failed to retrieve session',
      code: 'SESSION_RETRIEVAL_FAILED'
    });
  }
});

/**
 * Update Session
 */
router.put('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const {
      title,
      description,
      aiTemperature,
      aiMaxTokens,
      debateStrength,
      systemPrompt,
      voiceId,
      voiceSpeed,
      voiceLanguage,
      isPrivate,
      campaignId,
      status
    } = req.body;
    const userId = req.user!.id;

    // Check if session exists and belongs to user
    const existingSession = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: userId
      }
    });

    if (!existingSession) {
      return res.status(404).json({
        error: 'Session not found or access denied',
        code: 'SESSION_NOT_FOUND'
      });
    }

    // Validate inputs if provided
    if (aiTemperature !== undefined && (aiTemperature < 0 || aiTemperature > 2)) {
      return res.status(400).json({
        error: 'AI temperature must be between 0 and 2',
        code: 'INVALID_TEMPERATURE'
      });
    }

    if (debateStrength !== undefined && (debateStrength < 1 || debateStrength > 5)) {
      return res.status(400).json({
        error: 'Debate strength must be between 1 and 5',
        code: 'INVALID_DEBATE_STRENGTH'
      });
    }

    if (aiMaxTokens !== undefined && (aiMaxTokens < 1 || aiMaxTokens > 4000)) {
      return res.status(400).json({
        error: 'Max tokens must be between 1 and 4000',
        code: 'INVALID_MAX_TOKENS'
      });
    }

    if (status && !['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid session status',
        code: 'INVALID_SESSION_STATUS'
      });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (aiTemperature !== undefined) updateData.aiTemperature = aiTemperature;
    if (aiMaxTokens !== undefined) updateData.aiMaxTokens = aiMaxTokens;
    if (debateStrength !== undefined) updateData.debateStrength = debateStrength;
    if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt;
    if (voiceId !== undefined) updateData.voiceId = voiceId;
    if (voiceSpeed !== undefined) updateData.voiceSpeed = voiceSpeed;
    if (voiceLanguage !== undefined) updateData.voiceLanguage = voiceLanguage;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'COMPLETED' && !existingSession.endedAt) {
        updateData.endedAt = new Date();
        // Calculate duration
        const duration = Math.floor((new Date().getTime() - existingSession.startedAt.getTime()) / 1000);
        updateData.duration = duration;
      }
    }

    // Update session
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: updateData
    });

    await logUserAction(req, 'session_updated', 'sessions', {
      sessionId,
      updates: Object.keys(updateData).filter(key => key !== 'updatedAt')
    });

    logger.info('Session updated', {
      userId,
      sessionId,
      updates: Object.keys(updateData)
    });

    res.json({
      session: {
        id: updatedSession.id,
        title: updatedSession.title,
        description: updatedSession.description,
        type: updatedSession.type,
        status: updatedSession.status,
        aiTemperature: updatedSession.aiTemperature,
        aiMaxTokens: updatedSession.aiMaxTokens,
        debateStrength: updatedSession.debateStrength,
        systemPrompt: updatedSession.systemPrompt,
        voiceId: updatedSession.voiceId,
        voiceSpeed: updatedSession.voiceSpeed,
        voiceLanguage: updatedSession.voiceLanguage,
        isPrivate: updatedSession.isPrivate,
        messageCount: updatedSession.messageCount,
        totalTokens: updatedSession.totalTokens,
        totalCost: updatedSession.totalCost,
        duration: updatedSession.duration,
        startedAt: updatedSession.startedAt,
        endedAt: updatedSession.endedAt,
        createdAt: updatedSession.createdAt,
        updatedAt: updatedSession.updatedAt
      }
    });

  } catch (error) {
    logger.error('Session update failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
      sessionId: req.params.sessionId
    });

    res.status(500).json({
      error: 'Failed to update session',
      code: 'SESSION_UPDATE_FAILED'
    });
  }
});

/**
 * Delete Session
 */
router.delete('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { permanent = false } = req.query;
    const userId = req.user!.id;

    // Check if session exists and belongs to user
    const existingSession = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: userId
      },
      include: {
        _count: {
          select: {
            messages: true,
            transcripts: true
          }
        }
      }
    });

    if (!existingSession) {
      return res.status(404).json({
        error: 'Session not found or access denied',
        code: 'SESSION_NOT_FOUND'
      });
    }

    if (permanent === 'true') {
      // Permanent deletion - cascade delete all related data
      await prisma.$transaction(async (tx) => {
        // Delete transcripts
        await tx.transcript.deleteMany({
          where: { sessionId }
        });

        // Delete messages
        await tx.message.deleteMany({
          where: { sessionId }
        });

        // Delete session
        await tx.session.delete({
          where: { id: sessionId }
        });
      });

      await logUserAction(req, 'session_deleted_permanent', 'sessions', {
        sessionId,
        messageCount: existingSession._count.messages,
        transcriptCount: existingSession._count.transcripts
      });

      logger.info('Session permanently deleted', {
        userId,
        sessionId,
        messageCount: existingSession._count.messages,
        transcriptCount: existingSession._count.transcripts
      });

      res.json({
        message: 'Session permanently deleted',
        deletedCounts: {
          messages: existingSession._count.messages,
          transcripts: existingSession._count.transcripts
        }
      });
    } else {
      // Soft delete - mark as deleted
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'DELETED',
          endedAt: existingSession.endedAt || new Date(),
          updatedAt: new Date()
        }
      });

      await logUserAction(req, 'session_deleted_soft', 'sessions', {
        sessionId
      });

      logger.info('Session soft deleted', {
        userId,
        sessionId
      });

      res.json({
        message: 'Session deleted (can be restored)'
      });
    }

  } catch (error) {
    logger.error('Session deletion failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
      sessionId: req.params.sessionId
    });

    res.status(500).json({
      error: 'Failed to delete session',
      code: 'SESSION_DELETION_FAILED'
    });
  }
});

/**
 * Restore Deleted Session
 */
router.post('/:sessionId/restore', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    // Check if session exists, belongs to user, and is deleted
    const deletedSession = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: userId,
        status: 'DELETED'
      }
    });

    if (!deletedSession) {
      return res.status(404).json({
        error: 'Deleted session not found or access denied',
        code: 'DELETED_SESSION_NOT_FOUND'
      });
    }

    // Restore session
    const restoredSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    });

    await logUserAction(req, 'session_restored', 'sessions', {
      sessionId
    });

    logger.info('Session restored', {
      userId,
      sessionId
    });

    res.json({
      message: 'Session restored successfully',
      session: {
        id: restoredSession.id,
        title: restoredSession.title,
        status: restoredSession.status,
        updatedAt: restoredSession.updatedAt
      }
    });

  } catch (error) {
    logger.error('Session restoration failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
      sessionId: req.params.sessionId
    });

    res.status(500).json({
      error: 'Failed to restore session',
      code: 'SESSION_RESTORATION_FAILED'
    });
  }
});

/**
 * Get Session Analytics
 */
router.get('/:sessionId/analytics', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    // Verify session access
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: userId
      }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found or access denied',
        code: 'SESSION_NOT_FOUND'
      });
    }

    const [
      messageStats,
      transcriptStats,
      messagesByRole,
      messagesByType,
      costBreakdown,
      responseTimeStats
    ] = await Promise.all([
      // Message statistics
      prisma.message.aggregate({
        where: {
          sessionId,
          status: 'COMPLETED'
        },
        _count: true,
        _sum: {
          totalTokens: true,
          cost: true
        },
        _avg: {
          responseTime: true
        }
      }),

      // Transcript statistics
      prisma.transcript.aggregate({
        where: {
          sessionId,
          status: 'COMPLETED'
        },
        _count: true,
        _sum: {
          audioDuration: true,
          audioSize: true
        },
        _avg: {
          confidence: true
        }
      }),

      // Messages by role
      prisma.message.groupBy({
        by: [Prisma.MessageScalarFieldEnum.type],
        where: {
          sessionId,
          status: 'COMPLETED'
        },
        _count: true
      }),

      // Messages by type
      prisma.message.groupBy({
        by: [Prisma.MessageScalarFieldEnum.type],
        where: {
          sessionId,
          status: 'COMPLETED'
        },
        _count: true
      }),

      // Response time statistics
      prisma.message.aggregate({
        where: {
          sessionId,
          status: 'COMPLETED',
          responseTime: { not: null }
        },
        _avg: {
          responseTime: true
        },
        _min: {
          responseTime: true
        },
        _max: {
          responseTime: true
        }
      })
    ]);

    res.json({
      session: {
        id: session.id,
        title: session.title,
        type: session.type,
        status: session.status,
        duration: session.duration,
        startedAt: session.startedAt,
        endedAt: session.endedAt
      },
      analytics: {
        messages: {
          total: messageStats._count,
          totalTokens: messageStats._sum.totalTokens || 0,
          totalCost: messageStats._sum.cost || 0,
          averageResponseTime: Math.round(messageStats._avg.responseTime || 0),
          breakdown: {
            byRole: messagesByRole,
            byType: messagesByType
          }
        },
        transcripts: {
          total: transcriptStats._count,
          totalDuration: transcriptStats._sum.audioDuration || 0,
          totalAudioSize: transcriptStats._sum.audioSize || 0,
          averageConfidence: transcriptStats._avg.confidence || 0
        },
        costs: {
          breakdown: costBreakdown,
          total: messageStats._sum.cost || 0
        },
        performance: {
          responseTime: {
            average: Math.round(responseTimeStats._avg.responseTime || 0),
            minimum: responseTimeStats._min.responseTime || 0,
            maximum: responseTimeStats._max.responseTime || 0
          }
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get session analytics', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
      sessionId: req.params.sessionId
    });

    res.status(500).json({
      error: 'Failed to retrieve session analytics',
      code: 'SESSION_ANALYTICS_FAILED'
    });
  }
});

export default router;