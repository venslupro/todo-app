import {Validator} from '../shared/validation/validator';

describe('Validator', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const result = Validator.validateEmail('test@example.com');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('test@example.com');
      }

      const result2 = Validator.validateEmail('user.name+tag@example.co.uk');
      expect(result2.isOk()).toBe(true);
      if (result2.isOk()) {
        expect(result2.value).toBe('user.name+tag@example.co.uk');
      }
    });

    it('should return error for invalid email addresses', () => {
      const result = Validator.validateEmail('invalid');
      expect(result.isErr()).toBe(true);

      const result2 = Validator.validateEmail('@example.com');
      expect(result2.isErr()).toBe(true);

      const result3 = Validator.validateEmail('test@');
      expect(result3.isErr()).toBe(true);
    });
  });

  describe('validateUUID', () => {
    it('should validate correct UUIDs', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const result = Validator.validateUUID(validUUID);
      expect(result.isOk()).toBe(true);
    });

    it('should return error for invalid UUIDs', () => {
      const result = Validator.validateUUID('invalid-uuid');
      expect(result.isErr()).toBe(true);

      const result2 = Validator.validateUUID('');
      expect(result2.isErr()).toBe(true);
    });
  });

  describe('sanitizeString', () => {
    it('should sanitize strings within length limits', () => {
      const result = Validator.sanitizeString('test', 10);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('test');
      }

      const result2 = Validator.sanitizeString('a', 1);
      expect(result2.isOk()).toBe(true);
      if (result2.isOk()) {
        expect(result2.value).toBe('a');
      }
    });

    it('should return error for strings outside length limits', () => {
      const result = Validator.sanitizeString('', 10);
      expect(result.isErr()).toBe(true);

      const result2 = Validator.sanitizeString('toolongstring', 5);
      expect(result2.isErr()).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = Validator.validatePassword('StrongPass123');
      expect(result.isOk()).toBe(true);
    });

    it('should return error for weak passwords', () => {
      const result = Validator.validatePassword('short');
      expect(result.isErr()).toBe(true);

      const result2 = Validator.validatePassword('nouppercase123');
      expect(result2.isErr()).toBe(true);

      const result3 = Validator.validatePassword('NOLOWERCASE123');
      expect(result3.isErr()).toBe(true);

      const result4 = Validator.validatePassword('NoNumbers');
      expect(result4.isErr()).toBe(true);
    });
  });

  describe('validateDate', () => {
    it('should validate correct date formats', () => {
      const result = Validator.validateDate('2023-01-01');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeInstanceOf(Date);
        expect(result.value.getFullYear()).toBe(2023);
      }
    });

    it('should return error for invalid date formats', () => {
      const result = Validator.validateDate('invalid-date');
      expect(result.isErr()).toBe(true);
    });
  });

  describe('validatePagination', () => {
    it('should validate pagination parameters', () => {
      const result = Validator.validatePagination(10, 20);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.limit).toBe(10);
        expect(result.value.offset).toBe(20);
      }
    });

    it('should use default values', () => {
      const result = Validator.validatePagination();
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.limit).toBe(50);
        expect(result.value.offset).toBe(0);
      }
    });

    it('should clamp values to valid ranges', () => {
      const result = Validator.validatePagination(-5, -10);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.limit).toBe(1);
        expect(result.value.offset).toBe(0);
      }
    });
  });
});
