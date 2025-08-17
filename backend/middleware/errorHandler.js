/**
 * Centralized Error Handling Middleware
 * 
 * This middleware provides consistent error handling across all API endpoints,
 * with proper logging, user-friendly messages, and security considerations.
 */

/**
 * Custom Error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error logger utility
 */
const logError = (error, req) => {
  const timestamp = new Date().toISOString();
  const method = req?.method || 'UNKNOWN';
  const url = req?.url || 'UNKNOWN';
  const userAgent = req?.headers?.['user-agent'] || 'UNKNOWN';
  
  console.error(`[${timestamp}] ERROR:`, {
    message: error.message,
    statusCode: error.statusCode || 500,
    method,
    url,
    userAgent,
    stack: error.stack
  });
};

/**
 * Determine if error details should be sent to client
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Main error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  // Log the error
  logError(error, req);
  
  let { statusCode = 500, message } = error;
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Invalid input data';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
  } else if (error.code === 'ENOTFOUND') {
    statusCode = 503;
    message = 'External service unavailable';
  } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
    statusCode = 503;
    message = 'External API connection failed';
  }
  
  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      statusCode,
      message: isProduction && statusCode === 500 ? 'Internal server error' : message,
      timestamp: new Date().toISOString()
    }
  };
  
  // Include stack trace in development
  if (!isProduction && error.stack) {
    errorResponse.error.stack = error.stack;
  }
  
  // Include request ID if available
  if (req.id) {
    errorResponse.error.requestId = req.id;
  }
  
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  const error = new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`);
  logError(error, req);
  
  res.status(404).json({
    success: false,
    error: {
      statusCode: 404,
      message: 'Endpoint not found',
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Async error wrapper for route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation error helper
 */
const createValidationError = (message) => {
  return new ApiError(400, message);
};

/**
 * API response helpers
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res, message, statusCode = 500, details = null) => {
  const errorResponse = {
    success: false,
    error: {
      statusCode,
      message,
      timestamp: new Date().toISOString()
    }
  };
  
  if (details && !isProduction) {
    errorResponse.error.details = details;
  }
  
  res.status(statusCode).json(errorResponse);
};

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createValidationError,
  sendSuccess,
  sendError,
  logError
};