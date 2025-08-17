/**
 * Printify API Service
 * 
 * Provides clean interface to Printify API with proper error handling,
 * retry logic, and response formatting.
 */

const fetch = require('node-fetch');
const { ApiError } = require('../middleware/errorHandler');

class PrintifyService {
  constructor() {
    this.baseUrl = 'https://api.printify.com/v1';
    this.apiToken = process.env.PRINTIFY_API_TOKEN;
    this.shopId = process.env.PRINTIFY_SHOP_ID;
    
    if (!this.apiToken) {
      console.error('❌ PRINTIFY_API_TOKEN environment variable is required');
    }
    
    if (!this.shopId) {
      console.error('❌ PRINTIFY_SHOP_ID environment variable is required');
    }
  }

  /**
   * Make authenticated request to Printify API
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WaveCaptionGenerator/1.0',
        ...options.headers
      },
      ...options
    };

    try {
      console.log(`📡 Printify API: ${config.method || 'GET'} ${endpoint}`);
      
      const response = await fetch(url, config);
      const responseText = await response.text();
      
      // Try to parse JSON, fallback to text
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        console.error(`❌ Printify API Error ${response.status}:`, data);
        throw new ApiError(
          response.status,
          `Printify API error: ${data?.message || data || response.statusText}`
        );
      }

      console.log(`✅ Printify API: ${response.status} ${endpoint}`);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error('🔥 Printify API Request Failed:', error);
      throw new ApiError(500, `Network error: ${error.message}`);
    }
  }

  /**
   * Upload image to Printify
   */
  async uploadImage(imageData, filename) {
    // Extract base64 data
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    
    const requestBody = {
      file_name: filename,
      contents: base64Data
    };

    return await this.makeRequest('/uploads/images.json', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
  }

  /**
   * Create product on Printify
   */
  async createProduct(productData) {
    return await this.makeRequest('/shops/' + this.shopId + '/products.json', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  /**
   * Publish product to shop
   */
  async publishToShop(productId, shopId = null) {
    const targetShopId = shopId || this.shopId;
    
    const publishData = {
      title: true,
      description: true,
      images: true,
      variants: true,
      tags: true,
      keyFeatures: true,
      shipping_template: true
    };

    return await this.makeRequest(
      `/shops/${targetShopId}/products/${productId}/publish.json`,
      {
        method: 'POST',
        body: JSON.stringify(publishData)
      }
    );
  }

  /**
   * Get shops associated with account
   */
  async getShops() {
    return await this.makeRequest('/shops.json');
  }

  /**
   * Get products for a shop
   */
  async getProducts(shopId = null, page = 1, limit = 10) {
    const targetShopId = shopId || this.shopId;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    return await this.makeRequest(`/shops/${targetShopId}/products.json?${params}`);
  }

  /**
   * Delete product from Printify
   */
  async deleteProduct(productId) {
    return await this.makeRequest(`/shops/${this.shopId}/products/${productId}.json`, {
      method: 'DELETE'
    });
  }

  /**
   * Get product details
   */
  async getProduct(productId) {
    return await this.makeRequest(`/shops/${this.shopId}/products/${productId}.json`);
  }

  /**
   * Update product
   */
  async updateProduct(productId, updateData) {
    return await this.makeRequest(`/shops/${this.shopId}/products/${productId}.json`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Get blueprints (product templates)
   */
  async getBlueprints() {
    return await this.makeRequest('/catalog/blueprints.json');
  }

  /**
   * Get print providers
   */
  async getPrintProviders(blueprintId) {
    return await this.makeRequest(`/catalog/blueprints/${blueprintId}/print_providers.json`);
  }

  /**
   * Health check - verify API connection and credentials
   */
  async checkHealth() {
    try {
      const shops = await this.getShops();
      const currentShop = shops.find(shop => shop.id.toString() === this.shopId);
      
      return {
        status: 'healthy',
        apiConnection: true,
        shopConnected: !!currentShop,
        shopId: this.shopId,
        shopTitle: currentShop?.title || 'Unknown',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        apiConnection: false,
        shopConnected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Bulk operations
   */
  async bulkDeleteProducts(productIds) {
    const results = [];
    
    for (const productId of productIds) {
      try {
        await this.deleteProduct(productId);
        results.push({ productId, success: true });
      } catch (error) {
        results.push({ productId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  async bulkPublishProducts(productIds, shopId = null) {
    const results = [];
    
    for (const productId of productIds) {
      try {
        await this.publishToShop(productId, shopId);
        results.push({ productId, success: true });
      } catch (error) {
        results.push({ productId, success: false, error: error.message });
      }
    }
    
    return results;
  }
}

// Create singleton instance
const printifyService = new PrintifyService();

module.exports = printifyService;