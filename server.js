#!/usr/bin/env node

/**
 * Wave Caption Generator - Printify API Backend Server
 * 
 * This server handles real Printify API calls that can't be made directly from the browser
 * due to CORS restrictions. It acts as a proxy between your React frontend and Printify.
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer for handling file uploads
const upload = multer({ 
  dest: 'temp-uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Printify API configuration
const PRINTIFY_API_BASE = 'https://api.printify.com/v1';
const API_TOKEN = process.env.VITE_PRINTIFY_API_TOKEN;
const SHOP_ID = process.env.VITE_PRINTIFY_SHOP_ID;

if (!API_TOKEN || !SHOP_ID) {
  console.error('❌ Missing Printify credentials in .env file');
  console.error('Required: VITE_PRINTIFY_API_TOKEN and VITE_PRINTIFY_SHOP_ID');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json'
};

console.log('🚀 Wave Caption Generator Backend Server');
console.log(`📡 Printify Shop ID: ${SHOP_ID}`);
console.log(`🔑 API Token: ${API_TOKEN.slice(0, 8)}...${API_TOKEN.slice(-4)}`);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    shopId: SHOP_ID 
  });
});

// Test endpoint to get real blueprint and provider info
app.get('/api/printify/test-setup', async (req, res) => {
  try {
    console.log('🧪 Testing Printify setup - getting blueprints and providers...');
    
    // Get blueprints
    const blueprintsResponse = await fetch(`${PRINTIFY_API_BASE}/catalog/blueprints.json`, {
      method: 'GET', 
      headers: headers
    });
    
    if (!blueprintsResponse.ok) {
      throw new Error(`Blueprints failed: ${blueprintsResponse.status}`);
    }
    
    const blueprints = await blueprintsResponse.json();
    
    // Filter for canvas and poster products
    const canvasBlueprints = blueprints.filter(bp => 
      bp.title.toLowerCase().includes('canvas') || 
      bp.title.toLowerCase().includes('poster')
    );
    
    console.log(`📋 Found ${canvasBlueprints.length} canvas/poster blueprints`);
    
    // Get print providers for the first canvas blueprint
    let providersData = null;
    if (canvasBlueprints.length > 0) {
      const firstCanvas = canvasBlueprints[0];
      const providersResponse = await fetch(`${PRINTIFY_API_BASE}/catalog/blueprints/${firstCanvas.id}/print_providers.json`, {
        method: 'GET',
        headers: headers
      });
      
      if (providersResponse.ok) {
        providersData = await providersResponse.json();
        console.log(`🏭 Found ${providersData.length} providers for ${firstCanvas.title}`);
      }
    }
    
    res.json({
      totalBlueprints: blueprints.length,
      canvasBlueprints: canvasBlueprints.slice(0, 5), // First 5
      providers: providersData ? providersData.slice(0, 3) : null, // First 3
      sampleBlueprintId: canvasBlueprints[0]?.id,
      sampleProviderId: providersData?.[0]?.id
    });
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Validate Printify API connection
app.get('/api/printify/validate', async (req, res) => {
  try {
    console.log('🔗 Validating Printify API connection...');
    
    // According to Printify API docs, use /shops.json to list all shops
    const response = await fetch(`${PRINTIFY_API_BASE}/shops.json`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API validation failed: ${response.status} ${error}`);
    }
    
    const shops = await response.json();
    console.log('✅ Printify API validation successful');
    console.log(`📍 Found ${shops.length} shops`);
    
    // Find the shop with our SHOP_ID
    const targetShop = shops.find(shop => shop.id.toString() === SHOP_ID.toString());
    
    if (!targetShop) {
      throw new Error(`Shop ID ${SHOP_ID} not found in your account. Available shops: ${shops.map(s => s.id).join(', ')}`);
    }
    
    console.log(`✅ Target shop found: ${targetShop.title} (ID: ${targetShop.id})`);
    
    res.json({ 
      success: true, 
      shop: targetShop,
      allShops: shops,
      message: 'Printify API connection validated successfully'
    });
    
  } catch (error) {
    console.error('❌ Printify API validation failed:', error.message);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Upload image to Printify
app.post('/api/printify/upload-image', upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Uploading image to Printify...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname || 'wave-art.jpg',
      contentType: req.file.mimetype || 'image/jpeg'
    });
    
    const response = await fetch(`${PRINTIFY_API_BASE}/uploads/images.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: formData
    });
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${response.status} ${error}`);
    }
    
    const uploadResult = await response.json();
    console.log(`✅ Image uploaded successfully: ${uploadResult.id}`);
    
    res.json(uploadResult);
    
  } catch (error) {
    console.error('❌ Image upload failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Upload image from base64 data URL
app.post('/api/printify/upload-image-base64', async (req, res) => {
  try {
    console.log('📤 Uploading base64 image to Printify...');
    
    const { imageData, filename } = req.body;
    
    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Missing imageData or filename' });
    }
    
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    // According to Printify API docs, we need to send JSON with file_name and contents
    const uploadPayload = {
      file_name: filename.endsWith('.jpg') ? filename : `${filename}.jpg`,
      contents: base64Data
    };
    
    console.log(`Uploading with filename: ${uploadPayload.file_name}`);
    
    const response = await fetch(`${PRINTIFY_API_BASE}/uploads/images.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uploadPayload)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${response.status} ${error}`);
    }
    
    const uploadResult = await response.json();
    console.log(`✅ Image uploaded successfully: ${uploadResult.id}`);
    
    res.json(uploadResult);
    
  } catch (error) {
    console.error('❌ Image upload failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create product on Printify
app.post('/api/printify/create-product', async (req, res) => {
  try {
    console.log('🏭 Creating product on Printify...');
    
    const productData = req.body;
    
    const response = await fetch(`${PRINTIFY_API_BASE}/shops/${SHOP_ID}/products.json`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Product creation failed: ${response.status} ${error}`);
    }
    
    const product = await response.json();
    console.log(`✅ Product created successfully: ${product.id}`);
    
    // Automatically publish to Shopify store
    try {
      console.log(`📢 Auto-publishing product ${product.id} to Shopify...`);
      
      const publishResponse = await fetch(`${PRINTIFY_API_BASE}/shops/${SHOP_ID}/products/${product.id}/publishing_succeeded.json`, {
        method: 'POST',
        headers: headers
      });
      
      if (publishResponse.ok) {
        console.log(`✅ Product auto-published successfully: ${product.id}`);
        product.published = true;
      } else {
        console.warn(`⚠️ Auto-publish failed for ${product.id}, manual publishing required`);
        product.published = false;
        product.publishNote = 'Requires manual publishing in Printify dashboard';
      }
    } catch (publishError) {
      console.warn(`⚠️ Auto-publish error for ${product.id}:`, publishError.message);
      product.published = false;
      product.publishNote = 'Auto-publish failed, manual publishing required';
    }
    
    res.json(product);
    
  } catch (error) {
    console.error('❌ Product creation failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Publish product to Shopify
app.post('/api/printify/publish-product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`📱 Publishing product to Shopify: ${productId}`);
    
    const response = await fetch(`${PRINTIFY_API_BASE}/shops/${SHOP_ID}/products/${productId}/publishing_succeeded.json`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        external: {
          id: productId,
          handle: `wave-art-${productId}`
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.warn('⚠️ Auto-publish failed:', error);
      return res.json({ 
        published: false, 
        requires_manual: true,
        message: 'Product created but requires manual publishing in Printify dashboard'
      });
    }
    
    const publishResult = await response.json();
    console.log(`✅ Product published successfully: ${productId}`);
    
    res.json({
      published: true,
      ...publishResult
    });
    
  } catch (error) {
    console.error('❌ Publishing failed:', error.message);
    res.json({ 
      published: false, 
      error: error.message,
      message: 'Product created but publishing failed'
    });
  }
});

// Get product details
app.get('/api/printify/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const response = await fetch(`${PRINTIFY_API_BASE}/shops/${SHOP_ID}/products/${productId}.json`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get product: ${response.status} ${error}`);
    }
    
    const product = await response.json();
    res.json(product);
    
  } catch (error) {
    console.error('❌ Failed to get product:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// List all products
app.get('/api/printify/products', async (req, res) => {
  try {
    const response = await fetch(`${PRINTIFY_API_BASE}/shops/${SHOP_ID}/products.json`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to list products: ${response.status} ${error}`);
    }
    
    const products = await response.json();
    res.json(products);
    
  } catch (error) {
    console.error('❌ Failed to list products:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get available blueprints (product types)
app.get('/api/printify/blueprints', async (req, res) => {
  try {
    const response = await fetch(`${PRINTIFY_API_BASE}/catalog/blueprints.json`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get blueprints: ${response.status} ${error}`);
    }
    
    const blueprints = await response.json();
    console.log(`📋 Found ${blueprints.length} available product blueprints`);
    
    // Filter for common print-on-demand products
    const commonProducts = blueprints.filter(bp => 
      bp.title.toLowerCase().includes('canvas') ||
      bp.title.toLowerCase().includes('poster') ||
      bp.title.toLowerCase().includes('mug') ||
      bp.title.toLowerCase().includes('t-shirt') ||
      bp.title.toLowerCase().includes('tshirt')
    );
    
    res.json({
      all: blueprints,
      common: commonProducts,
      total: blueprints.length
    });
    
  } catch (error) {
    console.error('❌ Failed to get blueprints:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get variants for a specific blueprint and provider
app.get('/api/printify/blueprint/:blueprintId/provider/:providerId/variants', async (req, res) => {
  try {
    const { blueprintId, providerId } = req.params;
    console.log(`🔍 Getting variants for blueprint ${blueprintId} with provider ${providerId}`);
    
    const response = await fetch(`${PRINTIFY_API_BASE}/catalog/blueprints/${blueprintId}/print_providers/${providerId}/variants.json`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get variants: ${response.status} ${error}`);
    }
    
    const variants = await response.json();
    console.log(`✅ Found ${variants.variants?.length || 0} variants`);
    
    res.json(variants);
    
  } catch (error) {
    console.error('❌ Failed to get variants:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get print providers for a specific blueprint
app.get('/api/printify/blueprint/:blueprintId/providers', async (req, res) => {
  try {
    const { blueprintId } = req.params;
    console.log(`🏭 Getting providers for blueprint ${blueprintId}`);
    
    const response = await fetch(`${PRINTIFY_API_BASE}/catalog/blueprints/${blueprintId}/print_providers.json`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get providers: ${response.status} ${error}`);
    }
    
    const providers = await response.json();
    console.log(`✅ Found ${providers.length} providers`);
    
    res.json(providers);
    
  } catch (error) {
    console.error('❌ Failed to get providers:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to create a simple product with verified IDs
app.post('/api/printify/test-product', async (req, res) => {
  try {
    console.log('🧪 Testing product creation with verified IDs...');
    
    // Create a minimal test product
    const testProduct = {
      title: "Test Ocean Wave Art - DELETE ME",
      description: "Test product created by Wave Caption Generator - can be deleted",
      blueprint_id: 97, // Verified: Satin Posters (210gsm)
      print_provider_id: 99, // Verified: Printify Choice
      variants: [
        {
          id: 33742, // Verified: 14″ x 11″
          price: 1999, // $19.99 in cents
          is_enabled: true
        }
      ],
      print_areas: [
        {
          variant_ids: [33742],
          placeholders: [
            {
              position: "front",
              images: []  // Will skip image upload for this test - just test blueprint/variant IDs
            }
          ]
        }
      ],
      tags: ["test", "ocean", "wave"]
    };
    
    const response = await fetch(`${PRINTIFY_API_BASE}/shops/${SHOP_ID}/products.json`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testProduct)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Test product creation failed: ${response.status} ${error}`);
    }
    
    const product = await response.json();
    console.log(`✅ Test product created successfully: ${product.id}`);
    
    res.json({
      success: true,
      product: product,
      message: "Test product created successfully - check your Printify dashboard",
      printifyUrl: `https://printify.com/app/products/${product.id}`
    });
    
  } catch (error) {
    console.error('❌ Test product creation failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎯 Backend server running at http://localhost:${PORT}`);
  console.log(`📡 Frontend should connect to: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Ready for real Printify API calls!\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down backend server...');
  process.exit(0);
});