// src/shared/utils/logger.ts
// Logger utility for handling different log levels based on environment configuration

/**
 * Log levels supported by the logger
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Logger configuration options
 */
interface LoggerOptions {
  logLevel: LogLevel;
  environment: string;
}

/**
 * Logger utility class for structured logging
 */
export class Logger {
  private readonly logLevel: LogLevel;
  private readonly environment: string;

  /**
   * Create a new logger instance
   */
  constructor(options: LoggerOptions) {
    this.logLevel = options.logLevel;
    this.environment = options.environment;
  }

  /**
   * Check if a log level is enabled
   */
  private isLevelEnabled(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  /**
   * Format log message
   */
  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `${timestamp} [${level.toUpperCase()}] [${this.environment}] ${message}`;

    if (meta) {
      return `${baseMessage} ${JSON.stringify(meta)}`;
    }

    return baseMessage;
  }

  /**
   * Log an error message
   */
  error(message: string, meta?: Record<string, unknown>): void {
    if (this.isLevelEnabled('error')) {
      // eslint-disable-next-line no-console
      console.error(this.formatMessage('error', message, meta));
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.isLevelEnabled('warn')) {
      // eslint-disable-next-line no-console
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  /**
   * Log an info message
   */
  info(message: string, meta?: Record<string, unknown>): void {
    if (this.isLevelEnabled('info')) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('info', message, meta));
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.isLevelEnabled('debug')) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('debug', message, meta));
    }
  }
}

/**
 * Create a logger instance with the given options
 */
export const createLogger = (options: LoggerOptions): Logger => {
  return new Logger(options);
};

/**
 * Global logger instance initialized with environment variables
 */
export const appLogger = new Logger({
  logLevel: process.env.LOG_LEVEL as LogLevel || 'info',
  environment: process.env.ENVIRONMENT || 'development',
});
