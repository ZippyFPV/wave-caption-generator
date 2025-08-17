#!/usr/bin/env node

// Check existing products in your Printify shop
// Run with: node check-products.mjs

import https from 'https';

const API_TOKEN = process.env.VITE_PRINTIFY_API_TOKEN;
const SHOP_ID = '23824847';

console.log('🔍 Checking Your Printify Products');
console.log('==================================');

async function getProducts() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.printify.com',
      port: 443,
      path: `/v1/shops/${SHOP_ID}/products.json`,
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
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    const response = await getProducts();
    
    if (response.status === 200) {
      const products = response.data.data || response.data;
      
      console.log(`✅ Found ${products.length} products in your shop\n`);
      
      if (products.length === 0) {
        console.log('📝 No products yet. This is normal for a new setup.');
        console.log('\n💡 To create products manually:');
        console.log('   1. Go to https://printify.com/app/products');
        console.log('   2. Click "Create" → "Upload your design"');
        console.log('   3. Choose a product type and upload your wave images');
        console.log('   4. Set pricing and publish to Shopify');
      } else {
        products.slice(0, 5).forEach((product, index) => {
          console.log(`${index + 1}. ${product.title || 'Untitled Product'}`);
          console.log(`   ID: ${product.id}`);
          console.log(`   Status: ${product.visible ? 'Visible' : 'Draft'}`);
          console.log(`   Variants: ${product.variants?.length || 0}`);
          console.log('');
        });
        
        if (products.length > 5) {
          console.log(`... and ${products.length - 5} more products`);
        }
      }
      
      console.log('\n🔗 Quick Links:');
      console.log('   • Printify Dashboard: https://printify.com/app/products');
      console.log('   • Shopify Admin: https://admin.shopify.com/store/getting-wavy/products');
      
    } else {
      console.log('❌ API Error:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

main();