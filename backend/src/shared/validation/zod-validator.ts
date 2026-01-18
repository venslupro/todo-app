import {z, ZodError} from 'zod';
import {BadRequestException} from '../errors/http-exception';

/**
 * Zod validation utility class for consistent error handling.
 */
export class ZodValidator {
  /**
   * Validates data against a Zod schema and returns the validated data.
   * Throws a BadRequestException if validation fails.
   */
  public static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        const errorMessage = `Validation failed: ${errorDetails
          .map((d) => `${d.field}: ${d.message}`)
          .join(', ')}`;
        throw new BadRequestException(errorMessage);
      }

      throw new BadRequestException('Invalid request data');
    }
  }

  /**
   * Safely validates data against a Zod schema.
   * Returns a Result object instead of throwing.
   */
  public static safeValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
  ): {success: true; data: T} | {success: false; error: ZodError} {
    const result = schema.safeParse(data);

    if (result.success) {
      return {success: true, data: result.data};
    }

    return {success: false, error: result.error};
  }

  /**
   * Validates query parameters against a Zod schema.
   */
  public static validateQuery<T>(
    schema: z.ZodSchema<T>,
    query: Record<string, unknown>,
  ): T {
    // Convert string values to appropriate types
    const processedQuery: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        // Try to parse numbers
        if (!isNaN(Number(value)) && value.trim() !== '') {
          processedQuery[key] = Number(value);
        }
        // Try to parse booleans
        else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
          processedQuery[key] = value.toLowerCase() === 'true';
        }
        // Handle comma-separated arrays (e.g., tags)
        else if (key === 'tags' && value.includes(',')) {
          processedQuery[key] = value
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag !== '');
        } else {
          processedQuery[key] = value;
        }
      } else {
        processedQuery[key] = value;
      }
    }

    return this.validate(schema, processedQuery);
  }

  /**
   * Validates path parameters against a Zod schema.
   */
  public static validateParams<T>(schema: z.ZodSchema<T>, params: Record<string, string>): T {
    return this.validate(schema, params);
  }

  /**
   * Validates headers against a Zod schema.
   */
  public static validateHeaders<T>(schema: z.ZodSchema<T>, headers: Record<string, string>): T {
    // Convert headers to lowercase for consistent validation
    const lowerCaseHeaders: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      lowerCaseHeaders[key.toLowerCase()] = value;
    }

    return this.validate(schema, lowerCaseHeaders);
  }
}
