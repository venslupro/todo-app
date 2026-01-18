import { Context } from 'hono';
import { BaseHandler } from '../api/handlers/base.handler';
import { ApiResponseBuilder } from '../shared/types/api.response';

// Create a concrete implementation for testing
class TestHandler extends BaseHandler {
  public testSuccess(c: Context, data: unknown) {
    return this.success(c, data);
  }

  public testSuccessWithMessage(c: Context, data: unknown, message: string) {
    return this.success(c, data, message);
  }

  public testCreated(c: Context, data: unknown) {
    return this.created(c, data);
  }

  public testCreatedWithMessage(c: Context, data: unknown, message: string) {
    return this.created(c, data, message);
  }

  public testNoContent(c: Context) {
    return this.noContent(c);
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
      const expectedResponse = ApiResponseBuilder.success(testData);

      const result = testHandler.testSuccess(mockContext, testData);

      expect(mockContext.json).toHaveBeenCalledWith(expectedResponse, 200);
      expect(result).toBeInstanceOf(Response);
    });

    it('should return success response with custom message', () => {
      const mockContext = createMockContext();
      const testData = { message: 'test' };
      const customMessage = 'Custom success message';
      const expectedResponse = ApiResponseBuilder.success(testData, customMessage);

      const result = testHandler.testSuccessWithMessage(mockContext, testData, customMessage);

      expect(mockContext.json).toHaveBeenCalledWith(expectedResponse, 200);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('created', () => {
    it('should return created response with data', () => {
      const mockContext = createMockContext();
      const testData = { id: '123', name: 'test' };
      const expectedResponse = ApiResponseBuilder.created(testData);

      const result = testHandler.testCreated(mockContext, testData);

      expect(mockContext.json).toHaveBeenCalledWith(expectedResponse, 201);
      expect(result).toBeInstanceOf(Response);
    });

    it('should return created response with custom message', () => {
      const mockContext = createMockContext();
      const testData = { id: '123', name: 'test' };
      const customMessage = 'Custom created message';
      const expectedResponse = ApiResponseBuilder.created(testData, customMessage);

      const result = testHandler.testCreatedWithMessage(mockContext, testData, customMessage);

      expect(mockContext.json).toHaveBeenCalledWith(expectedResponse, 201);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('noContent', () => {
    it('should return no content response', () => {
      const mockContext = createMockContext();
      const expectedResponse = ApiResponseBuilder.noContent();

      const result = testHandler.testNoContent(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith(expectedResponse, 204);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('error methods', () => {
    it('should throw AppException for not found', () => {
      const mockContext = createMockContext();
      const message = 'Resource not found';

      expect(() => {
        testHandler.testNotFound(mockContext, message);
      }).toThrow('Resource not found');
    });

    it('should throw AppException for bad request', () => {
      const mockContext = createMockContext();
      const message = 'Invalid request';

      expect(() => {
        testHandler.testBadRequest(mockContext, message);
      }).toThrow('Invalid request');
    });

    it('should throw AppException for unauthorized', () => {
      const mockContext = createMockContext();
      const message = 'Unauthorized';

      expect(() => {
        testHandler.testUnauthorized(mockContext, message);
      }).toThrow('Unauthorized');
    });
  });
});
