/**
 * AI ROUTES - UNIFIED AI PROVIDER ENDPOINTS
 * ==========================================
 * 
 * Unified AI service endpoints supporting multiple providers:
 * - Google Gemini (Gemini Pro, Ultra, Vision)
 * - Provider health monitoring
 * - Usage analytics
 * - Model information
 * - Recommendation engine
 * 
 * FIXED: Import errors resolved with proper middleware imports
 */

import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { aiServiceManager, AIMessage, AIServiceOptions } from '../services/aiServiceManager';
import { auth, requireAdmin } from '../middleware/auth';
import { aiRateLimit } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

const router = express.Router();

// Validation middleware
const validateCompletionRequest = [
  body('messages')
    .isArray({ min: 1 })
    .withMessage('Messages array is required and must not be empty'),
  body('messages.*.role')
    .isIn(['user', 'assistant', 'system'])
    .withMessage('Invalid message role'),
  body('messages.*.content')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Message content must be between 1 and 10000 characters'),
  body('options.provider')
    .optional()
    .isIn(['openai', 'gemini'])
    .withMessage('Invalid AI provider'),
  body('options.model')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model name must be valid'),
  body('options.temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be between 0 and 2'),
  body('options.maxTokens')
    .optional()
    .isInt({ min: 1, max: 8000 })
    .withMessage('Max tokens must be between 1 and 8000'),
];

const validateVisionRequest = [
  body('text')
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Text prompt must be between 1 and 5000 characters'),
  body('imageData')
    .isString()
    .withMessage('Image data is required'),
  body('options.provider')
    .optional()
    .isIn(['openai', 'gemini'])
    .withMessage('Invalid AI provider'),
];

const validateProviderParam = [
  param('provider')
    .isIn(['openai', 'gemini'])
    .withMessage('Provider must be either "openai" or "gemini"'),
];

/**
 * POST /api/v1/ai/completion
 * Generate AI completion using the best available provider
 */
router.post('/completion', 
  auth, 
  aiRateLimit, 
  validateCompletionRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { messages, options = {} }: {
      messages: AIMessage[];
      options: AIServiceOptions;
    } = req.body;

    const userId = req.user?.id;

    const response = await aiServiceManager.generateStreamCompletion(messages, {
      ...options,
      userId
    });

    res.json(response);
  })
);

/**
 * POST /api/v1/ai/completion/stream
 * Generate streaming AI completion
 */
router.post('/completion/stream', 
  auth, 
  aiRateLimit, 
  validateCompletionRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { messages, options = {} }: {
      messages: AIMessage[];
      options: AIServiceOptions;
    } = req.body;

    const userId = req.user?.id;

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    try {
      const stream = aiServiceManager.generateStreamCompletion(messages, {
        ...options,
        userId
      });

      for await (const chunk of await stream) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        
        if (chunk.isComplete) {
          break;
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();

    } catch (streamError) {
      res.write(`data: ${JSON.stringify({
        error: true,
        message: streamError instanceof Error ? streamError.message : 'Streaming failed'
      })}\n\n`);
      res.end();
    }
  })
);

/**
 * POST /api/v1/ai/vision
 * Generate vision completion (image analysis)
 */
router.post('/vision', 
  auth, 
  aiRateLimit, 
  validateVisionRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { text, imageData, options = {} }: {
      text: string;
      imageData: string;
      options: AIServiceOptions & { mimeType?: string };
    } = req.body;

    const userId = req.user?.id;

    const response = await aiServiceManager.generateVisionCompletion(text, imageData, {
      ...options,
      userId
    });

    res.json(response);
  })
);

/**
 * GET /api/v1/ai/usage
 * Get usage statistics for all providers
 */
router.get('/usage', 
  auth,
  requireAdmin, 
  asyncHandler(async (req: Request, res: Response) => {
    const usage = aiServiceManager.getUsageStats();
    
    res.json({
      usage,
      timestamp: new Date().toISOString()
    });
  })
);

export default router;