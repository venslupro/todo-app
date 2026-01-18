import { Context } from 'hono';
import { BaseHandler } from '../api/handlers/base.handler';

// Create a concrete implementation for testing
class TestHandler extends BaseHandler {
  public testSuccess(c: Context, data: unknown) {
    return this.success(c, data);
  }

  public testCreated(c: Context, data: unknown) {
    return this.created(c, data);
  }

  public testNotFound(c: Context, message: string) {
    return this.notFound(c, message);
  }

  public testBadRequest(c: Context, message: string) {
    return this.badRequest(c, message);
  }

  public testUnauthorized(c: Context, message: string) {
    return this.unauthorized(c, message);
  }
}

describe('BaseHandler', () => {
  let testHandler: TestHandler;

  beforeEach(() => {
    testHandler = new TestHandler();
  });

  const createMockContext = () => {
    const mockJson = jest.fn().mockReturnValue(new Response());

    return {
      json: mockJson,
    } as unknown as Context;
  };

  describe('success', () => {
    it('should return success response with data', () => {
      const mockContext = createMockContext();
      const testData = { message: 'test' };

      const result = testHandler.testSuccess(mockContext, testData);

      expect(mockContext.json).toHaveBeenCalledWith(testData, 200);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('created', () => {
    it('should return created response with data', () => {
      const mockContext = createMockContext();
      const testData = { id: '123', name: 'test' };

      const result = testHandler.testCreated(mockContext, testData);

      expect(mockContext.json).toHaveBeenCalledWith(testData, 201);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('notFound', () => {
    it('should return not found response', () => {
      const mockContext = createMockContext();
      const message = 'Resource not found';

      const result = testHandler.testNotFound(mockContext, message);

      expect(mockContext.json).toHaveBeenCalledWith({ error: message }, 404);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('badRequest', () => {
    it('should return bad request response', () => {
      const mockContext = createMockContext();
      const message = 'Invalid request';

      const result = testHandler.testBadRequest(mockContext, message);

      expect(mockContext.json).toHaveBeenCalledWith({ error: message }, 400);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('unauthorized', () => {
    it('should return unauthorized response', () => {
      const mockContext = createMockContext();
      const message = 'Unauthorized';

      const result = testHandler.testUnauthorized(mockContext, message);

      expect(mockContext.json).toHaveBeenCalledWith({ error: message }, 401);
      expect(result).toBeInstanceOf(Response);
    });
  });
});
