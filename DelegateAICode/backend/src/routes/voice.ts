/**
 * VOICE ROUTES - GEMINI ONLY INTEGRATION
 * ======================================
 * 
 * Backend routes for handling voice generation using ONLY Gemini Native Audio.
 * OpenAI TTS has been completely removed.
 */

import express from 'express';
import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { adaptiveRateLimit } from '../middleware';
import requestLogger from '../middleware/requestLogger';
import { geminiService } from '../services/gemini';
import * as database from '../services/database';
import { logger } from '../utils/logger';

const router = express.Router();

// Apply middleware
router.use(auth);
router.use(adaptiveRateLimit);
router.use(requestLogger);

// ============================================================================
// GEMINI NATIVE AUDIO ENDPOINTS (ONLY VOICE PROVIDER)
// ============================================================================

/**
 * Generate speech using Gemini Native Audio
 */
router.post('/gemini/generate', async (req: Request, res: Response) => {
  try {
    const { text, voiceId, settings, characterPersonality } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!text || !voiceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: text and voiceId'
      });
    }

    logger.info('Generating speech with Gemini Native Audio', { 
      userId, 
      voiceId, 
      textLength: text.length 
    });

    // Generate audio using Gemini service
    const audioData = await geminiService.generateNativeAudio({
      text,
      voiceId,
      settings: {
        speed: settings?.speed || 1.0,
        volume: settings?.volume || 0.8,
        pitch: settings?.pitch || 0,
        voiceType: settings?.voiceType || 'professional',
        language: settings?.language || 'en-US'
      },
      characterPersonality 
    });

    // Save generation record
    await database.saveAudioGeneration(userId, {
      text,
      voiceId,
      provider: 'gemini',
      settings,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: {
        audioData: audioData, // Base64 encoded audio
        format: 'mp3',
        duration: Math.ceil(text.length / 10), // Approximate duration
        voiceId,
        provider: 'gemini'
      }
    });

  } catch (error) {
    logger.error('Error generating speech with Gemini:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate speech with Gemini'
    });
  }
});

/**
 * Get available Gemini voices
 */
router.get('/gemini/voices', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    logger.info('Fetching available Gemini voices', { userId });

    // Get voices from Gemini service
    const voices = await geminiService.getAvailableVoices();

    res.json({
      success: true,
      data: voices
    });

  } catch (error) {
    logger.error('Error fetching Gemini voices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available voices'
    });
  }
});

/**
 * Health check for Gemini Audio service
 */
router.get('/gemini/health', async (req: Request, res: Response) => {
  try {
    const isHealthy = await geminiService.healthCheck();

    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        provider: 'gemini',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Gemini health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

// ============================================================================
// VOICE ASSIGNMENT ENDPOINTS
// ============================================================================

/**
 * Save voice assignments for campaign
 */
router.post('/save-assignments', async (req: Request, res: Response) => {
  try {
    const { sessionId, assignments } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!sessionId || !assignments) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    logger.info('Saving voice assignments', { userId, sessionId });

    // Save assignments to database
    await database.saveVoiceAssignments(userId, sessionId, assignments);

    res.json({
      success: true,
      message: 'Voice assignments saved successfully'
    });

  } catch (error) {
    logger.error('Error saving voice assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save voice assignments'
    });
  }
});

/**
 * Get voice assignments for campaign
 */
router.get('/assignments/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing session ID'
      });
    }

    logger.info('Fetching voice assignments', { userId, sessionId });

    // Get assignments from database
    const assignments = await database.getVoiceAssignments(userId, sessionId);

    res.json({
      success: true,
      data: assignments
    });

  } catch (error) {
    logger.error('Error fetching voice assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voice assignments'
    });
  }
});

// ============================================================================
// LEGACY ENDPOINTS (redirected to Gemini)
// ============================================================================

/**
 * Legacy generate-speech endpoint (redirects to Gemini)
 */
router.post('/generate-speech', async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Legacy endpoint called, redirecting to Gemini');
  
  // Map legacy parameters to Gemini format
  const { text, voiceId, settings } = req.body;
  req.body = {
    text,
    voiceId: voiceId || 'gemini-diplomat-male-1', // Default voice
    settings: {
      speed: settings?.speechRate || settings?.speed || 1.0,
      volume: settings?.volume || 0.8,
      voiceType: 'professional'
    }
  };
  
   // find the /gemini/generate layer
    const layer = router.stack.find(layer =>
      Boolean(layer.route?.path === '/gemini/generate')
    );
    
    if (!layer||!layer.route) {
      return next();  // nothing to redirect to
    }
    
    // invoke its handler with (req, res, next)
    return layer.route.stack[0].handle(req, res, next);
});

/**
 * Legacy available-voices endpoint (redirects to Gemini)
 */
router.get('/available-voices', async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Legacy voices endpoint called, redirecting to Gemini');

  // find the /gemini/voices layer
    const layer = router.stack.find(layer =>
      Boolean(layer.route?.path === '/gemini/voices')
    );
    
    if (!layer||!layer.route) {
      return next();  // nothing to redirect to
    }
    
    // invoke its handler with (req, res, next)
    return layer.route.stack[0].handle(req, res, next);
});

/**
 * Health check for all voice services (Gemini only now)
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const geminiHealthy = await geminiService.healthCheck();

    res.json({
      success: true,
      data: {
        gemini: geminiHealthy ? 'healthy' : 'unhealthy',
        primary: 'gemini',
        fallback: 'browser',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Voice health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Voice health check failed'
    });
  }
});

export default router;