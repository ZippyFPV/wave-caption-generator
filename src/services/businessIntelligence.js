// WaveCommerce Business Intelligence Service
// Consolidated revenue calculations, market data, and business logic

import { UI_CONSTANTS, BUSINESS_METRICS } from '../config/constants.js';

// 2025 Market Data and Product Catalog
export const PRINTIFY_PRODUCTS = [
  {
    id: 'unisex-tshirt',
    name: 'Unisex Softstyle T-Shirt',
    category: 'Apparel',
    baseCost: 5.99,
    suggestedPrice: 19.99,
    profitRange: { min: 5, max: 35 },
    avgMonthlyOrders: 45,
    conversionRate: 3.2,
    demandLevel: 'High',
    marketSize: '$46.99B',
    seasonality: 'Year-round',
    description: 'Most popular print-on-demand product with consistent demand',
    icon: '👕'
  },
  {
    id: 'canvas-print',
    name: 'Giclée Print Canvas',
    category: 'Wall Art',
    baseCost: 12.50,
    suggestedPrice: 49.99,
    profitRange: { min: 20, max: 70 },
    avgMonthlyOrders: 28,
    conversionRate: 2.8,
    demandLevel: 'High',
    marketSize: '$8.2B',
    seasonality: 'Peak: Q4',
    description: 'Premium wall art with excellent profit margins',
    icon: '🖼️'
  },
  {
    id: 'ceramic-mug',
    name: 'Ceramic Mug (11oz)',
    category: 'Drinkware',
    baseCost: 6.75,
    suggestedPrice: 16.99,
    profitRange: { min: 10, max: 25 },
    avgMonthlyOrders: 38,
    conversionRate: 4.1,
    demandLevel: 'Very High',
    marketSize: '$3.8B',
    seasonality: 'Peak: Q4, Q1',
    description: 'High-conversion everyday item, perfect for repeat customers',
    icon: '☕'
  },
  {
    id: 'crewneck-sweatshirt',
    name: 'Unisex Crewneck Sweatshirt',
    category: 'Apparel',
    baseCost: 14.25,
    suggestedPrice: 39.99,
    profitRange: { min: 15, max: 45 },
    avgMonthlyOrders: 22,
    conversionRate: 2.5,
    demandLevel: 'High',
    marketSize: '$12.4B',
    seasonality: 'Peak: Q4, Q1',
    description: 'Higher-value apparel with strong seasonal demand',
    icon: '🧥'
  },
  {
    id: 'premium-poster',
    name: 'Premium Matte Vertical Poster',
    category: 'Wall Art',
    baseCost: 8.20,
    suggestedPrice: 24.99,
    profitRange: { min: 10, max: 40 },
    avgMonthlyOrders: 32,
    conversionRate: 3.5,
    demandLevel: 'High',
    marketSize: '$4.1B',
    seasonality: 'Year-round',
    description: 'Affordable wall art entry point with good margins',
    icon: '📄'
  }
];

// 2025 Market Intelligence Constants
export const MARKET_INTELLIGENCE_2025 = {
  // Revenue Calculations (Updated for 2025 market conditions)
  MONTHLY_TRAFFIC_PER_PRODUCT: 2000,
  AVERAGE_CONVERSION_RATE: 2.1, // Updated to 2025 realistic benchmark
  PLATFORM_FEES: 0.08,
  ADVERTISING_COST_RATIO: 0.18, // Increased competition in 2025
  OPERATIONAL_MARGIN: 0.90,
  
  // Market Growth Factors
  MARKET_GROWTH_MULTIPLIER: 1.26, // 26% CAGR for POD market
  MOBILE_TRAFFIC_PERCENTAGE: 0.44, // 44% mobile traffic by 2025
  PERSONALIZATION_BOOST: 1.15, // 15% conversion boost from personalized experiences
  
  // Success Metrics
  AVERAGE_DAYS_TO_1K_REVENUE: 118,
  SURVIVAL_RATE_3_YEARS: 0.24, // 24% of POD merchants last 3+ years
  PRODUCT_LISTING_SUCCESS_RATIO: 0.40, // 40% of listings generate majority of revenue
  
  // Global Market Data
  GLOBAL_MARKET_SIZE_2034: 103000000000, // $103B by 2034
  CURRENT_MARKET_SIZE: 10200000000, // $10.2B in 2024
  MARKET_CAGR: 26
};

// Revenue Calculation Engine
export const calculateProductRevenue = (product, imageCount = 20) => {
  const baseTraffic = MARKET_INTELLIGENCE_2025.MONTHLY_TRAFFIC_PER_PRODUCT * imageCount;
  const adjustedTraffic = baseTraffic * MARKET_INTELLIGENCE_2025.MARKET_GROWTH_MULTIPLIER;
  
  // Apply realistic 2025 conversion rates
  const baseConversionRate = Math.min(product.conversionRate, MARKET_INTELLIGENCE_2025.AVERAGE_CONVERSION_RATE);
  const personalizedConversionRate = baseConversionRate * MARKET_INTELLIGENCE_2025.PERSONALIZATION_BOOST;
  
  const conversions = adjustedTraffic * (personalizedConversionRate / 100);
  const grossRevenue = conversions * product.suggestedPrice;
  const productCosts = conversions * product.baseCost;
  const platformFees = grossRevenue * MARKET_INTELLIGENCE_2025.PLATFORM_FEES;
  const adSpend = grossRevenue * MARKET_INTELLIGENCE_2025.ADVERTISING_COST_RATIO;
  
  const netProfit = (grossRevenue - productCosts - platformFees - adSpend) * MARKET_INTELLIGENCE_2025.OPERATIONAL_MARGIN;
  
  // Apply 40/60 rule - only 40% of products will be successful
  const adjustedProfit = netProfit * MARKET_INTELLIGENCE_2025.PRODUCT_LISTING_SUCCESS_RATIO;
  
  return {
    monthlyOrders: Math.round(conversions),
    monthlyRevenue: Math.round(grossRevenue),
    monthlyProfit: Math.round(adjustedProfit),
    profitMargin: Math.round((adjustedProfit / grossRevenue) * 100),
    yearlyProfit: Math.round(adjustedProfit * 12),
    daysTo1K: Math.round(MARKET_INTELLIGENCE_2025.AVERAGE_DAYS_TO_1K_REVENUE * (1000 / Math.max(adjustedProfit, 1))),
    successProbability: MARKET_INTELLIGENCE_2025.SURVIVAL_RATE_3_YEARS
  };
};

// Portfolio Revenue Calculator
export const calculatePortfolioRevenue = (imageCount = 20) => {
  const productRevenues = PRINTIFY_PRODUCTS.map(product => {
    const revenue = calculateProductRevenue(product, imageCount);
    return { ...product, ...revenue };
  });

  const totalMonthlyRevenue = productRevenues.reduce((sum, product) => sum + product.monthlyRevenue, 0);
  const totalMonthlyProfit = productRevenues.reduce((sum, product) => sum + product.monthlyProfit, 0);
  const totalYearlyProfit = productRevenues.reduce((sum, product) => sum + product.yearlyProfit, 0);

  return {
    products: productRevenues,
    portfolio: {
      totalMonthlyRevenue,
      totalMonthlyProfit,
      totalYearlyProfit,
      averageProfitMargin: Math.round((totalMonthlyProfit / totalMonthlyRevenue) * 100),
      totalMonthlyOrders: productRevenues.reduce((sum, product) => sum + product.monthlyOrders, 0)
    }
  };
};

// Business Intelligence Utilities
export const getTopPerformers = (productRevenues, count = 5) => {
  return productRevenues
    .sort((a, b) => b.monthlyProfit - a.monthlyProfit)
    .slice(0, count);
};

export const getCategoryBreakdown = (productRevenues) => {
  const categories = {};
  
  productRevenues.forEach(product => {
    if (!categories[product.category]) {
      categories[product.category] = {
        name: product.category,
        monthlyRevenue: 0,
        monthlyProfit: 0,
        productCount: 0
      };
    }
    
    categories[product.category].monthlyRevenue += product.monthlyRevenue;
    categories[product.category].monthlyProfit += product.monthlyProfit;
    categories[product.category].productCount += 1;
  });
  
  return Object.values(categories).sort((a, b) => b.monthlyProfit - a.monthlyProfit);
};

// Format currency for display
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};