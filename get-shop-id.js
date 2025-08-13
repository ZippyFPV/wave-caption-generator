#!/usr/bin/env node

// Simple Node.js script to fetch your Printify Shop ID
// Run with: node get-shop-id.js YOUR_API_TOKEN

const https = require('https');

const apiToken = process.argv[2];

if (!apiToken) {
  console.log('❌ Please provide your API token:');
  console.log('   node get-shop-id.js YOUR_PRINTIFY_API_TOKEN');
  process.exit(1);
}

console.log('🔍 Fetching your Printify shops...');

const options = {
  hostname: 'api.printify.com',
  port: 443,
  path: '/v1/shops.json',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
    'User-Agent': 'WaveCommerce-ShopFinder/1.0'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const shops = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('\n✅ SUCCESS! Found your shops:\n');
        
        shops.forEach((shop, index) => {
          const isShopify = shop.sales_channel?.toLowerCase().includes('shopify') || 
                           shop.title?.toLowerCase().includes('shopify');
          
          console.log(`${index + 1}. ${shop.title}`);
          console.log(`   Shop ID: ${shop.id} ${isShopify ? '👈 SHOPIFY SHOP' : ''}`);
          console.log(`   Platform: ${shop.sales_channel}`);
          console.log(`   Status: ${shop.disconnected_at ? 'Disconnected' : 'Connected'}`);
          console.log('');
        });

        // Find Shopify shop
        const shopifyShop = shops.find(shop => 
          shop.sales_channel?.toLowerCase().includes('shopify') ||
          shop.title?.toLowerCase().includes('shopify')
        );

        if (shopifyShop) {
          console.log('🎯 YOUR SHOPIFY SHOP ID: ' + shopifyShop.id);
          console.log('\n📝 Add this line to your .env file:');
          console.log(`VITE_PRINTIFY_SHOP_ID=${shopifyShop.id}`);
        }

      } else {
        console.log('❌ API Error:', res.statusCode);
        console.log('Response:', data);
      }
    } catch (error) {
      console.log('❌ Error parsing response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request failed:', error.message);
  
  if (error.message.includes('ENOTFOUND')) {
    console.log('💡 Check your internet connection');
  } else if (error.message.includes('timeout')) {
    console.log('💡 API request timed out, try again');
  }
});

req.end();