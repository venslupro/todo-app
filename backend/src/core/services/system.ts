// src/services/system.ts
// System service for handling system-related operations

interface SystemServiceOptions {
  environment: string;
  appName: string;
  appVersion: string;
}

export class SystemService {
  private readonly environment: string;
  private readonly appName: string;
  private readonly appVersion: string;

  constructor(options: SystemServiceOptions) {
    this.environment = options.environment;
    this.appName = options.appName;
    this.appVersion = options.appVersion;
  }

  /**
   * Get health check status
   */
  async getHealthStatus(): Promise<{
    status: string;
    timestamp: string;
    environment: string;
  }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: this.environment,
    };
  }

  /**
   * Get application version information
   */
  async getVersionInfo(): Promise<{
    name: string;
    version: string;
    environment: string;
  }> {
    return {
      name: this.appName,
      version: this.appVersion,
      environment: this.environment,
    };
  }
}

export const createSystemService = (options: SystemServiceOptions): SystemService => {
  return new SystemService(options);
};
