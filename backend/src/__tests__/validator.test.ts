import {Validator} from '../shared/validation/validator';

describe('Validator', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(Validator.validateEmail('test@example.com')).toBe('test@example.com');
      expect(Validator.validateEmail('user.name+tag@example.co.uk'))
        .toBe('user.name+tag@example.co.uk');
    });

    it('should throw error for invalid email addresses', () => {
      expect(() => Validator.validateEmail('invalid')).toThrow();
      expect(() => Validator.validateEmail('@example.com')).toThrow();
      expect(() => Validator.validateEmail('test@')).toThrow();
    });
  });

  describe('validateUUID', () => {
    it('should validate correct UUIDs', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      expect(() => Validator.validateUUID(validUUID)).not.toThrow();
    });

    it('should throw error for invalid UUIDs', () => {
      expect(() => Validator.validateUUID('invalid-uuid')).toThrow();
      expect(() => Validator.validateUUID('')).toThrow();
    });
  });

  describe('sanitizeString', () => {
    it('should sanitize strings within length limits', () => {
      expect(Validator.sanitizeString('test', 10)).toBe('test');
      expect(Validator.sanitizeString('a', 1)).toBe('a');
    });

    it('should throw error for strings outside length limits', () => {
      expect(() => Validator.sanitizeString('', 10)).toThrow();
      expect(() => Validator.sanitizeString('toolongstring', 5)).toThrow();
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(() => Validator.validatePassword('StrongPass123')).not.toThrow();
    });

    it('should throw error for weak passwords', () => {
      expect(() => Validator.validatePassword('short')).toThrow();
      expect(() => Validator.validatePassword('nouppercase123')).toThrow();
      expect(() => Validator.validatePassword('NOLOWERCASE123')).toThrow();
      expect(() => Validator.validatePassword('NoNumbers')).toThrow();
    });
  });

  describe('validateDate', () => {
    it('should validate correct date formats', () => {
      const date = Validator.validateDate('2023-01-01');
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2023);
    });

    it('should throw error for invalid date formats', () => {
      expect(() => Validator.validateDate('invalid-date')).toThrow();
    });
  });

  describe('validatePagination', () => {
    it('should validate pagination parameters', () => {
      const result = Validator.validatePagination(10, 20);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(20);
    });

    it('should use default values', () => {
      const result = Validator.validatePagination();
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('should clamp values to valid ranges', () => {
      const result = Validator.validatePagination(-5, -10);
      expect(result.limit).toBe(1);
      expect(result.offset).toBe(0);
    });
  });
});
