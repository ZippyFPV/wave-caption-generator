// Enterprise-level configuration constants - OPTIMIZED for maximum revenue accuracy
export const BUSINESS_METRICS = {
  TARGET_REVENUE: 8000,
  AVG_SALE_PRICE: 24.99,
  TARGET_CONVERSION: 2.5, // 2.5% realistic conversion (conservative vs industry 2-3%)
  PROFIT_MARGIN: 0.68, // 68% profit margin (Shopify + Printify optimized)
  IMAGES_PER_BATCH: 20,
  DAILY_VIEWS_PER_IMAGE: 65, // Updated based on 165K monthly searches for "ocean wall art" / keyword density
  COLLECTIONS_PER_MONTH: 4, // More realistic scaling - 4 collections monthly
  DAYS_PER_MONTH: 30,
  
  // Enhanced accuracy metrics based on market data
  MARKET_DATA: {
    MONTHLY_SEARCH_VOLUME: 165000, // "ocean wall art" search volume
    KEYWORD_COUNT_PER_IMAGE: 100, // 100+ SEO keywords per image from waveModules
    ESTIMATED_MARKET_SHARE: 0.001, // Conservative 0.1% market capture
    SEASONAL_MULTIPLIER: 1.2, // 20% boost during peak seasons
    PLATFORM_TRAFFIC_SPLIT: {
      SHOPIFY: 0.6, // 60% Shopify traffic
      ETSY: 0.3, // 30% Etsy traffic  
      DIRECT: 0.1 // 10% direct/social
    }
  },
  
  // Revenue optimization factors
  OPTIMIZATION: {
    SEO_BOOST: 1.3, // 30% traffic boost from 100+ keywords
    MULTI_PLATFORM: 1.25, // 25% boost from multiple platforms
    QUALITY_PREMIUM: 1.15, // 15% higher conversion from quality
    BATCH_EFFICIENCY: 1.1 // 10% efficiency from batch generation
  }
};

export const PLATFORMS = {
  PRIMARY: {
    name: 'Shopify',
    url: 'https://www.shopify.com',
    setupUrl: 'https://www.shopify.com/free-trial',
    profitMargin: 0.7,
    description: '70% profit margins, automated fulfillment',
    priority: 1,
    integration: 'printify'
  },
  SECONDARY: {
    name: 'Etsy',
    url: 'https://www.etsy.com',
    setupUrl: 'https://www.etsy.com/your/shops/me/tools/listings/create',
    profitMargin: 0.65,
    description: '90M+ active buyers, established marketplace',
    priority: 2,
    integration: 'manual'
  }
};

export const INTEGRATIONS = {
  PRINTIFY: {
    name: 'Printify',
    url: 'https://printify.com',
    apiUrl: 'https://api.printify.com/v1',
    signupUrl: 'https://printify.com/app/register',
    description: 'Print-on-demand fulfillment partner'
  },
  SHOPIFY: {
    name: 'Shopify',
    apiUrl: 'https://api.shopify.com',
    appUrl: 'https://apps.shopify.com/printify',
    description: 'E-commerce platform integration'
  }
};

export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY: '#0f766e', // Teal - excellent for sunlight
    SECONDARY: '#1e40af', // Deep blue for contrast
    SUCCESS: '#15803d', // Forest green for high visibility
    WARNING: '#b45309', // Amber for clear warnings
    ERROR: '#dc2626', // Red for errors
    BACKGROUND: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', // Bright white to light gray
    CARD: 'rgba(255, 255, 255, 0.95)', // Nearly white cards with slight transparency
    TEXT: {
      PRIMARY: '#1e293b', // Dark slate for maximum readability in sunlight
      SECONDARY: '#475569', // Medium slate for secondary text
      MUTED: '#64748b' // Slate gray for muted text
    },
    // Sunlight-optimized colors with maximum contrast
    ACCESSIBLE: {
      HIGH_CONTRAST_TEXT: '#0f172a', // Nearly black for maximum contrast
      MEDIUM_CONTRAST_TEXT: '#1e293b', // Dark slate
      LOW_CONTRAST_TEXT: '#334155', // Medium dark slate
      FOCUS_OUTLINE: '#2563eb', // Blue outline for focus
      ERROR_TEXT: '#ffffff', // White text on red backgrounds
      SUCCESS_TEXT: '#ffffff', // White text on green backgrounds  
      WARNING_TEXT: '#ffffff', // White text on orange backgrounds
      INFO_TEXT: '#ffffff' // White text on blue backgrounds
    }
  },
  LAYOUT: {
    MAX_WIDTH: 800, // Even narrower for better focus and elegance
    CARD_RADIUS: 16, // Slightly more rounded for modern look
    SPACING: {
      XS: 2, // Much tighter
      SM: 4, // Tighter  
      MD: 8, // Reduced significantly
      LG: 12, // More compact
      XL: 16  // Less spacing
    },
    // Ultra-compact spacing for seamless flow
    SEAMLESS: {
      XS: 1,
      SM: 2,
      MD: 4,
      LG: 6,
      XL: 8
    }
  }
};

export const IMAGE_CONFIG = {
  TARGET_COUNT: 20,
  MAX_WIDTH: 2400,
  MAX_HEIGHT: 1600,
  QUALITY: 0.95,
  MIN_FONT_SIZE: 24,
  MAX_TEXT_WIDTH_RATIO: 0.85
};

export const WORKFLOW_STEPS = [
  {
    id: 'setup',
    title: 'Platform Setup',
    description: 'Connect Shopify + Printify for automated fulfillment',
    duration: '5 min'
  },
  {
    id: 'generate', 
    title: 'Generate Collection',
    description: 'AI creates 20 SEO-optimized wave art images',
    duration: '3 min'
  },
  {
    id: 'upload',
    title: 'Launch Products',
    description: 'Automated upload to Shopify store',
    duration: '2 min'
  },
  {
    id: 'scale',
    title: 'Scale & Optimize', 
    description: 'Track performance, scale winners',
    duration: 'Ongoing'
  }
];

export const SAMPLE_DATA = {
  TITLE: "Calming Ocean Wave Canvas Print - Modern Coastal Wall Art for Living Room",
  DESCRIPTION: `Transform your space with this stunning ocean wave canvas print. 

✨ FEATURES:
• Museum-quality canvas with fade-resistant inks
• Ready to hang with included mounting hardware  
• Available in multiple sizes (12x16" to 24x36")
• Ships within 3-5 business days

🏠 PERFECT FOR:
• Living rooms, bedrooms, offices
• Coastal, modern, or minimalist decor
• Housewarming gifts, new home celebrations
• Anyone who loves ocean vibes

🎯 KEYWORDS: #OceanArt #CoastalDecor #WallArt #ModernHome #CanvasPrint #BlueDecor #WaveArt #HomeDecor #PrintOnDemand`,
  
  TAGS: ['ocean art', 'coastal decor', 'wall art', 'canvas print', 'modern home', 'blue decor', 'wave art', 'home decor'],
  
  PRICE: 24.99,
  
  SHOPIFY_PRODUCT: {
    title: "Calming Ocean Wave Canvas Print - Modern Coastal Wall Art",
    body_html: "Transform your space with this stunning ocean wave canvas print...",
    vendor: "WaveArt Studio",
    product_type: "Wall Art",
    tags: "ocean art, coastal decor, wall art, canvas print"
  }
};