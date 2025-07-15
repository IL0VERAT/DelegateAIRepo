/**
 * ENVIRONMENT CONFIGURATION
 * =========================
 * 
 * Centralized environment variable management with validation
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Environment {
  NODE_ENV: string;
  PORT: number;
  isDevelopment: boolean;
  
  // Database
  DATABASE_URL: string;
  REDIS_URL: string;
  REDIS_MAX_RETRIES?: number;
  REDIS_KEY_PREFIX?: string;
  
  // Authentication
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
  
  // Stripe
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRO_PRICE_ID?: string;
  STRIPE_ENTERPRISE_PRICE_ID?: string;
  
  // Frontend
  FRONTEND_URL: string;
  
  // Email
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  FROM_EMAIL?: string;
  
  // AI Services
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  
  // File Storage
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;
  
  // Security
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW?: number;
  RATE_LIMIT_MAX?: number;
  
  // Monitoring
  SENTRY_DSN?: string;
  LOG_LEVEL?: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${key} is required`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
}

export const environment: Environment = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 3001),
  isDevelopment: process.env.NODE_ENV !== 'production',
  
  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  REDIS_URL: getEnvVar('REDIS_URL'),
  
  // Authentication
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  BCRYPT_ROUNDS: getEnvNumber('BCRYPT_ROUNDS', 12),
  
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
  STRIPE_ENTERPRISE_PRICE_ID: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  
  // Frontend
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: getEnvNumber('SMTP_PORT', 587),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL,
  
  // AI Services
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  
  // File Storage
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  
  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? '',
  RATE_LIMIT_WINDOW: getEnvNumber('RATE_LIMIT_WINDOW', 900000), // 15 minutes
  RATE_LIMIT_MAX: getEnvNumber('RATE_LIMIT_MAX', 100),
  
  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

// Validate critical environment variables
export function validateEnvironment(): void {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'FRONTEND_URL'
  ];

  const missing = requiredVars.filter(key => !environment[key as keyof Environment]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn about optional but recommended variables
  const recommended = {
    STRIPE_SECRET_KEY: 'Payment processing will not work',
    GEMINI_API_KEY: 'AI features will not work',
    SMTP_HOST: 'Email notifications will not work',
    REDIS_URL: 'Caching and rate limiting will use memory storage'
  };

  Object.entries(recommended).forEach(([key, message]) => {
    if (!environment[key as keyof Environment]) {
      console.warn(`Warning: ${key} not set - ${message}`);
    }
  });
}

export default environment;
export const securityConfig = environment;
export const redisConfig = environment;
export const environmentInfo = environment;