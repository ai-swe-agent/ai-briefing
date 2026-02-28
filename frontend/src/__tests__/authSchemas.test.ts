import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../schemas/authSchemas';

describe('loginSchema', () => {
  it('should validate valid login data', () => {
    const validData = { email: 'test@example.com', password: 'password123' };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email format', () => {
    const invalidData = { email: 'invalid-email', password: 'password123' };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject password shorter than 8 characters', () => {
    const invalidData = { email: 'test@example.com', password: 'short' };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty email', () => {
    const invalidData = { email: '', password: 'password123' };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const invalidData = { email: 'test@example.com', password: '' };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('should validate valid registration data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject mismatched passwords', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different',
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email in registration', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'password123',
      confirmPassword: 'password123',
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject short password in registration', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'short',
      confirmPassword: 'short',
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
