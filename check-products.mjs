#!/usr/bin/env node

// Check existing products in your Printify shop
// Run with: node check-products.mjs

import https from 'https';

const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjFmYzI3NGQyMjhjN2IzOWRmZGNiYzUwODkwMmUyM2Q4NmQ5MDFkYzM5NTQ2N2QzNGEyZWEzMzU1MjNlMDY0MDU1ZmIwY2ZlZDgyNWIyOWFiIiwiaWF0IjoxNzU0OTc3NzAxLjUxMTM5MSwibmJmIjoxNzU0OTc3NzAxLjUxMTM5MiwiZXhwIjoxNzg2NTEzNzAxLjUwNDk2LCJzdWIiOiIyNDIxNjgxOCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiLCJ1c2VyLmluZm8iXX0.jwFhUUi0JY9Ar68Duy-WT_LGdeQA6LG1STXKB9dU2t3rNK0T-HH-Y7AGd4HM39oqKyjS0r_OHYuQg2nmLmVrXtaTaW3F9yh86Rdwvew5g7zMPRBlQeWonDzUph7OmAJxoKYhv3mjf0dA1Vl-nT3CcHnwP-G9bz8KSpGwKAkup0OvD1jf1B0opjHir48xBt05KSqlkI_VovyqjfqUvPbVIWdnlDH58nF0AJBowIb_tIynfdyjF9G1TrLAQLQUsu3enL_R3H8jpt0yghvUEIlbdMWwmPSFXPT3dFtrQtQcFJkDTgANCoBXwWntlRxOInKRhRpnAxl4Hp2mI8UyCF4gZLDt-Rv6gj4pzBwFMV5DCvpl16_8H31QRNVztHaD2hq2kTLfzGz4KhDIsfuYpmivtQG-1qLtqF9raZTW9Azf-BiKMH2Grwhp4aNHhmWmhWvNpGY4kw5lmD4InSrnP_DTAWey0d8AT6-Dvh-U2a6HE2fDIA6p0n_lW93dEFYF9coDcLGNxRQPxCNQmiwruYEVDLtLSqMyqkaSOXVBnZmFRAVX5EcOldmXqf8GUEtgRHiqr97Vt2jYX5Ts4IFHpKksecrnP1T2tbdbiLXixFo0UNO1hJa-fRjJpJq6UaXhSEhkI4eFj5C84aW80h3SlJbLxGzRWatTGjFuzAvCJJoBaNQ';
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