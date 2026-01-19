const { ERROR_CODES } = require('../config/constants');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let errorCode = ERROR_CODES.SERVER_ERROR;
  let message = err.message || 'Server Error';
  let details = [];

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation failed';
    details = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Duplicate field value entered';
    details = [{ field: Object.keys(err.keyPattern)[0], message: 'This value already exists' }];
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = ERROR_CODES.UNAUTHORIZED;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = ERROR_CODES.UNAUTHORIZED;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;