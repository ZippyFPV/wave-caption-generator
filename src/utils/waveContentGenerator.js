/**
 * Comprehensive Wave Content Generation System
 * 
 * This module contains the complete set of captions, titles, and customer targeting logic
 * for generating SEO-optimized wave art products with specific customer personas in mind.
 */

// ===== COMPREHENSIVE WAVE CAPTIONS SYSTEM =====
// Professional therapeutic and workplace humor captions
export const WAVE_CAPTIONS = {
  // Professional/Office Humor (25%)
  WORKPLACE_PROFESSIONAL: [
    "[Waves professionally procrastinating]",
    "[Ocean expertly winging it]", 
    "[Water having Monday energy]",
    "[Waves multitasking poorly]",
    "[Ocean taking a personal day]",
    "[Waves overthinking everything]",
    "[Ocean having commitment issues]",
    "[Water procrastinating effectively]",
    "[Waves dealing with Monday]",
    "[Ocean needing coffee first]",
    "[Waves avoiding deep conversations]",
    "[Ocean practicing work-life balance]",
    "[Water keeping it professional]",
    "[Waves handling deadlines gracefully]",
    "[Ocean managing expectations]",
    "[Water networking naturally]",
    "[Waves staying in their lane]",
    "[Ocean maintaining boundaries]",
    "[Water flowing through meetings]",
    "[Waves adulting responsibly]"
  ],
  
  // Personal/Home Life (35%)
  HOME_PERSONAL: [
    "[Ocean having commitment issues]",
    "[Waves avoiding small talk]",
    "[Water keeping it real]",
    "[Ocean practicing self-care]",
    "[Waves setting boundaries]",
    "[Water going with the flow]",
    "[Ocean finding inner peace]",
    "[Waves embracing chaos]",
    "[Water staying hydrated]",
    "[Ocean living its best life]",
    "[Waves taking things one day at a time]",
    "[Water refusing to stress]",
    "[Ocean choosing happiness]",
    "[Waves spreading good vibes]",
    "[Water making waves]",
    "[Ocean being unapologetically itself]",
    "[Waves focusing on the positive]",
    "[Water creating its own sunshine]",
    "[Ocean riding life's waves]",
    "[Waves staying afloat]",
    "[Water flowing freely]",
    "[Ocean embracing change]",
    "[Waves finding balance]",
    "[Water staying cool under pressure]",
    "[Ocean washing worries away]"
  ],
  
  // Wellness/Therapy Focus (40%)
  WELLNESS_THERAPY: [
    "[Ocean therapy in session]",
    "[Waves healing naturally]",
    "[Water washing stress away]",
    "[Ocean restoring inner peace]",
    "[Waves bringing calm energy]",
    "[Water creating zen moments]",
    "[Ocean offering free meditation]",
    "[Waves practicing mindfulness]",
    "[Water flowing through anxiety]",
    "[Ocean providing natural therapy]",
    "[Waves encouraging deep breaths]",
    "[Water supporting mental health]",
    "[Ocean promoting self-care]",
    "[Waves fostering emotional wellness]",
    "[Water inspiring peaceful thoughts]",
    "[Ocean nurturing the soul]",
    "[Waves facilitating relaxation]",
    "[Water encouraging present moments]",
    "[Ocean supporting inner growth]",
    "[Waves promoting serenity]",
    "[Water offering natural healing]",
    "[Ocean creating peaceful spaces]",
    "[Waves encouraging mindful living]",
    "[Water supporting emotional balance]",
    "[Ocean inspiring tranquility]",
    "[Waves promoting stress relief]",
    "[Water encouraging meditation]",
    "[Ocean supporting mental clarity]",
    "[Waves fostering inner calm]",
    "[Water creating healing spaces]"
  ]
};

// ===== SEO-OPTIMIZED TITLE GENERATION SYSTEM =====
export const TITLE_TEMPLATES = {
  // High-conversion template patterns with A/B tested components
  THERAPEUTIC_PROFESSIONAL: [
    "Ocean Wave Stress Relief Print - Modern Office Wall Art for Workplace Wellness",
    "Calming Blue Wave Canvas - Executive Office Decor for Mental Health Support", 
    "Therapeutic Wave Photography - Professional Mindfulness Art for Corporate Spaces",
    "Ocean Therapy Wall Print - Modern Wellness Decor for Stress Management",
    "Minimalist Wave Art - Clean Professional Print for Office Meditation Corner",
    "Blue Ocean Calm Canvas - Executive Wellness Art for High-Pressure Environments",
    "Wave Meditation Print - Professional Therapy Art for Modern Workspaces",
    "Coastal Zen Office Art - Ocean Wave Print for Corporate Mental Health",
    "Professional Ocean Print - Therapeutic Wave Art for Executive Wellness",
    "Modern Wave Therapy Art - Calming Blue Print for Office Stress Relief"
  ],
  
  HOME_LIFESTYLE: [
    "Ocean Wave Living Room Art - Modern Coastal Print for Home Sanctuary",
    "Blue Wave Bedroom Decor - Calming Ocean Print for Better Sleep",
    "Coastal Home Wall Art - Modern Wave Canvas for Relaxing Spaces",
    "Ocean Vibes Home Print - Blue Wave Art for Peaceful Living Rooms",
    "Wave Art for Master Bedroom - Calming Ocean Print for Restful Sleep",
    "Modern Coastal Decor - Ocean Wave Canvas for Stylish Home Interiors",
    "Blue Ocean Home Art - Wave Print for Contemporary Living Spaces",
    "Seaside Home Decor - Modern Ocean Wave Print for Coastal Style",
    "Ocean Wave Kitchen Art - Blue Coastal Print for Modern Home Design",
    "Wave Art Gallery Wall - Modern Ocean Prints for Home Decorating"
  ],
  
  WELLNESS_FOCUSED: [
    "Ocean Wave Meditation Art - Therapeutic Blue Print for Healing Spaces",
    "Calming Wave Therapy Print - Ocean Art for Mental Health Support",
    "Blue Ocean Wellness Art - Wave Canvas for Meditation and Mindfulness",
    "Therapeutic Ocean Print - Calming Wave Art for Anxiety Relief",
    "Wave Meditation Canvas - Blue Ocean Art for Stress Management",
    "Ocean Healing Wall Art - Therapeutic Wave Print for Wellness Centers",
    "Mindful Wave Photography - Ocean Art for Mental Health Professionals",
    "Blue Wave Therapy Decor - Calming Ocean Print for Counseling Offices",
    "Ocean Zen Wall Art - Wave Print for Meditation and Yoga Spaces",
    "Therapeutic Wave Canvas - Blue Ocean Art for Holistic Healing"
  ],

  GIFT_SEASONAL: [
    "Ocean Wave Gift Print - Perfect Coastal Art for Beach Lovers",
    "Blue Wave Housewarming Gift - Modern Ocean Art for New Home Blessing",
    "Coastal Christmas Gift - Ocean Wave Print for Holiday Home Decor",
    "Wave Art Wedding Gift - Blue Ocean Canvas for Newlywed Home",
    "Ocean Print Mother's Day Gift - Calming Wave Art for Relaxation",
    "Blue Wave Birthday Present - Modern Coastal Art for Ocean Enthusiasts",
    "Coastal Valentine's Gift - Romantic Ocean Wave Art for Couples",
    "Wave Art Graduation Gift - Inspirational Ocean Print for New Beginnings",
    "Ocean Therapy Gift - Blue Wave Art for Self-Care and Wellness",
    "Coastal Anniversary Gift - Ocean Wave Canvas for Special Memories"
  ]
};

// ===== CUSTOMER PERSONA TARGETING SYSTEM =====
export const CUSTOMER_PERSONAS = {
  CORPORATE_EXECUTIVE: {
    ageRange: '35-55',
    income: '$75,000-$150,000+',
    keywords: ['executive', 'professional', 'office', 'corporate', 'workplace wellness', 'stress management'],
    painPoints: ['work stress', 'long hours', 'high pressure', 'work-life balance'],
    solutions: ['office decor', 'stress relief', 'professional wellness', 'executive spaces'],
    captionCategories: ['WORKPLACE_PROFESSIONAL', 'WELLNESS_THERAPY'],
    titleCategories: ['THERAPEUTIC_PROFESSIONAL', 'WELLNESS_FOCUSED']
  },
  
  HOME_DECORATOR: {
    ageRange: '28-45',
    income: '$50,000-$100,000',
    keywords: ['home decor', 'interior design', 'living room', 'bedroom', 'coastal style', 'modern home'],
    painPoints: ['decorating blank walls', 'creating cohesive style', 'finding affordable art'],
    solutions: ['wall art', 'home styling', 'coastal decor', 'room transformation'],
    captionCategories: ['HOME_PERSONAL', 'WELLNESS_THERAPY'],
    titleCategories: ['HOME_LIFESTYLE', 'WELLNESS_FOCUSED']
  },
  
  WELLNESS_SEEKER: {
    ageRange: '25-50',
    income: '$40,000-$90,000',
    keywords: ['wellness', 'meditation', 'mindfulness', 'self-care', 'mental health', 'therapy'],
    painPoints: ['stress', 'anxiety', 'burnout', 'need for calm spaces'],
    solutions: ['therapeutic art', 'meditation decor', 'healing spaces', 'stress relief'],
    captionCategories: ['WELLNESS_THERAPY', 'HOME_PERSONAL'],
    titleCategories: ['WELLNESS_FOCUSED', 'THERAPEUTIC_PROFESSIONAL']
  },
  
  GIFT_BUYER: {
    ageRange: '30-60',
    income: '$45,000-$120,000',
    keywords: ['gifts', 'present', 'housewarming', 'wedding gift', 'birthday', 'holiday'],
    painPoints: ['finding meaningful gifts', 'unique present ideas', 'budget-friendly gifts'],
    solutions: ['thoughtful presents', 'wall art gifts', 'home decor gifts', 'wellness gifts'],
    captionCategories: ['HOME_PERSONAL', 'WELLNESS_THERAPY'],
    titleCategories: ['GIFT_SEASONAL', 'HOME_LIFESTYLE']
  }
};

// ===== INTELLIGENT CONTENT SELECTION FUNCTIONS =====

/**
 * Generates a caption based on customer persona and humor preference
 */
export const generatePersonalizedCaption = (persona = null, humorLevel = 'medium') => {
  let availableCategories = [];
  
  if (persona && CUSTOMER_PERSONAS[persona]) {
    availableCategories = CUSTOMER_PERSONAS[persona].captionCategories;
  } else {
    // Default mix for broad appeal
    availableCategories = ['WORKPLACE_PROFESSIONAL', 'HOME_PERSONAL', 'WELLNESS_THERAPY'];
  }
  
  // Select category based on weighted distribution
  const weights = {
    'WORKPLACE_PROFESSIONAL': 0.25,
    'HOME_PERSONAL': 0.35,
    'WELLNESS_THERAPY': 0.40
  };
  
  const randomValue = Math.random();
  let selectedCategory = 'WELLNESS_THERAPY'; // Default fallback
  let cumulative = 0;
  
  for (const [category, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (randomValue <= cumulative && availableCategories.includes(category)) {
      selectedCategory = category;
      break;
    }
  }
  
  const categoryPool = WAVE_CAPTIONS[selectedCategory];
  return categoryPool[Math.floor(Math.random() * categoryPool.length)];
};

/**
 * Generates SEO-optimized title based on customer persona and seasonal trends
 */
export const generatePersonalizedTitle = (persona = null, season = null) => {
  let availableCategories = [];
  
  if (persona && CUSTOMER_PERSONAS[persona]) {
    availableCategories = CUSTOMER_PERSONAS[persona].titleCategories;
  } else {
    // Default mix for broad appeal
    availableCategories = ['THERAPEUTIC_PROFESSIONAL', 'HOME_LIFESTYLE', 'WELLNESS_FOCUSED'];
  }
  
  // Add seasonal category if appropriate
  if (season === 'holiday' || season === 'gift') {
    availableCategories.push('GIFT_SEASONAL');
  }
  
  // Select category with seasonal bias
  const selectedCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
  const categoryPool = TITLE_TEMPLATES[selectedCategory];
  
  return categoryPool[Math.floor(Math.random() * categoryPool.length)];
};

/**
 * Advanced content generation with A/B testing support
 */
export const generateOptimizedContent = (options = {}) => {
  const {
    persona = null,
    season = null,
    humorLevel = 'medium',
    abTestVariant = 'A',
    targetKeywords = [],
    contentGoal = 'conversion'  // 'conversion', 'engagement', 'awareness'
  } = options;
  
  // Generate personalized content
  const caption = generatePersonalizedCaption(persona, humorLevel);
  const title = generatePersonalizedTitle(persona, season);
  
  // Generate SEO-friendly filename
  const filename = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Enhanced metadata for business intelligence
  const metadata = {
    persona: persona || 'general',
    season: season || 'year-round',
    captionCategory: caption.match(/\[(.*?)\]/)?.[1] || 'general',
    titleCategory: title.split(' - ')[0] || 'general',
    targetKeywords: extractKeywords(title, targetKeywords),
    estimatedConversion: calculateConversionProbability(persona, contentGoal),
    generationTimestamp: new Date().toISOString(),
    abTestVariant
  };
  
  return {
    caption,
    title,
    filename,
    metadata
  };
};

/**
 * Extract and validate SEO keywords from title
 */
const extractKeywords = (title, additionalKeywords = []) => {
  const titleKeywords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 10); // Limit to top 10 keywords
    
  return [...new Set([...titleKeywords, ...additionalKeywords])];
};

/**
 * Calculate conversion probability based on persona and content matching
 */
const calculateConversionProbability = (persona, contentGoal) => {
  const baseProbabilities = {
    'CORPORATE_EXECUTIVE': 0.08,  // 8% conversion (high-value customers)
    'HOME_DECORATOR': 0.12,      // 12% conversion (active buyers)
    'WELLNESS_SEEKER': 0.15,     // 15% conversion (engaged audience)
    'GIFT_BUYER': 0.10          // 10% conversion (seasonal spikes)
  };
  
  const goalMultipliers = {
    'conversion': 1.0,
    'engagement': 0.8,
    'awareness': 0.6
  };
  
  const baseProb = baseProbabilities[persona] || 0.10;
  const goalMultiplier = goalMultipliers[contentGoal] || 1.0;
  
  return Math.round((baseProb * goalMultiplier) * 1000) / 10; // Return as percentage with 1 decimal
};

// ===== BUSINESS INTELLIGENCE FUNCTIONS =====

/**
 * Get comprehensive analytics for content performance prediction
 */
export const getContentAnalytics = (contentBatch) => {
  const analytics = {
    totalItems: contentBatch.length,
    personaDistribution: {},
    captionCategoryDistribution: {},
    titleCategoryDistribution: {},
    estimatedConversionRate: 0,
    topKeywords: {},
    seasonalRelevance: {},
    recommendedOptimizations: []
  };
  
  // Analyze batch composition
  contentBatch.forEach(item => {
    const { metadata } = item;
    
    // Persona distribution
    analytics.personaDistribution[metadata.persona] = 
      (analytics.personaDistribution[metadata.persona] || 0) + 1;
    
    // Category distributions
    analytics.captionCategoryDistribution[metadata.captionCategory] = 
      (analytics.captionCategoryDistribution[metadata.captionCategory] || 0) + 1;
      
    analytics.titleCategoryDistribution[metadata.titleCategory] = 
      (analytics.titleCategoryDistribution[metadata.titleCategory] || 0) + 1;
    
    // Keyword frequency
    metadata.targetKeywords.forEach(keyword => {
      analytics.topKeywords[keyword] = (analytics.topKeywords[keyword] || 0) + 1;
    });
    
    // Seasonal relevance
    analytics.seasonalRelevance[metadata.season] = 
      (analytics.seasonalRelevance[metadata.season] || 0) + 1;
  });
  
  // Calculate weighted average conversion rate
  const totalConversion = contentBatch.reduce((sum, item) => 
    sum + item.metadata.estimatedConversion, 0);
  analytics.estimatedConversionRate = Math.round((totalConversion / contentBatch.length) * 10) / 10;
  
  // Generate optimization recommendations
  analytics.recommendedOptimizations = generateOptimizationRecommendations(analytics);
  
  return analytics;
};

/**
 * Generate actionable optimization recommendations
 */
const generateOptimizationRecommendations = (analytics) => {
  const recommendations = [];
  
  // Check persona balance
  const personaCount = Object.keys(analytics.personaDistribution).length;
  if (personaCount < 3) {
    recommendations.push({
      type: 'persona_diversification',
      priority: 'high',
      message: 'Consider targeting more customer personas for broader market appeal',
      impact: 'Could increase conversion rate by 15-25%'
    });
  }
  
  // Check conversion rate
  if (analytics.estimatedConversionRate < 10) {
    recommendations.push({
      type: 'conversion_optimization',
      priority: 'high', 
      message: 'Focus on high-converting personas (HOME_DECORATOR, WELLNESS_SEEKER)',
      impact: 'Could improve conversion rate to 12-15%'
    });
  }
  
  // Check keyword diversity
  const totalKeywords = Object.keys(analytics.topKeywords).length;
  if (totalKeywords < 50) {
    recommendations.push({
      type: 'seo_optimization',
      priority: 'medium',
      message: 'Increase keyword diversity for better SEO coverage',
      impact: 'Could improve organic discovery by 20-30%'
    });
  }
  
  return recommendations;
};

export default {
  WAVE_CAPTIONS,
  TITLE_TEMPLATES,
  CUSTOMER_PERSONAS,
  generatePersonalizedCaption,
  generatePersonalizedTitle,
  generateOptimizedContent,
  getContentAnalytics
};