/**
 * Transcripts Routes for Delegate AI
 * ==================================
 * 
 * Handles voice transcription records and history.
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, logUserAction } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get User Transcripts
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, sessionId } = req.query;
    const userId = req.user!.id;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };
    if (sessionId) {
      where.sessionId = sessionId;
    }

    const [raws, total] = await Promise.all([
      prisma.transcript.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          content: true,   // <-- JSON blob
          createdAt: true,
          session: {
            select: {
              id: true,
              title: true,
              type: true
            }
          }
        }
      }),
      prisma.transcript.count({ where })
    ]);

    const transcripts = raws.map(t => {
      const c = t.content as {
        originalText?: string;
        cleanedText?: string;
        confidence?: number;
        language?: string;
        audioDuration?: number;
        status?: string;
      };
      return {
        id:           t.id,
        originalText: c.originalText,
        cleanedText:  c.cleanedText,
        confidence:   c.confidence,
        language:     c.language,
        audioDuration:c.audioDuration,
        status:       c.status,
        createdAt:    t.createdAt,
        session:      t.session
      };
    });

    res.json({
      transcripts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    logger.error('Failed to get transcripts:', error);
    res.status(500).json({
      error: 'Failed to retrieve transcripts',
      code: 'TRANSCRIPT_RETRIEVAL_FAILED'
    });
  }
});

/**
 * Get Single Transcript
 */
router.get('/:transcriptId', async (req: Request, res: Response) => {
  try {
    const { transcriptId } = req.params;
    const userId = req.user!.id;

    const transcript = await prisma.transcript.findFirst({
      where: {
        id: transcriptId,
        userId: userId
      },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      }
    });

    if (!transcript) {
      return res.status(404).json({
        error: 'Transcript not found',
        code: 'TRANSCRIPT_NOT_FOUND'
      });
    }

    res.json({ transcript });

  } catch (error) {
    logger.error('Failed to get transcript:', error);
    res.status(500).json({
      error: 'Failed to retrieve transcript',
      code: 'TRANSCRIPT_RETRIEVAL_FAILED'
    });
  }
});

/**
 * Delete Transcript
 */
router.delete('/:transcriptId', async (req: Request, res: Response) => {
  try {
    const { transcriptId } = req.params;
    const userId = req.user!.id;

    const transcript = await prisma.transcript.findFirst({
      where: {
        id: transcriptId,
        userId: userId
      }
    });

    if (!transcript) {
      return res.status(404).json({
        error: 'Transcript not found',
        code: 'TRANSCRIPT_NOT_FOUND'
      });
    }

    await prisma.transcript.update({
      where: { id: transcriptId },
      data: {
        isRedacted: true,
        redactedAt: new Date(),
        originalText: '[Transcript deleted by user]',
        cleanedText: '[Transcript deleted by user]'
      }
    });

    await logUserAction(req, 'transcript_deleted', 'transcripts', { transcriptId });

    res.json({ message: 'Transcript deleted successfully' });

  } catch (error) {
    logger.error('Failed to delete transcript:', error);
    res.status(500).json({
      error: 'Failed to delete transcript',
      code: 'TRANSCRIPT_DELETION_FAILED'
    });
  }
});

export default router;