import { describe, it, expect } from 'vitest';
import { getErrorMessage, ApiError } from '../utils/errors';

describe('getErrorMessage', () => {
  it('should return correct message for 400 status', () => {
    expect(getErrorMessage(400)).toBe('Invalid input data. Please check your entries.');
  });

  it('should return correct message for 401 status', () => {
    expect(getErrorMessage(401)).toBe('Invalid credentials. Please try again.');
  });

  it('should return correct message for 403 status', () => {
    expect(getErrorMessage(403)).toBe('Access denied.');
  });

  it('should return correct message for 404 status', () => {
    expect(getErrorMessage(404)).toBe('Resource not found.');
  });

  it('should return correct message for 409 status', () => {
    expect(getErrorMessage(409)).toBe('Email is already registered.');
  });

  it('should return correct message for 500 status', () => {
    expect(getErrorMessage(500)).toBe('Server error. Please try again later.');
  });

  it('should return default message for unknown status', () => {
    expect(getErrorMessage(418)).toBe('An unexpected error occurred.');
  });
});

describe('ApiError', () => {
  it('should create an ApiError with status and message', () => {
    const error = new ApiError(404, 'Not found');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not found');
    expect(error.name).toBe('ApiError');
  });

  it('should be an instance of Error', () => {
    const error = new ApiError(500, 'Server error');
    expect(error).toBeInstanceOf(Error);
  });
});
