import { Context } from 'hono';
import { SystemHandler } from '../api/handlers/system.handler';
import { ApiResponseBuilder } from '../shared/types/api.response';

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
    it('should return healthy status when supabase_url is present', async () => {
      const mockContext = createMockContext({
        environment: 'test',
        supabase_url: 'https://test.supabase.co',
      });

      const result = await systemHandler.healthCheck(mockContext);

      const expectedData = {
        status: 'healthy',
        timestamp: expect.any(String),
        environment: 'test',
      };
      const expectedResponse = ApiResponseBuilder.success(expectedData, 'Health check completed');

      expect(mockContext.json).toHaveBeenCalledWith(expectedResponse, 200);
      expect(result).toBeInstanceOf(Response);
    });

    it('should return unhealthy status when supabase_url is missing', async () => {
      const mockContext = createMockContext({ environment: 'test' });

      const result = await systemHandler.healthCheck(mockContext);

      const expectedData = {
        status: 'unhealthy',
        timestamp: expect.any(String),
        environment: 'test',
      };
      const expectedResponse = ApiResponseBuilder.success(expectedData, 'Health check completed');

      expect(mockContext.json).toHaveBeenCalledWith(expectedResponse, 200);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('versionInfo', () => {
    it('should return version information', async () => {
      const mockContext = createMockContext({ environment: 'test' });

      const result = await systemHandler.versionInfo(mockContext);

      const expectedData = {
        name: 'TODO API',
        version: '1.0.0',
        environment: 'test',
      };
      const expectedResponse = ApiResponseBuilder.success(expectedData, 'Version information retrieved');

      expect(mockContext.json).toHaveBeenCalledWith(expectedResponse, 200);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('root', () => {
    it('should return root endpoint information', async () => {
      const mockContext = createMockContext({ environment: 'test' });

      const result = await systemHandler.root(mockContext);

      const expectedData = {
        name: 'TODO API',
        version: '1.0.0',
        environment: 'test',
        timestamp: expect.any(String),
      };
      const expectedResponse = ApiResponseBuilder.success(expectedData, 'API is running');

      expect(mockContext.json).toHaveBeenCalledWith(expectedResponse, 200);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('getEnvironment', () => {
    it('should return environment from context', () => {
      const mockContext = createMockContext({ environment: 'test' });
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
