/**
 * MESSAGES ROUTES - ENHANCED WITH MULTI-PROVIDER AI SUPPORT
 * =========================================================
 * 
 * Enhanced message handling with support for:
 * - Multiple AI providers (OpenAI, Gemini)
 * - Streaming responses with SSE
 * - Vision capabilities (image analysis)
 * - Provider selection and fallback
 * - Usage tracking and monitoring
 * - Rate limiting and error handling
 */

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { aiServiceManager, AIMessage, AIServiceOptions } from '../services/aiServiceManager';
import { auth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import logger from '../utils/logger';

const router = express.Router();

// Rate limiting for AI requests
const aiRateLimit = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  message: 'Too many AI requests, please try again later'
});

// Validation middleware
const validateMessageRequest = [
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

/**
 * POST /api/v1/messages/completion
 * Generate AI completion
 */
router.post('/completion', 
  auth, 
  aiRateLimit, 
  validateMessageRequest,
  async (req: Request, res: Response) => {
    try {
      // Validate request
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

      logger.info(`🤖 AI completion request from user ${userId}:`, {
        messageCount: messages.length,
        provider: options.provider,
        model: options.model
      });

      // Generate AI response
      const response = await aiServiceManager.generateStreamCompletion(messages, {
        ...options,
        userId
      });

      // Log success
      logger.info(`✅ AI completion successful:`, {
        userId,
        provider: response.provider,
        model: response.model,
        tokens: response.usage.totalTokens,
        cost: response.usage.cost,
        processingTime: response.processingTime
      });

      res.json(response);

    } catch (error) {
      logger.error('❌ AI completion failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: error.message
          });
        }
        
        if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
          return res.status(401).json({
            error: 'Authentication failed',
            message: 'AI service authentication failed'
          });
        }
        
        if (error.message.includes('quota')) {
          return res.status(503).json({
            error: 'Service unavailable',
            message: 'AI service quota exceeded'
          });
        }
      }

      res.status(500).json({
        error: 'AI completion failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/v1/messages/completion/stream
 * Generate streaming AI completion
 */
router.post('/completion/stream', 
  auth, 
  aiRateLimit, 
  validateMessageRequest,
  async (req: Request, res: Response) => {
    try {
      // Validate request
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

      logger.info(`🌊 AI streaming request from user ${userId}:`, {
        messageCount: messages.length,
        provider: options.provider,
        model: options.model
      });

      // Set up SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Send initial connection event
      res.write('data: {"type":"connected"}\n\n');

      try {
        // Generate streaming response
        const stream = aiServiceManager.generateStreamCompletion(messages, {
          ...options,
          userId
        });

        for await (const chunk of await stream) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          
          if (chunk.isComplete) {
            logger.info(`✅ AI streaming completed:`, {
              userId,
              provider: chunk.provider,
              usage: chunk.usage
            });
            break;
          }
        }

        // Send completion signal
        res.write('data: [DONE]\n\n');

      } catch (streamError) {
        logger.error('❌ AI streaming failed:', streamError);
        
        res.write(`data: ${JSON.stringify({
          error: true,
          message: streamError instanceof Error ? streamError.message : 'Streaming failed'
        })}\n\n`);
      }

      res.end();

    } catch (error) {
      logger.error('❌ AI streaming setup failed:', error);
      
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Streaming setup failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      } else {
        res.write(`data: ${JSON.stringify({
          error: true,
          message: 'Streaming setup failed'
        })}\n\n`);
        res.end();
      }
    }
  }
);

/**
 * POST /api/v1/messages/vision
 * Generate vision completion (image analysis)
 */
router.post('/vision', 
  auth, 
  aiRateLimit, 
  validateVisionRequest,
  async (req: Request, res: Response) => {
    try {
      // Validate request
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

      logger.info(`👁️ Vision completion request from user ${userId}:`, {
        textLength: text.length,
        hasImage: !!imageData,
        provider: options.provider,
        model: options.model
      });

      // Generate vision response
      const response = await aiServiceManager.generateVisionCompletion(text, imageData, {
        ...options,
        userId
      });

      // Log success
      logger.info(`✅ Vision completion successful:`, {
        userId,
        provider: response.provider,
        model: response.model,
        tokens: response.usage.totalTokens,
        processingTime: response.processingTime
      });

      res.json(response);

    } catch (error) {
      logger.error('❌ Vision completion failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not support')) {
          return res.status(400).json({
            error: 'Feature not supported',
            message: 'Selected provider does not support vision capabilities'
          });
        }
      }

      res.status(500).json({
        error: 'Vision completion failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/messages/providers
 * Get available AI providers
 */
router.get('/providers', 
  auth,
  async (req: Request, res: Response) => {
    try {
      const providers = aiServiceManager.getAvailableProviders();
      
      res.json({
        providers,
        defaultProvider: 'openai' // This could come from config
      });

    } catch (error) {
      logger.error('❌ Failed to get providers:', error);
      res.status(500).json({
        error: 'Failed to get providers',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/messages/providers/:provider/models
 * Get available models for a provider
 */
router.get('/providers/:provider/models', 
  auth,
  async (req: Request, res: Response) => {
    try {
      const { provider } = req.params as { provider: 'openai' | 'gemini' };
      
      if (!['openai', 'gemini'].includes(provider)) {
        return res.status(400).json({
          error: 'Invalid provider',
          message: 'Provider must be either "openai" or "gemini"'
        });
      }

      const models = await aiServiceManager.getAvailableModels(provider);
      
      res.json({
        provider,
        models
      });

    } catch (error) {
      logger.error(`❌ Failed to get models for ${req.params.provider}:`, error);
      res.status(500).json({
        error: 'Failed to get models',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/messages/providers/:provider/health
 * Get health status for a provider
 */
router.get('/providers/:provider/health', 
  auth,
  async (req: Request, res: Response) => {
    try {
      const { provider } = req.params as { provider: 'openai' | 'gemini' };
      
      if (!['openai', 'gemini'].includes(provider)) {
        return res.status(400).json({
          error: 'Invalid provider',
          message: 'Provider must be either "openai" or "gemini"'
        });
      }

      const health = aiServiceManager.getProviderHealth(provider);
      res.json(health);

    } catch (error) {
      logger.error(`❌ Failed to get health for ${req.params.provider}:`, error);
      res.status(500).json({
        error: 'Failed to get provider health',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/messages/health
 * Get health status for all providers
 */
router.get('/health', 
  auth,
  async (req: Request, res: Response) => {
    try {
      const health = aiServiceManager.getProviderHealth();
      res.json(health);

    } catch (error) {
      logger.error('❌ Failed to get overall health:', error);
      res.status(500).json({
        error: 'Failed to get health status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/messages/providers/:provider/usage
 * Get usage statistics for a provider
 */
router.get('/providers/:provider/usage', 
  auth,
  async (req: Request, res: Response) => {
    try {
      const { provider } = req.params as { provider: 'openai' | 'gemini' };
      
      if (!['openai', 'gemini'].includes(provider)) {
        return res.status(400).json({
          error: 'Invalid provider',
          message: 'Provider must be either "openai" or "gemini"'
        });
      }

      const usage = aiServiceManager.getUsageStats(provider);
      res.json({
        provider,
        usage
      });

    } catch (error) {
      logger.error(`❌ Failed to get usage for ${req.params.provider}:`, error);
      res.status(500).json({
        error: 'Failed to get usage statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/messages/usage
 * Get usage statistics for all providers
 */
router.get('/usage', 
  auth,
  async (req: Request, res: Response) => {
    try {
      const usage = aiServiceManager.getUsageStats();
      res.json(usage);

    } catch (error) {
      logger.error('❌ Failed to get overall usage:', error);
      res.status(500).json({
        error: 'Failed to get usage statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/v1/messages/test/:provider
 * Test a specific provider
 */
router.post('/test/:provider', 
  auth,
  async (req: Request, res: Response) => {
    try {
      const { provider } = req.params as { provider: 'openai' | 'gemini' };
      
      if (!['openai', 'gemini'].includes(provider)) {
        return res.status(400).json({
          error: 'Invalid provider',
          message: 'Provider must be either "openai" or "gemini"'
        });
      }

      const startTime = Date.now();
      
      // Simple test request
      const response = await aiServiceManager.generateStreamCompletion(
        [{ role: 'user', content: 'Hello, please respond with "OK"' }],
        { 
          provider, 
          maxTokens: 10,
          userId: req.user?.id 
        }
      );

      const latency = Date.now() - startTime;

      res.json({
        provider,
        success: true,
        latency,
        response: response.content,
        usage: response.usage
      });

    } catch (error) {
      logger.error(`❌ Provider test failed for ${req.params.provider}:`, error);
      
      res.status(500).json({
        provider: req.params.provider,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;