/**
 * Request Validation Middleware
 * 
 * Provides validation for API requests to ensure data integrity
 * and security across all endpoints.
 */

const { createValidationError } = require('./errorHandler');

/**
 * Validate required fields in request body
 */
const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter(field => {
      return !req.body || req.body[field] === undefined || req.body[field] === null;
    });
    
    if (missing.length > 0) {
      throw createValidationError(`Missing required fields: ${missing.join(', ')}`);
    }
    
    next();
  };
};

/**
 * Validate image upload data
 */
const validateImageUpload = (req, res, next) => {
  const { imageData, filename } = req.body;
  
  if (!imageData) {
    throw createValidationError('imageData is required');
  }
  
  if (!filename) {
    throw createValidationError('filename is required');
  }
  
  // Validate base64 image data format
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  if (!base64Regex.test(imageData)) {
    throw createValidationError('Invalid image data format. Must be base64 encoded image.');
  }
  
  // Check file size (limit to 10MB)
  const base64Data = imageData.split(',')[1];
  const sizeInBytes = (base64Data.length * 3) / 4;
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (sizeInBytes > maxSize) {
    throw createValidationError('Image too large. Maximum size is 10MB.');
  }
  
  next();
};

/**
 * Validate product creation data
 */
const validateProductCreation = (req, res, next) => {
  const { title, description, blueprint_id, print_provider_id } = req.body;
  
  if (!title || title.trim().length < 3) {
    throw createValidationError('Title must be at least 3 characters long');
  }
  
  if (!description || description.trim().length < 10) {
    throw createValidationError('Description must be at least 10 characters long');
  }
  
  if (!blueprint_id || typeof blueprint_id !== 'number') {
    throw createValidationError('Valid blueprint_id is required');
  }
  
  if (!print_provider_id || typeof print_provider_id !== 'number') {
    throw createValidationError('Valid print_provider_id is required');
  }
  
  // Sanitize title and description
  req.body.title = title.trim();
  req.body.description = description.trim();
  
  next();
};

/**
 * Validate shop publishing data
 */
const validateShopPublish = (req, res, next) => {
  const { productId, shopId } = req.body;
  
  if (!productId) {
    throw createValidationError('productId is required');
  }
  
  if (!shopId) {
    throw createValidationError('shopId is required');
  }
  
  // Validate IDs are numeric
  if (!/^\d+$/.test(productId.toString())) {
    throw createValidationError('productId must be a valid number');
  }
  
  if (!/^\d+$/.test(shopId.toString())) {
    throw createValidationError('shopId must be a valid number');
  }
  
  next();
};

/**
 * Sanitize and validate string inputs
 */
const sanitizeStrings = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    }
    return value;
  };
  
  // Recursively sanitize request body
  const sanitizeObject = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          obj[key] = typeof obj[key] === 'object' ? sanitizeObject(obj[key]) : sanitizeValue(obj[key]);
        }
      }
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

/**
 * Rate limiting validation
 */
const validateRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this client
    const clientRequests = requests.get(clientId) || [];
    
    // Filter out old requests
    const recentRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          statusCode: 429,
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(windowMs / 1000),
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(clientId, recentRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      for (const [id, timestamps] of requests.entries()) {
        const filtered = timestamps.filter(timestamp => timestamp > windowStart);
        if (filtered.length === 0) {
          requests.delete(id);
        } else {
          requests.set(id, filtered);
        }
      }
    }
    
    next();
  };
};

module.exports = {
  validateRequiredFields,
  validateImageUpload,
  validateProductCreation,
  validateShopPublish,
  sanitizeStrings,
  validateRateLimit
};