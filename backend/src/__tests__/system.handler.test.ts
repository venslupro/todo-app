import { Context } from 'hono';
import { SystemHandler } from '../api/handlers/system.handler';

describe('SystemHandler', () => {
  let systemHandler: SystemHandler;

  beforeEach(() => {
    systemHandler = new SystemHandler();
  });

  const createMockContext = (env: Record<string, string> = {}) => {
    const mockJson = jest.fn().mockReturnValue(new Response());

    return {
      json: mockJson,
      env,
    } as unknown as Context;
  };

  describe('healthCheck', () => {
    it('should return healthy status when SUPABASE_URL is present', async () => {
      const mockContext = createMockContext({
        ENVIRONMENT: 'test',
        SUPABASE_URL: 'https://test.supabase.co',
      });

      const result = await systemHandler.healthCheck(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        status: 'healthy',
        timestamp: expect.any(String),
        environment: 'test',
      }, 200);
      expect(result).toBeInstanceOf(Response);
    });

    it('should return unhealthy status when SUPABASE_URL is missing', async () => {
      const mockContext = createMockContext({ ENVIRONMENT: 'test' });

      const result = await systemHandler.healthCheck(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        status: 'unhealthy',
        timestamp: expect.any(String),
        environment: 'test',
      }, 200);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('versionInfo', () => {
    it('should return version information', async () => {
      const mockContext = createMockContext({ ENVIRONMENT: 'test' });

      const result = await systemHandler.versionInfo(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        name: 'TODO API',
        version: '1.0.0',
        environment: 'test',
      }, 200);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('root', () => {
    it('should return root endpoint information', async () => {
      const mockContext = createMockContext({ ENVIRONMENT: 'test' });

      const result = await systemHandler.root(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        name: 'TODO API',
        version: '1.0.0',
        environment: 'test',
        timestamp: expect.any(String),
      }, 200);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('getEnvironment', () => {
    it('should return environment from context', () => {
      const mockContext = createMockContext({ ENVIRONMENT: 'test' });
      const result = (systemHandler as any).getEnvironment(mockContext);
      expect(result).toBe('test');
    });

    it('should return default environment when not set', () => {
      const mockContext = createMockContext({});
      const result = (systemHandler as any).getEnvironment(mockContext);
      expect(result).toBe('development');
    });
  });
});
