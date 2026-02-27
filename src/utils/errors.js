class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Invalid credentials') {
    super(message, 401, 'AUTH_FAILED');
  }
}

class DuplicateError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'DUPLICATE_ENTRY');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  DuplicateError,
  NotFoundError
};
