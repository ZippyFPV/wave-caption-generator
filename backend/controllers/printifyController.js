/**
 * Printify API Controller
 * 
 * Handles all Printify-related operations including image uploads,
 * product creation, and shop publishing.
 */

const { asyncHandler, sendSuccess, sendError, ApiError } = require('../middleware/errorHandler');
const printifyService = require('../services/printifyService');

/**
 * Upload image to Printify
 */
const uploadImage = asyncHandler(async (req, res) => {
  const { imageData, filename } = req.body;
  
  try {
    const result = await printifyService.uploadImage(imageData, filename);
    
    sendSuccess(res, result, 'Image uploaded successfully');
  } catch (error) {
    console.error('Image upload failed:', error);
    
    if (error.message.includes('401')) {
      throw new ApiError(401, 'Printify authentication failed. Check API token.');
    } else if (error.message.includes('413')) {
      throw new ApiError(413, 'Image too large for Printify API.');
    } else if (error.message.includes('415')) {
      throw new ApiError(415, 'Unsupported image format.');
    } else {
      throw new ApiError(500, `Image upload failed: ${error.message}`);
    }
  }
});

/**
 * Create product on Printify
 */
const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  
  try {
    const result = await printifyService.createProduct(productData);
    
    sendSuccess(res, result, 'Product created successfully', 201);
  } catch (error) {
    console.error('Product creation failed:', error);
    
    if (error.message.includes('400')) {
      throw new ApiError(400, 'Invalid product data. Check required fields and formats.');
    } else if (error.message.includes('401')) {
      throw new ApiError(401, 'Printify authentication failed. Check API token.');
    } else if (error.message.includes('422')) {
      throw new ApiError(422, 'Product validation failed. Check blueprint and variant IDs.');
    } else {
      throw new ApiError(500, `Product creation failed: ${error.message}`);
    }
  }
});

/**
 * Publish product to shop
 */
const publishToShop = asyncHandler(async (req, res) => {
  const { productId, shopId } = req.body;
  
  try {
    const result = await printifyService.publishToShop(productId, shopId);
    
    sendSuccess(res, result, 'Product published successfully');
  } catch (error) {
    console.error('Product publishing failed:', error);
    
    if (error.message.includes('404')) {
      throw new ApiError(404, 'Product or shop not found.');
    } else if (error.message.includes('401')) {
      throw new ApiError(401, 'Printify authentication failed. Check API token.');
    } else if (error.message.includes('409')) {
      throw new ApiError(409, 'Product already published to this shop.');
    } else {
      throw new ApiError(500, `Product publishing failed: ${error.message}`);
    }
  }
});

/**
 * Get shop information
 */
const getShops = asyncHandler(async (req, res) => {
  try {
    const shops = await printifyService.getShops();
    
    sendSuccess(res, shops, 'Shops retrieved successfully');
  } catch (error) {
    console.error('Failed to retrieve shops:', error);
    
    if (error.message.includes('401')) {
      throw new ApiError(401, 'Printify authentication failed. Check API token.');
    } else {
      throw new ApiError(500, `Failed to retrieve shops: ${error.message}`);
    }
  }
});

/**
 * Get products for a shop
 */
const getProducts = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  try {
    const products = await printifyService.getProducts(shopId, page, limit);
    
    sendSuccess(res, products, 'Products retrieved successfully');
  } catch (error) {
    console.error('Failed to retrieve products:', error);
    
    if (error.message.includes('404')) {
      throw new ApiError(404, 'Shop not found.');
    } else if (error.message.includes('401')) {
      throw new ApiError(401, 'Printify authentication failed. Check API token.');
    } else {
      throw new ApiError(500, `Failed to retrieve products: ${error.message}`);
    }
  }
});

/**
 * Delete product from Printify
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  try {
    await printifyService.deleteProduct(productId);
    
    sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    console.error('Product deletion failed:', error);
    
    if (error.message.includes('404')) {
      throw new ApiError(404, 'Product not found.');
    } else if (error.message.includes('401')) {
      throw new ApiError(401, 'Printify authentication failed. Check API token.');
    } else if (error.message.includes('409')) {
      throw new ApiError(409, 'Cannot delete published product.');
    } else {
      throw new ApiError(500, `Product deletion failed: ${error.message}`);
    }
  }
});

/**
 * Health check for Printify API connection
 */
const healthCheck = asyncHandler(async (req, res) => {
  try {
    const health = await printifyService.checkHealth();
    
    sendSuccess(res, health, 'Printify API health check completed');
  } catch (error) {
    console.error('Health check failed:', error);
    
    sendError(res, 'Printify API health check failed', 503, error.message);
  }
});

module.exports = {
  uploadImage,
  createProduct,
  publishToShop,
  getShops,
  getProducts,
  deleteProduct,
  healthCheck
};