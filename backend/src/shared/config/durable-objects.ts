// shared/config/durable-objects.ts
/**
 * Durable Objects配置
 * 这个文件用于配置Durable Objects，而不需要直接修改wrangler.toml
 */

export interface DurableObjectsConfig {
  todoWebSocket: {
    className: string;
    scriptName?: string;
  };
}

/**
 * 默认的Durable Objects配置
 * 在实际部署时，这些配置应该通过wrangler.toml或环境变量设置
 */
export const defaultDurableObjectsConfig: DurableObjectsConfig = {
  todoWebSocket: {
    className: 'TodoWebSocketDurableObject',
    scriptName: 'todo-app-backend',
  },
};

/**
 * 获取Durable Objects配置
 * 优先使用环境变量，如果没有则使用默认配置
 */
export function getDurableObjectsConfig(): DurableObjectsConfig {
  // 这里可以从环境变量读取配置，如果没有则使用默认值
  return defaultDurableObjectsConfig;
}
