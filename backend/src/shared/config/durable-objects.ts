// shared/config/durable-objects.ts
/**
 * Durable Objects configuration
 * This file is used to configure Durable Objects without directly modifying wrangler.toml
 */

export interface DurableObjectsConfig {
  todoWebSocket: {
    className: string;
    scriptName?: string;
  };
}

/**
 * Default Durable Objects configuration
 * In actual deployment, these configurations should be set via wrangler.toml
 * or environment variables
 */
export const defaultDurableObjectsConfig: DurableObjectsConfig = {
  todoWebSocket: {
    className: 'TodoWebSocketDurableObject',
    scriptName: 'todo-app-backend',
  },
};

/**
 * Get Durable Objects configuration
 * Prioritize environment variables, use default configuration if not available
 */
export function getDurableObjectsConfig(): DurableObjectsConfig {
  // Configuration can be read from environment variables, use default values if not available
  return defaultDurableObjectsConfig;
}
