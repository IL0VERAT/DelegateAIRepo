/**
 * UPDATED SERVER WITH SUBSCRIPTION ROUTES
 * =======================================
 * 
 * Main server file updated to include subscription management
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

console.log("→ SENTRY_DSN:", process.env.SENTRY_DSN); //REMOVE
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  debug: true,  //REMOVE
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is evaluated only once per SDK.init call
  profileSessionSampleRate: 1.0,
  // Trace lifecycle automatically enables profiling during active traces
  profileLifecycle: 'trace',

  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});


import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

console.log('→ DATABASE_URL =', process.env.DATABASE_URL);

import { initializeDatabase } from './services/database';
import logger from './utils/logger';
import { environment } from './config/environment';

async function boot() {
  try {
    // 1) Initialize and connect your database first
    await initializeDatabase();
    logger.info('✅ Database initialized');

    // 2) Now that the DB is live, import everything else
    const express = (await import('express')).default;
    const cors = (await import('cors')).default;
    const helmet = (await import('helmet')).default;
    const compression = (await import('compression')).default;
    const {
      errorHandler,
      requestLogger,
      rateLimiter,
      security,
      cache
    } = await import('./middleware');
    
    // Dynamically import all routes so they see an initialized DB
    const { default: authRoutes } = await import('./routes/auth');
    const { default: userRoutes } = await import('./routes/users');
    const { default: campaignRoutes } = await import('./routes/campaigns');
    const { default: sessionRoutes } = await import('./routes/sessions');
    const { default: messageRoutes } = await import('./routes/messages');
    const { default: transcriptRoutes } = await import('./routes/transcripts');
    const { default: voiceRoutes } = await import('./routes/voice');
    const { default: aiRoutes } = await import('./routes/ai');
    const { default: adminRoutes } = await import('./routes/admin');
    const { default: healthRoutes } = await import('./routes/health');
    const { default: subscriptionRoutes } = await import('./routes/subscriptions');
    
    // 3) Create and configure Express app
    const app = express();
    app.set('trust proxy', 1);

    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          scriptSrc: ["'self'", "https://js.stripe.com"],
          connectSrc: ["'self'", "https://api.stripe.com", "wss:"],
          frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
        },
      },
    }));

    const exactOrigins = [
      process.env.FRONTEND_URL,    // e.g. https://delegate-ai.vercel.app
      'http://localhost:5173',     // Vite dev
    ].filter(Boolean) as string[]

    // A regex to match any Vercel preview URL
    const vercelPreviewRegex = /^https:\/\/[a-z0-9-]+\.vercel\.app$/

    app.use(cors({
        origin: (incomingOrigin, callback) => {
        // allow non-browser (curl/postman) requests
        if (!incomingOrigin) return callback(null, true)

        //exact matches
        if (exactOrigins.includes(incomingOrigin)) {
          return callback(null, true)
        }

        //any vercel.app subdomain
        if (vercelPreviewRegex.test(incomingOrigin)) {
          return callback(null, true)
        }

        //else reject
        return callback(new Error(`CORS not allowed for origin ${incomingOrigin}`), false)
        },
      credentials: true,
      methods: ['GET','POST','PUT','DELETE','PATCH'],
      allowedHeaders: ['Content-Type','Authorization'],
    }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
    app.use(compression());
    app.use(requestLogger);
    app.use(rateLimiter);
    app.use(security);
    app.use(cache);

    // 4) Mount routes
    app.use('/api/health', healthRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/subscriptions', subscriptionRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/campaigns', campaignRoutes);
    app.use('/api/sessions', sessionRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/transcripts', transcriptRoutes);
    app.use('/api/voice', voiceRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/admin', adminRoutes);

    app.get('/', (_req, res) => {
      res.json({
        name: 'Delegate AI API',
        version: '1.0.0',
        status: 'operational',
        timestamp: new Date().toISOString(),
        features: [
          'Model UN Simulations',
          'AI-Powered Negotiations',
          'Voice-to-Voice Interactions',
          'Real-time Campaigns',
          'Subscription Management',
          'Admin Console'
        ]
      });
    });

    // 404 + error handler
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    //ENTRY ERROR HANDLER 
    Sentry.setupExpressErrorHandler(app);
  

    app.use(errorHandler);

    // 5) Graceful shutdown
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    async function shutdown(signal: string) {
      logger.info(`Received ${signal}, shutting down...`);
      // if you have a Prisma instance in your DB service, disconnect it there
      await import('./services/database').then(m => m.closeDatabase?.());
      process.exit(0);
    }

    // 6) Start listening
    const PORT = environment.PORT;
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${environment.NODE_ENV}`);
    });

  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Actually boot the app
boot();
