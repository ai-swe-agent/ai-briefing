const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const response = {
    success: false,
    error: {
      message: err.isOperational ? err.message : 'Internal server error',
      code: err.code || 'INTERNAL_ERROR'
    }
  };

  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
    response.error.details = err.details;
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid token', code: 'INVALID_TOKEN' }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { message: 'Token expired', code: 'TOKEN_EXPIRED' }
    });
  }

  if (err.name === 'ValidationError' && err.errors) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: Object.values(err.errors).map(e => e.message)
      }
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: {
        message: `${field} already exists`,
        code: 'DUPLICATE_ENTRY'
      }
    });
  }

  res.status(err.statusCode).json(response);
};

module.exports = errorHandler;
