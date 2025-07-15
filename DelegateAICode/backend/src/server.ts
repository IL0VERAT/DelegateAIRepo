/**
 * UPDATED SERVER WITH SUBSCRIPTION ROUTES
 * =======================================
 * 
 * Main server file updated to include subscription management
 */

import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';

// Import middleware
import { 
  errorHandler, 
  requestLogger, 
  rateLimiter, 
  security,
  cache
} from './middleware';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import campaignRoutes from './routes/campaigns';
import sessionRoutes from './routes/sessions';
import messageRoutes from './routes/messages';
import transcriptRoutes from './routes/transcripts';
import voiceRoutes from './routes/voice';
import aiRoutes from './routes/ai';
import adminRoutes from './routes/admin';
import healthRoutes from './routes/health';
import subscriptionRoutes from './routes/subscriptions'; // NEW

import logger from './utils/logger';
import { environment } from './config/environment';

// ============================================================================
// SERVER SETUP
// ============================================================================

const app = express();
const prisma = new PrismaClient();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Security middleware
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

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// For Stripe webhooks (raw body needed)
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

// Compression middleware
app.use(compression());

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Security headers
app.use(security);

// Caching
app.use(cache);

// ============================================================================
// ROUTES SETUP
// ============================================================================

// Health check (no auth required)
app.use('/api/health', healthRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Subscription routes (some require auth, webhook doesn't)
app.use('/api/subscriptions', subscriptionRoutes);

// Protected routes (require authentication)
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/transcripts', transcriptRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// ============================================================================
// ROOT ENDPOINT
// ============================================================================

app.get('/', (req, res) => {
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

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close Prisma connection
    await prisma.$disconnect();
    logger.info('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================================================
// SERVER START
// ============================================================================

const PORT = environment.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${environment.NODE_ENV}`);
  logger.info(`🔗 Database: ${environment.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  logger.info(`💳 Stripe: ${environment.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
  logger.info(`📧 Email: ${environment.SMTP_HOST ? 'Configured' : 'Not configured'}`);
});

export default app;