/**
 * AI ROUTES - UNIFIED AI PROVIDER ENDPOINTS
 * ==========================================
 * 
 * Unified AI service endpoints supporting multiple providers:
 * - OpenAI (GPT-3.5, GPT-4, etc.)
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
import aiServiceManager, { AIMessage, AIServiceOptions } from '../services/aiServiceManager';
import { auth } from '../middleware/auth';
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

    const response = await aiServiceManager.generateCompletion(messages, {
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

      for await (const chunk of stream) {
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
 * GET /api/v1/ai/providers
 * Get available AI providers
 */
router.get('/providers', 
  auth,
  asyncHandler(async (req: Request, res: Response) => {
    const providers = aiServiceManager.getAvailableProviders();
    
    res.json({
      providers,
      total: providers.length
    });
  })
);

/**
 * GET /api/v1/ai/providers/:provider/capabilities
 * Get capabilities for a specific provider
 */
router.get('/providers/:provider/capabilities', 
  auth,
  validateProviderParam,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { provider } = req.params as { provider: 'openai' | 'gemini' };

    // Get models for the provider
    const models = await aiServiceManager.getAvailableModels(provider);

    // Define capabilities based on provider
    const capabilities = {
      provider,
      models,
      features: {
        textGeneration: true,
        streaming: true,
        vision: provider === 'gemini' || provider === 'openai',
        audio: provider === 'openai', // OpenAI has better audio support currently
        functionCalling: provider === 'openai', // OpenAI has function calling
        codeGeneration: true,
      },
      pricing: provider === 'openai' 
        ? { input: 0.001, output: 0.002 } // Approximate GPT-3.5 pricing
        : { input: 0.0005, output: 0.0015 }, // Approximate Gemini pricing
      limits: {
        maxTokens: provider === 'gemini' ? 30720 : 4096,
        rateLimitPerMinute: 60,
        contextWindow: provider === 'gemini' ? 32768 : 16384,
      }
    };

    res.json(capabilities);
  })
);

/**
 * GET /api/v1/ai/providers/:provider/models
 * Get available models for a provider
 */
router.get('/providers/:provider/models', 
  auth,
  validateProviderParam,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { provider } = req.params as { provider: 'openai' | 'gemini' };
    const models = await aiServiceManager.getAvailableModels(provider);
    
    res.json({
      provider,
      models,
      total: models.length
    });
  })
);

/**
 * GET /api/v1/ai/providers/:provider/models/:model
 * Get information about a specific model
 */
router.get('/providers/:provider/models/:model', 
  auth,
  validateProviderParam,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { provider, model } = req.params as { 
      provider: 'openai' | 'gemini'; 
      model: string; 
    };

    // This would typically come from the AI service
    // For now, we'll provide basic model information
    const modelInfo = {
      provider,
      model,
      name: model,
      description: `${provider} ${model} language model`,
      maxTokens: provider === 'gemini' ? 30720 : 4096,
      capabilities: ['text-generation'],
      pricing: {
        input: provider === 'openai' ? 0.001 : 0.0005,
        output: provider === 'openai' ? 0.002 : 0.0015,
      }
    };

    res.json(modelInfo);
  })
);

/**
 * GET /api/v1/ai/providers/:provider/health
 * Get health status for a specific provider
 */
router.get('/providers/:provider/health', 
  auth,
  validateProviderParam,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { provider } = req.params as { provider: 'openai' | 'gemini' };
    const health = aiServiceManager.getProviderHealth(provider);
    
    res.json(health);
  })
);

/**
 * GET /api/v1/ai/health
 * Get overall AI service health
 */
router.get('/health', 
  auth,
  asyncHandler(async (req: Request, res: Response) => {
    const health = aiServiceManager.getProviderHealth();
    const providers = aiServiceManager.getAvailableProviders();
    
    res.json({
      overall: Array.isArray(health) 
        ? health.every(h => h.status !== 'unhealthy') ? 'healthy' : 'degraded'
        : health.status,
      providers: health,
      availableProviders: providers,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * GET /api/v1/ai/usage
 * Get usage statistics for all providers
 */
router.get('/usage', 
  auth,
  asyncHandler(async (req: Request, res: Response) => {
    const usage = aiServiceManager.getUsageStats();
    
    res.json({
      usage,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * POST /api/v1/ai/recommend
 * Get AI provider recommendation for a task
 */
router.post('/recommend', 
  auth,
  [
    body('task.type')
      .isIn(['text', 'vision', 'code', 'reasoning'])
      .withMessage('Task type must be text, vision, code, or reasoning'),
    body('task.complexity')
      .isIn(['simple', 'medium', 'complex'])
      .withMessage('Complexity must be simple, medium, or complex'),
    body('task.priority')
      .isIn(['speed', 'quality', 'cost'])
      .withMessage('Priority must be speed, quality, or cost'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { task } = req.body as {
      task: {
        type: 'text' | 'vision' | 'code' | 'reasoning';
        complexity: 'simple' | 'medium' | 'complex';
        priority: 'speed' | 'quality' | 'cost';
      };
    };

    // Simple recommendation logic
    let provider: 'openai' | 'gemini' = 'openai';
    let model = 'gpt-3.5-turbo';
    let reasoning = 'Default recommendation';

    const availableProviders = aiServiceManager.getAvailableProviders();
    
    if (task.type === 'vision') {
      if (availableProviders.includes('gemini')) {
        provider = 'gemini';
        model = 'gemini-pro-vision';
        reasoning = 'Gemini Pro Vision has excellent vision capabilities';
      } else if (availableProviders.includes('openai')) {
        provider = 'openai';
        model = 'gpt-4-vision-preview';
        reasoning = 'GPT-4 Vision for image analysis';
      }
    } else if (task.complexity === 'complex') {
      if (task.priority === 'quality') {
        if (availableProviders.includes('openai')) {
          provider = 'openai';
          model = 'gpt-4';
          reasoning = 'GPT-4 for highest quality complex reasoning';
        } else if (availableProviders.includes('gemini')) {
          provider = 'gemini';
          model = 'gemini-pro';
          reasoning = 'Gemini Pro for complex tasks';
        }
      } else if (task.priority === 'cost') {
        if (availableProviders.includes('gemini')) {
          provider = 'gemini';
          model = 'gemini-pro';
          reasoning = 'Gemini Pro offers good value for complex tasks';
        }
      }
    } else if (task.priority === 'speed' || task.complexity === 'simple') {
      if (availableProviders.includes('openai')) {
        provider = 'openai';
        model = 'gpt-3.5-turbo';
        reasoning = 'GPT-3.5 Turbo for fast, efficient responses';
      } else if (availableProviders.includes('gemini')) {
        provider = 'gemini';
        model = 'gemini-pro';
        reasoning = 'Gemini Pro for efficient processing';
      }
    }

    res.json({
      provider,
      model,
      reasoning,
      task,
      alternatives: availableProviders.filter(p => p !== provider).map(p => ({
        provider: p,
        model: p === 'openai' ? 'gpt-3.5-turbo' : 'gemini-pro',
        reason: `Alternative ${p} option`
      }))
    });
  })
);

/**
 * POST /api/v1/ai/test/:provider
 * Test a specific provider
 */
router.post('/test/:provider', 
  auth,
  validateProviderParam,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { provider } = req.params as { provider: 'openai' | 'gemini' };
    const startTime = Date.now();
    
    const response = await aiServiceManager.generateCompletion(
      [{ role: 'user', content: 'Respond with "OK" to confirm you are working.' }],
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
      model: response.model,
      usage: response.usage,
      timestamp: new Date().toISOString()
    });
  })
);

export default router;