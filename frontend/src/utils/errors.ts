const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid input data. Please check your entries.',
  401: 'Invalid credentials. Please try again.',
  403: 'Access denied.',
  404: 'Resource not found.',
  409: 'Email is already registered.',
  500: 'Server error. Please try again later.',
};

export function getErrorMessage(status: number): string {
  return ERROR_MESSAGES[status] || 'An unexpected error occurred.';
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
