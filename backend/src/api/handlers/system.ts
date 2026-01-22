// src/api/handlers/system.ts
// System API handlers for health check and version info


import {SystemService} from '../../core/services/system';
import {SuccessResponse} from '../../shared/errors/http-exception';

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
  async healthCheck() {
    const result = await this.systemService.getHealthStatus();
    const success = new SuccessResponse(result);
    return success.getResponse();
  }

  /**
   * Version information endpoint
   */
  async version() {
    const result = await this.systemService.getVersionInfo();
    const success = new SuccessResponse(result);
    return success.getResponse();
  }
}

export const createSystemHandler = (options: SystemHandlerOptions): SystemHandler => {
  return new SystemHandler(options);
};
