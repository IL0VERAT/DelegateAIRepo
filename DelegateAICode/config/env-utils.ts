/**
 * ENVIRONMENT UTILITIES
 * ====================
 * 
 * Helper functions for environment variable management
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type EnvValue = string | number | boolean | undefined;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get environment variable with type safety
 */
export function getEnvVar(key: string): string | undefined;
export function getEnvVar(key: string, defaultValue: string): string;
export function getEnvVar(key: string, defaultValue?: string): string | undefined {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
}

/**
 * Get required environment variable
 */
export function getRequiredEnvVar(key: string, errorMessage?: string): string {
  const value = getEnvVar(key);
  
  if (value === undefined || value === '') {
    throw new Error(errorMessage || `Required environment variable ${key} is not set`);
  }
  
  return value;
}

/**
 * Get environment variable as number
 */
export function getEnvNumber(key: string, defaultValue?: number): number | undefined {
  const value = getEnvVar(key);
  
  if (value === undefined) {
    return defaultValue;
  }
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Environment variable ${key} is not a valid number: ${value}`);
    return defaultValue;
  }
  
  return parsed;
}

/**
 * Get required environment variable as number
 */
export function getRequiredEnvNumber(key: string, errorMessage?: string): number {
  const value = getEnvNumber(key);
  
  if (value === undefined) {
    throw new Error(errorMessage || `Required environment variable ${key} is not set or not a valid number`);
  }
  
  return value;
}

/**
 * Get environment variable as boolean
 */
export function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = getEnvVar(key);
  
  if (value === undefined) {
    return defaultValue;
  }
  
  const lowercaseValue = value.toLowerCase();
  return lowercaseValue === 'true' || lowercaseValue === '1' || lowercaseValue === 'yes';
}

/**
 * Get environment variable as array (comma-separated)
 */
export function getEnvArray(key: string, defaultValue: string[] = []): string[] {
  const value = getEnvVar(key);
  
  if (value === undefined || value === '') {
    return defaultValue;
  }
  
  return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

/**
 * Get environment variable as JSON
 */
export function getEnvJSON<T = any>(key: string, defaultValue?: T): T | undefined {
  const value = getEnvVar(key);
  
  if (value === undefined) {
    return defaultValue;
  }
  
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn(`Environment variable ${key} is not valid JSON: ${value}`);
    return defaultValue;
  }
}

/**
 * Validate URL environment variable
 */
export function getEnvUrl(key: string, defaultValue?: string): string | undefined {
  const value = getEnvVar(key, defaultValue);
  
  if (value === undefined) {
    return undefined;
  }
  
  try {
    new URL(value);
    return value;
  } catch (error) {
    console.warn(`Environment variable ${key} is not a valid URL: ${value}`);
    return undefined;
  }
}

/**
 * Get required URL environment variable
 */
export function getRequiredEnvUrl(key: string, errorMessage?: string): string {
  const value = getEnvUrl(key);
  
  if (value === undefined) {
    throw new Error(errorMessage || `Required environment variable ${key} is not set or not a valid URL`);
  }
  
  return value;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnvVar('VITE_ENVIRONMENT', 'development') === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnvVar('VITE_ENVIRONMENT', 'development') === 'production';
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return getEnvVar('VITE_ENVIRONMENT', 'development') === 'test';
}

/**
 * Get all environment variables with a specific prefix
 */
export function getEnvWithPrefix(prefix: string): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const env: Record<string, string> = {};
  
  Object.keys(import.meta.env).forEach(key => {
    if (key.startsWith(prefix)) {
      const value = import.meta.env[key];
      if (typeof value === 'string') {
        env[key] = value;
      }
    }
  });
  
  return env;
}

/**
 * Validate environment configuration
 */
export interface EnvValidationRule {
  key: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'url' | 'json' | 'array';
  validator?: (value: string) => boolean;
  errorMessage?: string;
}

export function validateEnv(rules: EnvValidationRule[]): string[] {
  const errors: string[] = [];
  
  rules.forEach(rule => {
    const value = getEnvVar(rule.key);
    
    // Check if required
    if (rule.required && (value === undefined || value === '')) {
      errors.push(rule.errorMessage || `Required environment variable ${rule.key} is not set`);
      return;
    }
    
    // Skip validation if value is not set and not required
    if (value === undefined || value === '') {
      return;
    }
    
    // Type validation
    switch (rule.type) {
      case 'number':
        if (isNaN(parseInt(value, 10))) {
          errors.push(`Environment variable ${rule.key} must be a number`);
        }
        break;
        
      case 'boolean':
        const boolValue = value.toLowerCase();
        if (!['true', 'false', '1', '0', 'yes', 'no'].includes(boolValue)) {
          errors.push(`Environment variable ${rule.key} must be a boolean`);
        }
        break;
        
      case 'url':
        try {
          new URL(value);
        } catch {
          errors.push(`Environment variable ${rule.key} must be a valid URL`);
        }
        break;
        
      case 'json':
        try {
          JSON.parse(value);
        } catch {
          errors.push(`Environment variable ${rule.key} must be valid JSON`);
        }
        break;
        
      case 'array':
        // Arrays should be comma-separated
        if (!value.includes(',') && !value.trim()) {
          errors.push(`Environment variable ${rule.key} must be a comma-separated list`);
        }
        break;
    }
    
    // Custom validation
    if (rule.validator && !rule.validator(value)) {
      errors.push(rule.errorMessage || `Environment variable ${rule.key} failed validation`);
    }
  });
  
  return errors;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  EnvValidationRule
};