#!/bin/bash

# Simple curl command to get your Printify Shop ID
# Usage: ./curl-shop-id.sh YOUR_API_TOKEN

if [ -z "$1" ]; then
    echo "❌ Please provide your API token:"
    echo "   ./curl-shop-id.sh YOUR_PRINTIFY_API_TOKEN"
    exit 1
fi

echo "🔍 Fetching your Printify shops..."

curl -H "Authorization: Bearer $1" \
     -H "Content-Type: application/json" \
     -H "User-Agent: WaveCommerce-ShopFinder/1.0" \
     https://api.printify.com/v1/shops.json | \
     python3 -m json.tool