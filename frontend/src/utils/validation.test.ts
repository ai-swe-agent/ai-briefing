import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateUsername } from './validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('TC-13: validates correct email formats', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
      expect(validateEmail('123@example.com')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('not-an-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('TC-14: validates strong passwords', () => {
      const result = validatePassword('SecurePass1!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('rejects passwords without uppercase', () => {
      const result = validatePassword('lowercase123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('rejects passwords without number', () => {
      const result = validatePassword('NoNumbersHere');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });
  });

  describe('validateUsername', () => {
    it('TC-15: validates username format', () => {
      expect(validateUsername('validuser')).toBe(true);
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('user_name')).toBe(true);
      expect(validateUsername('ab')).toBe(false);
      expect(validateUsername('')).toBe(false);
    });
  });
});
