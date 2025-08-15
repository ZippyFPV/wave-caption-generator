#!/usr/bin/env node

// Real Printify Product Creation Script
// Run with: node create-products.mjs

import https from 'https';
import fs from 'fs';
import path from 'path';

const PRINTIFY_API_BASE = 'api.printify.com';
const API_TOKEN = process.env.VITE_PRINTIFY_API_TOKEN;
const SHOP_ID = '23824847';

console.log('🚀 WaveCommerce Product Creation Tool');
console.log('=====================================');

// For testing, we'll create a simple product without needing images first
console.log('📝 Creating test product (images can be added later)...');

// Get available product blueprints
async function getBlueprints() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: PRINTIFY_API_BASE,
      port: 443,
      path: '/v1/catalog/blueprints.json',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const blueprints = JSON.parse(data);
          resolve(blueprints);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Create a simple poster product (most reliable blueprint)
async function createPosterProduct(title, description) {
  return new Promise((resolve, reject) => {
    const productData = {
      title: title,
      description: description,
      blueprint_id: 481, // Standard Poster blueprint
      print_provider_id: 1, // Main print provider
      variants: [
        {
          id: 45898, // 12x16 inch poster variant
          price: 1999, // $19.99 in cents
          is_enabled: true
        }
      ],
      print_areas: [
        {
          variant_ids: [45898],
          placeholders: [
            {
              position: "front",
              images: [
                {
                  id: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg", // Placeholder wave image
                  x: 0.5,
                  y: 0.5,
                  scale: 1,
                  angle: 0
                }
              ]
            }
          ]
        }
      ],
      tags: ['ocean', 'waves', 'art', 'poster', 'wall-art', 'therapeutic', 'calm']
    };

    const postData = JSON.stringify(productData);

    const options = {
      hostname: PRINTIFY_API_BASE,
      port: 443,
      path: `/v1/shops/${SHOP_ID}/products.json`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(result);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Main execution
async function main() {
  try {
    console.log('📋 Testing API connection...');
    
    // Test API connection by getting blueprints
    const blueprints = await getBlueprints();
    console.log(`✅ Connected! Found ${blueprints.length} available product types`);
    
    // Create a test product
    console.log('\n🎨 Creating test wave art poster...');
    
    const testTitle = 'Calming Ocean Waves - Premium Therapeutic Wall Art';
    const testDescription = `Transform your space with this stunning poster featuring therapeutic ocean wave imagery.

🌊 WELLNESS BENEFITS:
• Reduces stress through natural ocean therapy
• Promotes focus in work environments  
• Creates calming meditation atmosphere
• Evidence-based color therapy using soothing blues

✨ PREMIUM FEATURES:
• Museum-quality printing with fade-resistant inks
• Premium paper built to last
• Fast 3-5 day production and shipping
• 100% satisfaction guarantee

Perfect for home offices, meditation rooms, therapy spaces, and peaceful bedroom decor.`;

    const product = await createPosterProduct(testTitle, testDescription);
    
    console.log('🎉 SUCCESS! Created product:');
    console.log(`   Product ID: ${product.id}`);
    console.log(`   Title: ${product.title}`);
    console.log(`   Status: ${product.visible ? 'Visible' : 'Draft'}`);
    
    console.log('\n📈 Next Steps:');
    console.log('1. Check your "Getting Wavy" Shopify store for the new product');
    console.log('2. Add product images through the Printify dashboard');
    console.log('3. Publish to make it live for customers');
    console.log('4. Run this script again to create more products!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('401')) {
      console.log('💡 Check your API token in the .env file');
    } else if (error.message.includes('404')) {
      console.log('💡 Check your Shop ID in the .env file');  
    } else if (error.message.includes('429')) {
      console.log('💡 API rate limit hit - wait a minute and try again');
    }
  }
}

main();