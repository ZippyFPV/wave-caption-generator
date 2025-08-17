/**
 * Printify API Routes
 * 
 * Defines all endpoints for Printify integration with proper
 * validation, error handling, and documentation.
 */

const express = require('express');
const router = express.Router();

// Middleware
const { asyncHandler: _asyncHandler } = require('../middleware/errorHandler');
const {
  validateImageUpload,
  validateProductCreation,
  validateShopPublish,
  validateRequiredFields: _validateRequiredFields,
  sanitizeStrings,
  validateRateLimit
} = require('../middleware/validation');

// Controllers
const printifyController = require('../controllers/printifyController');

// Apply rate limiting to all Printify routes
router.use(validateRateLimit(50, 15 * 60 * 1000)); // 50 requests per 15 minutes
router.use(sanitizeStrings);

/**
 * @route   POST /api/printify/upload-image-base64
 * @desc    Upload base64 image to Printify
 * @access  Private
 * @body    { imageData: string, filename: string }
 */
router.post(
  '/upload-image-base64',
  validateImageUpload,
  printifyController.uploadImage
);

/**
 * @route   POST /api/printify/create-product
 * @desc    Create new product on Printify
 * @access  Private
 * @body    { title, description, blueprint_id, print_provider_id, variants, print_areas, tags }
 */
router.post(
  '/create-product',
  validateProductCreation,
  printifyController.createProduct
);

/**
 * @route   POST /api/printify/publish-to-shop
 * @desc    Publish product to Printify shop
 * @access  Private
 * @body    { productId: string, shopId?: string }
 */
router.post(
  '/publish-to-shop',
  validateShopPublish,
  printifyController.publishToShop
);

/**
 * @route   GET /api/printify/shops
 * @desc    Get all shops associated with account
 * @access  Private
 */
router.get('/shops', printifyController.getShops);

/**
 * @route   GET /api/printify/products/:shopId?
 * @desc    Get products for a shop
 * @access  Private
 * @query   { page?: number, limit?: number }
 */
router.get('/products/:shopId?', printifyController.getProducts);

/**
 * @route   DELETE /api/printify/products/:productId
 * @desc    Delete product from Printify
 * @access  Private
 */
router.delete('/products/:productId', printifyController.deleteProduct);

/**
 * @route   GET /api/printify/health
 * @desc    Health check for Printify API connection
 * @access  Public
 */
router.get('/health', printifyController.healthCheck);

module.exports = router;