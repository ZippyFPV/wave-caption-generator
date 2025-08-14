/**
 * Content Analytics Service
 * 
 * Provides real-time analytics and insights about generated wave content,
 * including persona targeting effectiveness, conversion predictions, and optimization recommendations.
 */

import { getContentAnalytics } from '../utils/waveContentGenerator.js';

/**
 * Analyze a collection of generated images for business intelligence
 */
export const analyzeImageCollection = (images) => {
  if (!images || images.length === 0) {
    return {
      summary: {
        totalImages: 0,
        averageConversion: 0,
        diversityScore: 0
      },
      insights: [],
      recommendations: []
    };
  }

  // Extract content data for analysis
  const contentBatch = images.map(image => ({
    caption: image.caption,
    title: image.title,
    filename: image.filename,
    metadata: image.metadata || {
      persona: 'general',
      season: 'year-round',
      estimatedConversion: 10,
      targetKeywords: []
    }
  }));

  // Get comprehensive analytics
  const analytics = getContentAnalytics(contentBatch);
  
  // Generate business insights
  const insights = generateBusinessInsights(analytics, images.length);
  
  // Calculate portfolio metrics
  const portfolioMetrics = calculatePortfolioMetrics(analytics);
  
  return {
    summary: {
      totalImages: images.length,
      averageConversion: analytics.estimatedConversionRate,
      diversityScore: calculateDiversityScore(analytics),
      topPersona: getTopPersona(analytics.personaDistribution),
      keywordCoverage: Object.keys(analytics.topKeywords).length
    },
    analytics,
    insights,
    portfolioMetrics,
    recommendations: analytics.recommendedOptimizations
  };
};

/**
 * Generate actionable business insights from analytics data
 */
const generateBusinessInsights = (analytics, totalImages) => {
  const insights = [];
  
  // Revenue potential insight
  const monthlyRevenuePotential = calculateRevenuePotential(analytics);
  insights.push({
    type: 'revenue',
    title: 'Monthly Revenue Potential',
    value: `$${monthlyRevenuePotential.toLocaleString()}`,
    description: `Based on ${totalImages} images with ${analytics.estimatedConversionRate}% avg conversion rate`,
    icon: '💰',
    trend: monthlyRevenuePotential > 2000 ? 'positive' : 'neutral'
  });
  
  // Market positioning insight
  const topPersona = getTopPersona(analytics.personaDistribution);
  insights.push({
    type: 'targeting',
    title: 'Primary Target Market',
    value: formatPersonaName(topPersona),
    description: `${Math.round((analytics.personaDistribution[topPersona] / totalImages) * 100)}% of content targets this segment`,
    icon: '🎯',
    trend: 'neutral'
  });
  
  // SEO coverage insight
  const keywordCount = Object.keys(analytics.topKeywords).length;
  insights.push({
    type: 'seo',
    title: 'SEO Keyword Coverage',
    value: `${keywordCount} keywords`,
    description: 'Unique keywords for organic discovery',
    icon: '🔍',
    trend: keywordCount > 50 ? 'positive' : 'needs_improvement'
  });
  
  // Seasonal relevance insight
  const seasonalScore = calculateSeasonalRelevance(analytics.seasonalRelevance);
  insights.push({
    type: 'seasonal',
    title: 'Seasonal Adaptability',
    value: `${seasonalScore}%`,
    description: 'Content suited for year-round sales',
    icon: '📅',
    trend: seasonalScore > 70 ? 'positive' : 'neutral'
  });
  
  return insights;
};

/**
 * Calculate monthly revenue potential based on content analytics
 */
const calculateRevenuePotential = (analytics) => {
  // Base assumptions for POD business
  const avgPricePoint = 24.99;
  const trafficPerImage = 100; // monthly visits per image
  const totalTraffic = Object.keys(analytics.personaDistribution).length > 0 ? 
    analytics.totalItems * trafficPerImage : 0;
  
  const conversions = (totalTraffic * (analytics.estimatedConversionRate / 100));
  const grossRevenue = conversions * avgPricePoint;
  const netRevenue = grossRevenue * 0.68; // 68% profit margin after costs
  
  return Math.round(netRevenue);
};

/**
 * Calculate portfolio performance metrics
 */
const calculatePortfolioMetrics = (analytics) => {
  const metrics = {
    diversificationScore: 0,
    marketCoverage: 0,
    conversionOptimization: 0,
    seoEffectiveness: 0,
    overallScore: 0
  };
  
  // Diversification Score (0-100)
  const personaCount = Object.keys(analytics.personaDistribution).length;
  metrics.diversificationScore = Math.min((personaCount / 4) * 100, 100);
  
  // Market Coverage (0-100)
  const totalPersonas = 4; // Total available personas
  metrics.marketCoverage = (personaCount / totalPersonas) * 100;
  
  // Conversion Optimization (0-100)
  metrics.conversionOptimization = Math.min((analytics.estimatedConversionRate / 15) * 100, 100);
  
  // SEO Effectiveness (0-100)
  const keywordCount = Object.keys(analytics.topKeywords).length;
  metrics.seoEffectiveness = Math.min((keywordCount / 100) * 100, 100);
  
  // Overall Portfolio Score
  metrics.overallScore = Math.round(
    (metrics.diversificationScore * 0.3 + 
     metrics.marketCoverage * 0.25 + 
     metrics.conversionOptimization * 0.3 + 
     metrics.seoEffectiveness * 0.15)
  );
  
  return metrics;
};

/**
 * Calculate content diversity score
 */
const calculateDiversityScore = (analytics) => {
  const personaCount = Object.keys(analytics.personaDistribution).length;
  const captionCategoryCount = Object.keys(analytics.captionCategoryDistribution).length;
  const titleCategoryCount = Object.keys(analytics.titleCategoryDistribution).length;
  
  // Normalize to 0-100 scale
  const maxPersonas = 4;
  const maxCategories = 3;
  
  const personaScore = (personaCount / maxPersonas) * 40;
  const captionScore = (captionCategoryCount / maxCategories) * 30;
  const titleScore = (titleCategoryCount / maxCategories) * 30;
  
  return Math.round(personaScore + captionScore + titleScore);
};

/**
 * Get the most targeted persona from distribution
 */
const getTopPersona = (personaDistribution) => {
  return Object.entries(personaDistribution)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general';
};

/**
 * Format persona name for display
 */
const formatPersonaName = (persona) => {
  const nameMap = {
    'CORPORATE_EXECUTIVE': 'Corporate Executives',
    'HOME_DECORATOR': 'Home Decorators', 
    'WELLNESS_SEEKER': 'Wellness Seekers',
    'GIFT_BUYER': 'Gift Buyers',
    'general': 'General Market'
  };
  
  return nameMap[persona] || persona;
};

/**
 * Calculate seasonal relevance score
 */
const calculateSeasonalRelevance = (seasonalRelevance) => {
  const yearRoundCount = seasonalRelevance['year-round'] || 0;
  const total = Object.values(seasonalRelevance).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) return 0;
  
  // Year-round content gets higher score for consistent sales
  const yearRoundScore = (yearRoundCount / total) * 70;
  const seasonalScore = ((total - yearRoundCount) / total) * 30;
  
  return Math.round(yearRoundScore + seasonalScore);
};

/**
 * Get real-time performance predictions
 */
export const getPerformancePredictions = (images, timeframe = 'month') => {
  const analytics = analyzeImageCollection(images);
  
  const multipliers = {
    week: 0.25,
    month: 1,
    quarter: 3,
    year: 12
  };
  
  const multiplier = multipliers[timeframe] || 1;
  const baseRevenue = calculateRevenuePotential(analytics.analytics);
  
  return {
    timeframe,
    projectedRevenue: Math.round(baseRevenue * multiplier),
    projectedSales: Math.round((baseRevenue * multiplier) / 24.99),
    conversionRate: analytics.summary.averageConversion,
    marketReach: calculateMarketReach(analytics),
    confidenceLevel: calculateConfidenceLevel(analytics)
  };
};

/**
 * Calculate potential market reach
 */
const calculateMarketReach = (analytics) => {
  const personaReach = {
    'CORPORATE_EXECUTIVE': 12000000, // Estimated US market
    'HOME_DECORATOR': 45000000,
    'WELLNESS_SEEKER': 38000000,
    'GIFT_BUYER': 55000000
  };
  
  const targetedPersonas = Object.keys(analytics.summary.averageConversion > 0 ? 
    analytics.analytics.personaDistribution : {});
  
  const totalReach = targetedPersonas.reduce((total, persona) => {
    return total + (personaReach[persona] || 0);
  }, 0);
  
  return Math.round(totalReach * 0.001); // 0.1% market penetration assumption
};

/**
 * Calculate prediction confidence level
 */
const calculateConfidenceLevel = (analytics) => {
  const factors = {
    sampleSize: Math.min(analytics.summary.totalImages / 20, 1) * 30,
    diversity: (analytics.summary.diversityScore / 100) * 25,
    conversion: Math.min(analytics.summary.averageConversion / 15, 1) * 25,
    seo: Math.min(analytics.summary.keywordCoverage / 50, 1) * 20
  };
  
  return Math.round(Object.values(factors).reduce((sum, factor) => sum + factor, 0));
};

export default {
  analyzeImageCollection,
  getPerformancePredictions
};