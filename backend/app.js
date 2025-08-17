/**
 * Express Application Setup
 * 
 * Modern Express.js application with proper middleware, routing,
 * error handling, and security features.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Routes
const printifyRoutes = require('./routes/printifyRoutes');

// Create Express application
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Compression
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001',
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '50mb' })); // Large limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Request ID middleware
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/printify', printifyRoutes);

// Legacy compatibility routes (for existing frontend)
app.post('/api/printify/upload-image-base64', printifyRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Wave Caption Generator API',
    version: '1.0.0',
    description: 'Backend API for the Wave Caption Generator application',
    endpoints: {
      printify: {
        'POST /api/printify/upload-image-base64': 'Upload base64 image to Printify',
        'POST /api/printify/create-product': 'Create new product on Printify',
        'POST /api/printify/publish-to-shop': 'Publish product to shop',
        'GET /api/printify/shops': 'Get all shops',
        'GET /api/printify/products/:shopId?': 'Get products for shop',
        'DELETE /api/printify/products/:productId': 'Delete product',
        'GET /api/printify/health': 'Printify API health check'
      },
      system: {
        'GET /health': 'Application health check',
        'GET /api/docs': 'API documentation'
      }
    }
  });
});

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;