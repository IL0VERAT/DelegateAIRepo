/**
 * SIMPLIFIED LOGGER UTILITY
 * =========================
 * 
 * Streamlined logging utility without complex dependencies
 */

// ============================================================================
// TYPES
// ============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// ============================================================================
// LOGGER CLASS
// ============================================================================

class Logger {
  private level: LogLevel = 'info';

  constructor() {
    // Set log level from environment
    const envLogLevel = import.meta.env.VITE_LOG_LEVEL as LogLevel;
    if (envLogLevel) {
      this.level = envLogLevel;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string[] {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data !== undefined) {
      return [prefix, message, data];
    }
    return [prefix, message];
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(...this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(...this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage('warn', message, data));
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(...this.formatMessage('error', message, data));
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

// ============================================================================
// EXPORT LOGGER INSTANCE
// ============================================================================

export const logger = new Logger();
export default logger;
export type { LogLevel };