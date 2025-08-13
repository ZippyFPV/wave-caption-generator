#!/usr/bin/env node

// Real Printify Product Creation Script
// Run with: node create-products.mjs

import https from 'https';
import fs from 'fs';
import path from 'path';

const PRINTIFY_API_BASE = 'api.printify.com';
const API_TOKEN = process.env.VITE_PRINTIFY_API_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjFmYzI3NGQyMjhjN2IzOWRmZGNiYzUwODkwMmUyM2Q4NmQ5MDFkYzM5NTQ2N2QzNGEyZWEzMzU1MjNlMDY0MDU1ZmIwY2ZlZDgyNWIyOWFiIiwiaWF0IjoxNzU0OTc3NzAxLjUxMTM5MSwibmJmIjoxNzU0OTc3NzAxLjUxMTM5MiwiZXhwIjoxNzg2NTEzNzAxLjUwNDk2LCJzdWIiOiIyNDIxNjgxOCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiLCJ1c2VyLmluZm8iXX0.jwFhUUi0JY9Ar68Duy-WT_LGdeQA6LG1STXKB9dU2t3rNK0T-HH-Y7AGd4HM39oqKyjS0r_OHYuQg2nmLmVrXtaTaW3F9yh86Rdwvew5g7zMPRBlQeWonDzUph7OmAJxoKYhv3mjf0dA1Vl-nT3CcHnwP-G9bz8KSpGwKAkup0OvD1jf1B0opjHir48xBt05KSqlkI_VovyqjfqUvPbVIWdnlDH58nF0AJBowIb_tIynfdyjF9G1TrLAQLQUsu3enL_R3H8jpt0yghvUEIlbdMWwmPSFXPT3dFtrQtQcFJkDTgANCoBXwWntlRxOInKRhRpnAxl4Hp2mI8UyCF4gZLDt-Rv6gj4pzBwFMV5DCvpl16_8H31QRNVztHaD2hq2kTLfzGz4KhDIsfuYpmivtQG-1qLtqF9raZTW9Azf-BiKMH2Grwhp4aNHhmWmhWvNpGY4kw5lmD4InSrnP_DTAWey0d8AT6-Dvh-U2a6HE2fDIA6p0n_lW93dEFYF9coDcLGNxRQPxCNQmiwruYEVDLtLSqMyqkaSOXVBnZmFRAVX5EcOldmXqf8GUEtgRHiqr97Vt2jYX5Ts4IFHpKksecrnP1T2tbdbiLXixFo0UNO1hJa-fRjJpJq6UaXhSEhkI4eFj5C84aW80h3SlJbLxGzRWatTGjFuzAvCJJoBaNQ';
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