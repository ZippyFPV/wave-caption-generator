#!/usr/bin/env node

// Simplified Product Creation - Creates product without image first
// Run with: node create-simple-product.mjs

import https from 'https';

const API_TOKEN = process.env.VITE_PRINTIFY_API_TOKEN;
const SHOP_ID = '23824847';

console.log('🚀 Simple Product Test');
console.log('======================');

// Just create a basic product without print areas first
async function createBasicProduct() {
  return new Promise((resolve, reject) => {
    const productData = {
      title: "Test Wave Art Product - WaveCommerce",
      description: "Beautiful ocean wave art for your space. This is a test product created by the WaveCommerce automation system.",
      blueprint_id: 97, // Satin Posters (210gsm)
      print_provider_id: 99, // Printify Choice
      variants: [
        {
          id: 33742, // 14″ x 11″ landscape (4200x3300px required)
          price: 1999, // $19.99
          is_enabled: true
        }
      ],
      print_areas: [
        {
          variant_ids: [33742],
          placeholders: [
            {
              position: "front",
              images: [
                {
                  id: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
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
      tags: ["test", "waves", "ocean", "art"]
    };

    const postData = JSON.stringify(productData);

    const options = {
      hostname: 'api.printify.com',
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
        console.log(`API Response Status: ${res.statusCode}`);
        console.log('Raw Response:', data);
        
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(result);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${JSON.stringify(result)}`));
          }
        } catch (error) {
          reject(new Error(`Parse Error: ${error.message}, Raw: ${data}`));
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
    console.log('🎨 Creating basic test product...\n');
    
    const product = await createBasicProduct();
    
    console.log('🎉 SUCCESS! Product created:');
    console.log(`   Product ID: ${product.id}`);
    console.log(`   Title: ${product.title}`);
    console.log(`   Variants: ${product.variants?.length || 0}`);
    
    console.log('\n✅ Check your stores:');
    console.log('   • Printify Dashboard: https://printify.com/app/products');
    console.log('   • Shopify Admin: https://admin.shopify.com/store/getting-wavy/products');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

main();