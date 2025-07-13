/**
 * CAMPAIGN ROUTES - MODEL UN CAMPAIGN MANAGEMENT
 * ==============================================
 * 
 * Backend routes for handling Model UN campaign functionality including
 * character generation, crisis management, and AI interactions.
 */

import express from 'express';
import { Request, Response } from 'express';
import { auth as authMiddleware } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import requestLogger from '../middleware/requestLogger';
import { aiServiceManager } from '../services/aiServiceManager';
import database from '../services/database';
import * as campaignDb from '../services/campaignDB';
import { logger } from '../utils/logger';

const router = express.Router();

// Apply middleware
router.use(authMiddleware);
router.use(rateLimiter);
router.use(requestLogger);

// ============================================================================
// CHARACTER GENERATION ENDPOINTS
// ============================================================================

/**
 * Generate player character for campaign
 */
router.post('/generate-player-character', async (req: Request, res: Response) => {
  try {
    const { scenarioId, scenarioContext, theme, difficulty, sessionId } = req.body;
    const userId = req.user?.id;

    if (!scenarioId || !scenarioContext) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: user ID is missing'
    });
    }

    logger.info('Generating player character', { userId, scenarioId, sessionId });

    // Generate character using AI service
    const character = await aiServiceManager.generatePlayerCharacter({
      scenarioId,
      sessionId,
      scenarioContext,
      theme,
      difficulty,
      userId
    });

    // Save character to database
    await campaignDb.savePlayerCharacter(userId, scenarioId, character, sessionId);

    res.json({
      success: true,
      data: character
    });

  } catch (error) {
    logger.error('Error generating player character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate player character'
    });
  }
});

/**
 * Generate AI characters for campaign
 */
router.post('/generate-ai-characters', async (req: Request, res: Response) => {
  try {
    const { scenarioId, scenarioContext, characters, playerCharacter, theme, sessionId } = req.body;
    const userId = req.user?.id;

    if (!scenarioId || !characters || !playerCharacter) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: user ID is missing'
    });
    }

    logger.info('Generating AI characters', { userId, scenarioId });

    // Generate characters using AI service
    const aiCharacters = await aiServiceManager.generateAICharacters({
      scenarioContext,
      characters,
      playerCharacter,
      theme,
      userId,
      scenarioId: ''
    });

    // Save characters to database
    await campaignDb.saveAICharacters(userId, scenarioId, aiCharacters, sessionId);

    res.json({
      success: true,
      data: aiCharacters
    });

  } catch (error) {
    logger.error('Error generating AI characters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI characters'
    });
  }
});

// ============================================================================
// CRISIS MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Generate crisis for campaign
 */
router.post('/generate-crisis', async (req: Request, res: Response) => {
  try {
    const { sessionId, initialCrisis, currentPhase, characters, context, difficulty } = req.body;
    const userId = req.user?.id;

    if (!sessionId || !initialCrisis) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: user ID is missing'
    });
    }

    logger.info('Generating crisis', { userId, sessionId });

    // Generate crisis using AI service
    const crisis = await aiServiceManager.generateCrisis({
      sessionId,
      initialCrisis,
      currentPhase,
      characters,
      context,
      difficulty,
      userId
    });

    // Save crisis to database
    await campaignDb.saveCrisis(userId, sessionId, crisis);

    res.json({
      success: true,
      data: crisis
    });

  } catch (error) {
    logger.error('Error generating crisis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate crisis'
    });
  }
});

// ============================================================================
// AI INTERACTION ENDPOINTS
// ============================================================================

/**
 * Process player input and generate AI responses
 */
router.post('/process-player-input', async (req: Request, res: Response) => {
  try {
    const { 
      sessionId, 
      transcript, 
      playerCharacter, 
      aiCharacters, 
      currentCrisis, 
      currentPhase, 
      campaignLog, 
      difficulty 
    } = req.body;
    const userId = req.user?.id;

    if (!sessionId || !transcript) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: user ID is missing'
    });
    }

    logger.info('Processing player input', { userId, sessionId });

    // Process input using AI service
    const response = await aiServiceManager.processPlayerInput({
      sessionId,
      transcript,
      playerCharacter,
      aiCharacters,
      currentCrisis,
      currentPhase,
      campaignLog,
      difficulty,
      userId
    });

    // Save interaction to database
    await campaignDb.savePlayerInteraction(userId, sessionId, {
      transcript,
      response,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error('Error processing player input:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process player input'
    });
  }
});

/**
 * Process player choice and return consequences
 */
router.post('/process-choice', async (req: Request, res: Response) => {
  try {
    const { 
      sessionId, 
      choice, 
      currentCrisis, 
      playerCharacter, 
      aiCharacters, 
      currentPhase 
    } = req.body;
    const userId = req.user?.id;

    if (!sessionId || !choice) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: user ID is missing'
    });
    }

    logger.info('Processing player choice', { userId, sessionId });

    // Process choice using AI service
    const result = await aiServiceManager.processPlayerChoice({
      sessionId,
      choice,
      currentCrisis,
      playerCharacter,
      aiCharacters,
      currentPhase,
      userId
    });

    // Save choice and consequences to database
    await campaignDb.savePlayerChoice(userId, sessionId, {
      choice,
      result,
      createdAt: new Date()
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error processing player choice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process player choice'
    });
  }
});

// ============================================================================
// SESSION MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Save campaign session
 */
router.post('/save-session', async (req: Request, res: Response) => {
  try {
    const { sessionId, sessionData } = req.body;
    const userId = req.user?.id;

    if (!sessionId || !sessionData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    logger.info('Saving campaign session', { userId, sessionId });

    // Save session to database
    await database.saveCampaignSession(userId, sessionId, sessionData);

    res.json({
      success: true,
      message: 'Session saved successfully'
    });

  } catch (error) {
    logger.error('Error saving campaign session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save campaign session'
    });
  }
});

/**
 * Load campaign session
 */
router.get('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing session ID'
      });
    }

    logger.info('Loading campaign session', { userId, sessionId });

    // Load session from database
    const sessionData = await database.loadCampaignSession(userId, sessionId);

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: sessionData
    });

  } catch (error) {
    logger.error('Error loading campaign session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load campaign session'
    });
  }
});

/**
 * Get campaign history for user
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = 10, offset = 0 } = req.query;

    logger.info('Fetching campaign history', { userId });

    // Get campaign history from database
    const history = await database.getCampaignHistory(userId, {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    logger.error('Error fetching campaign history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign history'
    });
  }
});

export default router;