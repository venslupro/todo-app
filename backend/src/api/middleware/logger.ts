import {logger as honoLogger} from 'hono/logger';

/**
 * Custom logger middleware that extends Hono's built-in logger.
 * Provides enhanced logging with request/response details and performance metrics.
 */
export const loggerMiddleware = honoLogger((message, ...rest) => {
  const timestamp = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}]`, message, ...rest);
});

/**
 * Business logger for application-specific logging needs.
 * Follows Google TypeScript style guide conventions.
 */
export class BusinessLogger {
  /**
   * Logs informational messages for business operations.
   */
  static info(message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    // eslint-disable-next-line no-console
    console.log(`[${timestamp}] [INFO] ${message} ${contextStr}`.trim());
  }

  /**
   * Logs warning messages for potential issues.
   */
  static warn(message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    // eslint-disable-next-line no-console
    console.warn(`[${timestamp}] [WARN] ${message} ${contextStr}`.trim());
  }

  /**
   * Logs error messages for exceptional conditions.
   */
  static error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const errorStr = error ? ` - ${error.message}` : '';
    const contextStr = context ? JSON.stringify(context) : '';
    // eslint-disable-next-line no-console
    console.error(`[${timestamp}] [ERROR] ${message}${errorStr} ${contextStr}`.trim());
  }

  /**
   * Logs debug messages for development troubleshooting.
   */
  static debug(message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    // eslint-disable-next-line no-console
    console.debug(`[${timestamp}] [DEBUG] ${message} ${contextStr}`.trim());
  }
}
