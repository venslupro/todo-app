// src/api/handlers/system.ts
// System API handlers for health check and version info

import {Context} from 'hono';
import {SystemService} from '../../core/services/system';

interface SystemHandlerOptions {
  systemService: SystemService;
}

export class SystemHandler {
  private readonly systemService: SystemService;

  constructor(options: SystemHandlerOptions) {
    this.systemService = options.systemService;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(c: Context) {
    const result = await this.systemService.getHealthStatus();
    return c.json({
      code: 200,
      message: 'Success',
      data: result,
    });
  }

  /**
   * Version information endpoint
   */
  async version(c: Context) {
    const result = await this.systemService.getVersionInfo();
    return c.json({
      code: 200,
      message: 'Success',
      data: result,
    });
  }
}

export const createSystemHandler = (options: SystemHandlerOptions): SystemHandler => {
  return new SystemHandler(options);
};
