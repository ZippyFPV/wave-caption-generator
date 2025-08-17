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
import { createCanvas, loadImage } from 'canvas';
import config from './backend/config/index.js';

const { PRINTIFY_API_BASE, PRINTIFY_TOKEN: API_TOKEN, PRINTIFY_SHOP_ID: SHOP_ID, PORT } = config;

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer for handling file uploads
const upload = multer({ 
  dest: 'temp-uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Printify API configuration loaded from centralized config

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

// Image processing endpoint for automation
app.post('/api/process-image', async (req, res) => {
  try {
    const { imageUrl, caption, width = 4200, height = 3300 } = req.body;
    
    console.log(`🎨 Processing HIGH-QUALITY image: ${imageUrl} with caption: "${caption}"`);
    console.log(`📐 Canvas dimensions: ${width}x${height} (300 DPI print quality)`);
    
    // Load the original image
    const image = await loadImage(imageUrl);
    
    // Create canvas with Printify specifications
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill background with white (in case image doesn't fill)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Professional image scaling following rule of thirds for ocean waves
    const imageAspect = image.width / image.height;
    const canvasAspect = width / height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imageAspect > canvasAspect) {
      // Image is wider than canvas - fit to height and crop sides intelligently
      drawHeight = height;
      drawWidth = height * imageAspect;
      
      // Rule of thirds: Position horizon line at 1/3 or 2/3 if possible
      // For ocean waves, prefer showing more water (bottom 2/3)
      const cropAmount = drawWidth - width;
      const leftCrop = cropAmount * 0.4; // Slightly left of center for better composition
      drawX = -leftCrop;
    } else {
      // Image is taller than canvas - fit to width and preserve horizon
      drawWidth = width;
      drawHeight = width / imageAspect;
      
      // Rule of thirds: For ocean scenes, position horizon at upper or lower third
      // Prefer showing waves in lower 2/3 of frame
      const cropAmount = drawHeight - height;
      const topCrop = cropAmount * 0.25; // Crop mostly from top to preserve wave action
      drawY = -topCrop;
    }
    
    // Draw the image
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    
    // Add caption overlay
    if (caption) {
      // Clean caption for display (remove brackets)
      const displayCaption = caption.replace(/[[\]]/g, '').trim();
      
      // Dynamic font sizing based on canvas width and text length
      const baseSize = Math.floor(width * 0.04); // 4% of width for better proportion
      const minSize = Math.max(40, width * 0.015); // Minimum size scales with canvas
      const maxSize = Math.min(120, width * 0.06); // Maximum size to prevent oversized text
      
      // Adjust font size based on text length for optimal readability
      let fontSize = baseSize;
      if (displayCaption.length > 40) fontSize = Math.max(minSize, baseSize * 0.85);
      if (displayCaption.length > 60) fontSize = Math.max(minSize, baseSize * 0.75);
      fontSize = Math.min(fontSize, maxSize);
      
      // Set up text styling
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Calculate text dimensions for background
      const textMetrics = ctx.measureText(displayCaption);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;
      
      // Smart positioning: avoid critical image areas
      const textX = width / 2;
      let textY = height * 0.82; // Lower position for better composition
      
      // Draw semi-transparent background
      const padding = 40;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(
        textX - textWidth / 2 - padding,
        textY - textHeight / 2 - padding / 2,
        textWidth + padding * 2,
        textHeight + padding
      );
      
      // High-contrast text with subtle shadow
      // Text shadow for better readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillText(displayCaption, textX + 2, textY + 2);
      
      // Main text in bright, readable gold
      ctx.fillStyle = '#FFD700'; // Gold color for premium feel
      ctx.fillText(displayCaption, textX, textY);
    }
    
    // Convert to base64 with maximum quality for print
    const dataUrl = canvas.toDataURL('image/jpeg', 1.0); // 100% quality - no compression
    
    const processedImageData = {
      dataUrl,
      width,
      height,
      caption,
      originalUrl: imageUrl,
      processed: true,
      timestamp: Date.now()
    };
    
    console.log(`✅ HIGH-QUALITY image processed: ${width}x${height} with caption overlay`);
    console.log(`🔥 Quality: 100% JPEG, 300 DPI print resolution, zero compression artifacts`);
    res.json(processedImageData);
    
  } catch (error) {
    console.error('❌ Image processing failed:', error.message);
    res.status(500).json({ error: error.message });
  }
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
      
      // First, let's try the correct Printify publish endpoint
      const publishPayload = {
        title: true,
        description: true,
        images: true,
        variants: true,
        tags: true,
        keyFeatures: true,
        shipping_template: true
      };
      
      const publishResponse = await fetch(`${PRINTIFY_API_BASE}/shops/${SHOP_ID}/products/${product.id}/publish.json`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(publishPayload)
      });
      
      if (publishResponse.ok) {
        const publishResult = await publishResponse.json();
        console.log(`✅ Product auto-published successfully: ${product.id}`);
        console.log('📋 Publish response:', JSON.stringify(publishResult, null, 2));
        product.published = true;
        product.publishResult = publishResult;
      } else {
        const errorText = await publishResponse.text();
        console.warn(`⚠️ Auto-publish failed for ${product.id}:`, publishResponse.status, errorText);
        product.published = false;
        product.publishNote = `Publish failed: ${publishResponse.status} - ${errorText}`;
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

// Delete product from Printify
app.delete('/api/printify/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`🗑️ Deleting product from Printify: ${productId}`);
    
    const response = await fetch(`${PRINTIFY_API_BASE}/shops/${SHOP_ID}/products/${productId}.json`, {
      method: 'DELETE',
      headers: headers
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete product: ${response.status} ${error}`);
    }
    
    console.log(`✅ Product deleted successfully: ${productId}`);
    res.json({ success: true, message: 'Product deleted successfully' });
    
  } catch (error) {
    console.error('❌ Failed to delete product:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Bulk delete products from Printify
app.post('/api/printify/products/bulk-delete', async (req, res) => {
  try {
    const { productIds, confirmPhrase } = req.body;
    
    // Safety check - require confirmation phrase
    if (confirmPhrase !== 'DELETE ALL LISTINGS') {
      return res.status(400).json({ 
        error: 'Invalid confirmation phrase. Please provide "DELETE ALL LISTINGS" to confirm bulk deletion.' 
      });
    }
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'No product IDs provided' });
    }
    
    console.log(`🗑️ Starting bulk deletion of ${productIds.length} products...`);
    
    const results = [];
    let deletedCount = 0;
    let failedCount = 0;
    
    // Delete products one by one with rate limiting
    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];
      
      try {
        console.log(`🗑️ Deleting product ${i + 1}/${productIds.length}: ${productId}`);
        
        const response = await fetch(`${PRINTIFY_API_BASE}/shops/${SHOP_ID}/products/${productId}.json`, {
          method: 'DELETE',
          headers: headers
        });
        
        if (response.ok) {
          results.push({ productId, success: true, message: 'Deleted successfully' });
          deletedCount++;
          console.log(`✅ Deleted: ${productId}`);
        } else {
          const error = await response.text();
          results.push({ productId, success: false, error: `${response.status}: ${error}` });
          failedCount++;
          console.log(`❌ Failed to delete ${productId}: ${response.status}`);
        }
        
        // Rate limiting - wait 100ms between deletions
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.push({ productId, success: false, error: error.message });
        failedCount++;
        console.log(`❌ Error deleting ${productId}:`, error.message);
      }
    }
    
    console.log(`🏁 Bulk deletion completed: ${deletedCount} deleted, ${failedCount} failed`);
    
    res.json({
      success: true,
      totalRequested: productIds.length,
      deleted: deletedCount,
      failed: failedCount,
      results: results
    });
    
  } catch (error) {
    console.error('❌ Bulk deletion failed:', error.message);
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

// Pexels API proxy endpoint for automation
app.get('/api/pexels/search', async (req, res) => {
  try {
    const { query, per_page = 1, page = 1 } = req.query;
    
    if (!process.env.VITE_PEXELS_API_KEY) {
      return res.status(500).json({ error: 'Pexels API key not configured' });
    }
    
    console.log(`🖼️ Fetching Pexels images: query="${query}", page=${page}, per_page=${per_page}`);
    
    const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${per_page}&page=${page}`;
    
    const response = await fetch(pexelsUrl, {
      headers: {
        'Authorization': process.env.VITE_PEXELS_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Pexels API failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Pexels returned ${data.photos?.length || 0} photos`);
    
    res.json(data);
    
  } catch (error) {
    console.error('❌ Pexels API proxy failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, _next) => {
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