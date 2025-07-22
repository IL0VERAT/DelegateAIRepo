/**
 * FRONTEND ENVIRONMENT CONFIGURATION
 * ==================================
 * 
 * Centralized environment variable management for the frontend
 */

// ============================================================================
// ENVIRONMENT INTERFACE
// ============================================================================

interface Environment {
  // API Configuration
  API_BASE_URL: string;
  WS_URL: string;
  
  // Application Settings
  APP_NAME: string;
  APP_URL: string;
  ENVIRONMENT: string;
  ENABLE_MOCK_DATA: boolean;
  version: string;
  
  // Feature Flags
  ENABLE_ANALYTICS: boolean;
  ENABLE_VOICE_FEATURES: boolean;
  ENABLE_SUBSCRIPTION_FEATURES: boolean;
  DEBUG_MODE: boolean;
  
  // External Services
  STRIPE_PUBLISHABLE_KEY?: string;
  GOOGLE_ANALYTICS_ID?: string;
  HOTJAR_ID?: string;
  
  // Logging
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  ENABLE_REMOTE_LOGGING: boolean;
  ENABLE_LOG_STORAGE: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getEnvVar(key: string, defaultValue?: string): string {
  if (typeof window === 'undefined') {
    return defaultValue || '';
  }
  
  const value = import.meta.env[key] || defaultValue;
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }
  
  return value || '';
}

function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

export const environment: Environment = {
  // API Configuration
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001/api'),
  WS_URL: getEnvVar('VITE_WS_URL', 'ws://localhost:3001'),
  
  // Application Settings
  APP_NAME: getEnvVar('VITE_APP_NAME', 'Delegate AI'),
  APP_URL: getEnvVar('VITE_APP_URL', 'http://localhost:5173'),
  ENVIRONMENT: getEnvVar('VITE_ENVIRONMENT', 'development'),
  ENABLE_MOCK_DATA: getEnvBoolean('VITE_ENABLE_MOCK_DATA', false),
  version: import.meta.env.REACT_APP_VERSION || '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: getEnvBoolean('VITE_ENABLE_ANALYTICS', false),
  ENABLE_VOICE_FEATURES: getEnvBoolean('VITE_ENABLE_VOICE_FEATURES', true),
  ENABLE_SUBSCRIPTION_FEATURES: getEnvBoolean('VITE_ENABLE_SUBSCRIPTION_FEATURES', true),
  DEBUG_MODE: getEnvBoolean('VITE_DEBUG_MODE', false),
  
  // External Services
  STRIPE_PUBLISHABLE_KEY: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY'),
  GOOGLE_ANALYTICS_ID: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
  HOTJAR_ID: getEnvVar('VITE_HOTJAR_ID'),
  
  // Logging
  LOG_LEVEL: (getEnvVar('VITE_LOG_LEVEL', 'info') as any) || 'info',
  ENABLE_REMOTE_LOGGING: getEnvBoolean('VITE_ENABLE_REMOTE_LOGGING', false),
  ENABLE_LOG_STORAGE: getEnvBoolean('VITE_ENABLE_LOG_STORAGE', false),
};

// Gemini transcription API
export const geminiConfig = {
  apiKey:           import.meta.env.VITE_GEMINI_API_KEY,
  transcriptionUrl: import.meta.env.VITE_GEMINI_TRANSCRIPTION_URL,
};

// Voice/audio defaults
export const voiceConfig = {
  audioSampleRate: Number(import.meta.env.VITE_AUDIO_SAMPLE_RATE ?? '16000'),
  audioChannels:   Number(import.meta.env.VITE_AUDIO_CHANNELS   ?? '1'),
};

//websockets
export const websocketConfig = {
  url: import.meta.env.VITE_WS_URL,
  reconnectAttempts: Number(import.meta.env.VITE_WS_RECONNECT_ATTEMPTS) || 5,
  reconnectInterval: Number(import.meta.env.VITE_WS_RECONNECT_INTERVAL) || 2000,
  heartbeatInterval: Number(import.meta.env.VITE_WS_HEARTBEAT_INTERVAL) || 30000,
  enableMockData: import.meta.env.VITE_WS_MOCK_MODE === 'true'
};

// ============================================================================
// VALIDATION
// ============================================================================

export function validateEnvironment(): string[] {
  const errors: string[] = [];
  
  // Check required variables
  if (!environment.API_BASE_URL) {
    errors.push('VITE_API_BASE_URL is required');
  }
  
  // Validate URLs
  try {
    new URL(environment.API_BASE_URL);
  } catch {
    errors.push('VITE_API_BASE_URL must be a valid URL');
  }
  
  try {
    new URL(environment.APP_URL);
  } catch {
    errors.push('VITE_APP_URL must be a valid URL');
  }
  
  // Warn about missing optional variables
  const warnings: string[] = [];
  
  if (!environment.STRIPE_PUBLISHABLE_KEY && environment.ENABLE_SUBSCRIPTION_FEATURES) {
    warnings.push('VITE_STRIPE_PUBLISHABLE_KEY not set - subscription features may not work');
  }
  
  if (!environment.GOOGLE_ANALYTICS_ID && environment.ENABLE_ANALYTICS) {
    warnings.push('VITE_GOOGLE_ANALYTICS_ID not set - analytics will not work');
  }
  
  // Log warnings
  warnings.forEach(warning => console.warn(`Warning: ${warning}`));
  
  return errors;
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

export const isDevelopment = environment.ENVIRONMENT === 'development';
export const isProduction = environment.ENVIRONMENT === 'production';
export const isDebugMode = environment.DEBUG_MODE;

export function logEnvironmentInfo(): void {
  if (isDevelopment || isDebugMode) {
    console.group('🔧 Environment Configuration');
    console.log('Environment:', environment.ENVIRONMENT);
    console.log('API Base URL:', environment.API_BASE_URL);
    console.log('WebSocket URL:', environment.WS_URL);
    console.log('Debug Mode:', environment.DEBUG_MODE);
    console.log('Features:', {
      analytics: environment.ENABLE_ANALYTICS,
      voice: environment.ENABLE_VOICE_FEATURES,
      subscriptions: environment.ENABLE_SUBSCRIPTION_FEATURES
    });
    console.groupEnd();
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default environment;
export type { Environment };