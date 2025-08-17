// Utility to fetch Shop ID from Printify API
// Run this once to get your Shop ID, then add it to .env

import { printifyFetch } from '../services/printifyClient';

export const getShopsFromAPI = async (apiToken) => {
  try {
    console.log('🔍 Fetching your shops from Printify API...');
    
    const response = await printifyFetch('/shops.json', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Found your shops:', data);
    
    // Display shops in a user-friendly format
    if (data && data.length > 0) {
      console.log('\n📋 Your Connected Shops:');
      data.forEach((shop, index) => {
        console.log(`\n${index + 1}. Shop Name: ${shop.title}`);
        console.log(`   Shop ID: ${shop.id} 👈 USE THIS NUMBER`);
        console.log(`   Platform: ${shop.sales_channel}`);
        console.log(`   Status: ${shop.disconnected_at ? 'Disconnected' : 'Connected'}`);
      });

      // Find Shopify shop specifically
      const shopifyShop = data.find(shop => 
        shop.sales_channel?.toLowerCase().includes('shopify') ||
        shop.title?.toLowerCase().includes('shopify')
      );

      if (shopifyShop) {
        console.log(`\n🎯 FOUND YOUR SHOPIFY SHOP!`);
        console.log(`Shop ID: ${shopifyShop.id}`);
        console.log(`\nAdd this to your .env file:`);
        console.log(`VITE_PRINTIFY_SHOP_ID=${shopifyShop.id}`);
        return shopifyShop.id;
      } else {
        console.log('\n⚠️ No Shopify shop found. Make sure you\'ve connected your Shopify store to Printify first.');
      }
    } else {
      console.log('❌ No shops found. Make sure you\'ve connected a store to your Printify account.');
    }

    return data;

  } catch (error) {
    console.error('❌ Error fetching shops:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n🔑 Invalid API token. Please check:');
      console.log('1. Go to printify.com → Account → API');
      console.log('2. Generate a new token');
      console.log('3. Make sure you copied it correctly');
    } else if (error.message.includes('403')) {
      console.log('\n🚫 API token doesn\'t have permission to access shops.');
    } else if (error.message.includes('429')) {
      console.log('\n⏱️ Rate limited. Wait a minute and try again.');
    }
    
    throw error;
  }
};

// Simple function to run the shop fetch
export const findMyShopId = async (apiToken) => {
  if (!apiToken?.trim()) {
    throw new Error('Please provide your Printify API token');
  }

  console.log('🚀 Looking up your Printify shops...');
  return await getShopsFromAPI(apiToken);
};