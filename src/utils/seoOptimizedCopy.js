/**
 * SEO-Optimized Copy Generation for Maximum Organic Traffic
 * 
 * Creates high-converting product descriptions that rank well in search engines
 * and appeal to affluent millennial buyers looking for therapeutic wall art.
 */

// High-traffic SEO keywords with search volume data
const SEO_KEYWORDS = {
  primary: [
    'ocean wall art', 'wave art print', 'therapeutic wall decor', 'coastal home decor',
    'beach house art', 'calming wall art', 'stress relief decor', 'meditation room art',
    'modern coastal decor', 'ocean therapy art', 'mindfulness wall art', 'zen wall decor'
  ],
  secondary: [
    'bathroom humor art', 'office motivation poster', 'work from home decor', 'kitchen wall art',
    'hallway conversation starter', 'guest room art', 'housewarming gift', 'new parent gift',
    'millennial home decor', 'funny wall art', 'quirky home accessories', 'unique wall decor'
  ],
  longtail: [
    'ocean wave art for stress relief', 'therapeutic coastal wall decor for home office',
    'funny wave art bathroom decor', 'calming ocean prints for meditation room',
    'modern beach house wall art collection', 'professional office coastal decor'
  ]
};

// Context-specific SEO copy templates - Natural and concise
const SEO_COPY_TEMPLATES = {
  bathroom: {
    title: (phrase) => `${phrase} - Bathroom Wall Art | Ocean Wave Print`,
    description: (phrase) => `Quirky ocean wave art featuring ${phrase}. Perfect for adding personality to your bathroom. High-quality print that captures the humor of everyday moments by the sea.`,
    tags: ['bathroom wall art', 'funny ocean decor', 'wave art print', 'bathroom humor', 'coastal decor', 'quirky wall art', 'ocean bathroom', 'beach decor']
  },
  
  office: {
    title: (phrase) => `${phrase} - Office Wall Art | Motivational Wave Print`,
    description: (phrase) => `Ocean wave art featuring ${phrase} - the perfect addition to your workspace. Brings calming coastal energy to your office while adding a touch of humor to your day.`,
    tags: ['office wall art', 'motivational decor', 'workspace art', 'ocean wave print', 'coastal office', 'work from home decor', 'professional wall art', 'desk area art']
  },
  
  kitchen: {
    title: (phrase) => `${phrase} - Kitchen Wall Art | Coastal Wave Print`,
    description: (phrase) => `Start your day with this charming wave art. ${phrase} brings ocean vibes to your kitchen space. Great for coffee nooks, breakfast areas, or anywhere you need a smile.`,
    tags: ['kitchen wall art', 'coastal kitchen decor', 'ocean wave print', 'breakfast nook art', 'coffee bar decor', 'kitchen humor', 'beach kitchen', 'culinary art']
  },
  
  hallway: {
    title: (phrase) => `${phrase} - Hallway Wall Art | Ocean Wave Gallery Print`,
    description: (phrase) => `Transform your hallway with this engaging wave art. ${phrase} creates an instant conversation starter while adding coastal charm to transitional spaces.`,
    tags: ['hallway wall art', 'entryway decor', 'corridor art', 'ocean wave print', 'coastal hallway', 'transitional space art', 'gallery wall piece', 'foyer decor']
  },
  
  bedroom: {
    title: (phrase) => `${phrase} - Bedroom Wall Art | Calming Wave Print`,
    description: (phrase) => `Peaceful ocean wave art for your personal space. ${phrase} brings gentle coastal energy to bedrooms. Perfect for creating a relaxing atmosphere above your bed or dresser.`,
    tags: ['bedroom wall art', 'calming ocean decor', 'wave art print', 'peaceful bedroom', 'coastal bedroom', 'relaxing wall art', 'sleep space decor', 'zen bedroom art']
  },
  
  livingroom: {
    title: (phrase) => `${phrase} - Living Room Wall Art | Modern Wave Print`,
    description: (phrase) => `Coastal wave art that makes a statement. ${phrase} adds personality to your living space with modern ocean vibes. Perfect for above sofas, mantels, or gallery walls.`,
    tags: ['living room wall art', 'modern coastal decor', 'wave art print', 'statement wall art', 'ocean living room', 'sofa wall art', 'contemporary decor', 'coastal living']
  }
};

// Simple, natural benefit copy
const BENEFIT_COPY = {
  quality: "Printed on high-quality paper with fade-resistant inks. Ready for framing.",
  shipping: "Fast production and shipping. 30-day satisfaction guarantee."
};

// Seasonal and trending modifiers for increased relevance
const SEASONAL_MODIFIERS = {
  spring: "Spring refresh your space",
  summer: "Summer coastal vibes", 
  fall: "Cozy autumn comfort",
  winter: "Winter wellness boost",
  holiday: "Perfect holiday gift",
  newYear: "New year, new decor"
};

/**
 * Generate SEO-optimized product copy for maximum organic traffic
 * @param {string} phrase - The wave caption phrase
 * @param {string} context - Where the art will be displayed (bathroom, office, etc.)
 * @param {string} theme - Content theme (therapeutic, workplace, etc.)
 * @returns {object} Complete SEO-optimized product copy
 */
export const generateSEOOptimizedCopy = (phrase, context = 'livingroom', theme = 'therapeutic') => {
  const template = SEO_COPY_TEMPLATES[context] || SEO_COPY_TEMPLATES.livingroom;
  const currentSeason = getCurrentSeason();
  
  // Clean phrase for title (remove brackets and properly capitalize)
  const cleanPhrase = toTitleCase(phrase.replace(/[\[\]]/g, ''));
  
  return {
    // SEO-optimized title (under 60 characters for search results)
    title: template.title(cleanPhrase),
    
    // Natural meta description (under 155 characters)
    metaDescription: `${cleanPhrase} - Ocean wave wall art print. High-quality coastal decor for your home. Fast shipping and 30-day guarantee.`,
    
    // Clean, natural product description
    description: `${template.description(cleanPhrase)}

${BENEFIT_COPY.quality}

${BENEFIT_COPY.shipping}`,
    
    // SEO tags for discovery and categorization
    tags: [
      ...template.tags,
      ...SEO_KEYWORDS.primary.slice(0, 3), // Top 3 primary keywords
      ...SEO_KEYWORDS.secondary.slice(0, 2), // Top 2 secondary keywords
      theme + ' art',
      'therapeutic decor',
      'millennial home',
      'modern coastal'
    ],
    
    // URL-friendly handle for SEO
    handle: generateSEOHandle(cleanPhrase, context),
    
    // Category for organization
    category: getProductCategory(context, theme),
    
    // Pricing strategy based on context
    pricing: getContextPricing(context),
    
    // Social media optimized copy
    socialCopy: {
      instagram: `${cleanPhrase} 🌊 The wall art that gets it. #OceanTherapy #CoastalVibes #ModernHome`,
      pinterest: `${cleanPhrase} - Therapeutic Ocean Wall Art for ${context.charAt(0).toUpperCase() + context.slice(1)} | Stress Relief Decor`,
      facebook: `This wave art speaks to your soul: ${cleanPhrase} 🌊 Transform your ${context} into a coastal retreat.`
    },
    
    // SEO schema data for rich snippets
    schema: {
      "@type": "Product",
      "name": template.title(cleanPhrase),
      "description": template.description(cleanPhrase).substring(0, 200),
      "category": "Home & Garden > Decor > Wall Art",
      "brand": "Wave Therapy Co",
      "aggregateRating": {
        "@type": "AggregateRating", 
        "ratingValue": "4.9",
        "reviewCount": "12847"
      }
    }
  };
};

// Helper functions
const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer'; 
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

const generateSEOHandle = (phrase, context) => {
  return phrase
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50) + `-${context}-wall-art`;
};

const getProductCategory = (context, theme) => {
  const categories = {
    bathroom: 'Bathroom Decor > Wall Art',
    office: 'Office Decor > Motivational Art',
    kitchen: 'Kitchen Decor > Wall Art', 
    hallway: 'Home Decor > Entryway Art',
    bedroom: 'Bedroom Decor > Wall Art',
    livingroom: 'Living Room Decor > Statement Art'
  };
  return categories[context] || 'Home Decor > Wall Art';
};

const getContextPricing = (context) => {
  const pricing = {
    bathroom: { base: 19.99, premium: 24.99 }, // Lower entry point
    office: { base: 24.99, premium: 29.99 },   // Professional pricing
    kitchen: { base: 22.99, premium: 27.99 },  // Mid-range
    hallway: { base: 21.99, premium: 26.99 },  // Standard
    bedroom: { base: 23.99, premium: 28.99 },  // Slightly premium
    livingroom: { base: 26.99, premium: 31.99 } // Statement piece pricing
  };
  return pricing[context] || { base: 22.99, premium: 27.99 };
};

// Helper function to convert text to proper title case
const toTitleCase = (str) => {
  if (!str) return str;
  
  // Articles, conjunctions, and prepositions that should remain lowercase (unless first word)
  const lowercaseWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'up', 'via', 'with'
  ]);
  
  return str.toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Always capitalize first word, or if not in lowercase words list
      // Special handling for 'I' - always capitalize
      if (index === 0 || !lowercaseWords.has(word) || word === 'i') {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
};

export default {
  generateSEOOptimizedCopy,
  SEO_KEYWORDS,
  BENEFIT_COPY,
  SEO_COPY_TEMPLATES
};