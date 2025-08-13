#!/usr/bin/env node

// Simplified Product Creation - Creates product without image first
// Run with: node create-simple-product.mjs

import https from 'https';

const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjFmYzI3NGQyMjhjN2IzOWRmZGNiYzUwODkwMmUyM2Q4NmQ5MDFkYzM5NTQ2N2QzNGEyZWEzMzU1MjNlMDY0MDU1ZmIwY2ZlZDgyNWIyOWFiIiwiaWF0IjoxNzU0OTc3NzAxLjUxMTM5MSwibmJmIjoxNzU0OTc3NzAxLjUxMTM5MiwiZXhwIjoxNzg2NTEzNzAxLjUwNDk2LCJzdWIiOiIyNDIxNjgxOCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiLCJ1c2VyLmluZm8iXX0.jwFhUUi0JY9Ar68Duy-WT_LGdeQA6LG1STXKB9dU2t3rNK0T-HH-Y7AGd4HM39oqKyjS0r_OHYuQg2nmLmVrXtaTaW3F9yh86Rdwvew5g7zMPRBlQeWonDzUph7OmAJxoKYhv3mjf0dA1Vl-nT3CcHnwP-G9bz8KSpGwKAkup0OvD1jf1B0opjHir48xBt05KSqlkI_VovyqjfqUvPbVIWdnlDH58nF0AJBowIb_tIynfdyjF9G1TrLAQLQUsu3enL_R3H8jpt0yghvUEIlbdMWwmPSFXPT3dFtrQtQcFJkDTgANCoBXwWntlRxOInKRhRpnAxl4Hp2mI8UyCF4gZLDt-Rv6gj4pzBwFMV5DCvpl16_8H31QRNVztHaD2hq2kTLfzGz4KhDIsfuYpmivtQG-1qLtqF9raZTW9Azf-BiKMH2Grwhp4aNHhmWmhWvNpGY4kw5lmD4InSrnP_DTAWey0d8AT6-Dvh-U2a6HE2fDIA6p0n_lW93dEFYF9coDcLGNxRQPxCNQmiwruYEVDLtLSqMyqkaSOXVBnZmFRAVX5EcOldmXqf8GUEtgRHiqr97Vt2jYX5Ts4IFHpKksecrnP1T2tbdbiLXixFo0UNO1hJa-fRjJpJq6UaXhSEhkI4eFj5C84aW80h3SlJbLxGzRWatTGjFuzAvCJJoBaNQ';
const SHOP_ID = '23824847';

console.log('🚀 Simple Product Test');
console.log('======================');

// Just create a basic product without print areas first
async function createBasicProduct() {
  return new Promise((resolve, reject) => {
    const productData = {
      title: "Test Wave Art Product - WaveCommerce",
      description: "Beautiful ocean wave art for your space. This is a test product created by the WaveCommerce automation system.",
      blueprint_id: 481, // Poster blueprint
      print_provider_id: 1,
      variants: [
        {
          id: 45898, // Standard variant ID for posters
          price: 2999, // $29.99
          is_enabled: true
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