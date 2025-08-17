/**
 * Full Automation Service - The Big Red Button System
 * 
 * Handles complete end-to-end automation from image generation 
 * to live Shopify products with API rate limiting and error recovery.
 */

import { generateCaptionPhrase } from '../utils/phraseComponents.js';
import { generateSEOOptimizedCopy } from '../utils/seoOptimizedCopy.js';
import { listingTracker } from './listingTracker.js';
import analytics from './analytics.js';

// API Rate limits (requests per time period)
const RATE_LIMITS = {
  pexels: { requests: 200, period: 3600000 }, // 200/hour
  printify: { requests: 600, period: 60000 }, // 600/minute  
  shopify: { requests: 200, period: 1800000 }  // 200/30min
};

// Rate limiting state
let rateLimitState = {
  pexels: { requests: 0, resetTime: Date.now() + RATE_LIMITS.pexels.period },
  printify: { requests: 0, resetTime: Date.now() + RATE_LIMITS.printify.period },
  shopify: { requests: 0, resetTime: Date.now() + RATE_LIMITS.shopify.period }
};

// Automation scales
export const AUTOMATION_SCALES = {
  SINGLE: { name: 'Single Listing', count: 1, description: 'Create 1 complete listing' },
  BATCH: { name: '10 Listings', count: 10, description: 'Create 10 complete listings' },
  CONTINUOUS: { name: 'Continuous', count: Infinity, description: 'Keep generating until stopped' }
};

// Comprehensive market category distribution for maximum penetration
const CONTEXT_DISTRIBUTION = [
  // Residential Spaces (12)
  'bathroom', 'office', 'kitchen', 'hallway', 'bedroom', 'livingroom',
  'dining-room', 'guest-room', 'master-bedroom', 'kids-room', 'nursery', 'home-office',
  
  // Commercial Spaces (8)
  'restaurant', 'hotel', 'spa', 'clinic', 'dental-office', 'waiting-room', 'conference-room', 'reception',
  
  // Wellness & Healthcare (6)
  'yoga-studio', 'meditation-room', 'therapy-office', 'massage-room', 'wellness-center', 'fitness-studio',
  
  // Hospitality & Entertainment (6)
  'airbnb', 'vacation-rental', 'beach-house', 'cabin', 'resort', 'boutique-hotel',
  
  // Professional Services (8)
  'law-office', 'real-estate-office', 'consulting-office', 'startup-office', 'coworking-space', 'salon', 'barbershop', 'studio'
];

// Comprehensive tracking for all 40 market categories
let contextUsageTracker = {
  // Residential Spaces
  'bathroom': 0, 'office': 0, 'kitchen': 0, 'hallway': 0, 'bedroom': 0, 'livingroom': 0,
  'dining-room': 0, 'guest-room': 0, 'master-bedroom': 0, 'kids-room': 0, 'nursery': 0, 'home-office': 0,
  
  // Commercial Spaces  
  'restaurant': 0, 'hotel': 0, 'spa': 0, 'clinic': 0, 'dental-office': 0, 'waiting-room': 0, 'conference-room': 0, 'reception': 0,
  
  // Wellness & Healthcare
  'yoga-studio': 0, 'meditation-room': 0, 'therapy-office': 0, 'massage-room': 0, 'wellness-center': 0, 'fitness-studio': 0,
  
  // Hospitality & Entertainment
  'airbnb': 0, 'vacation-rental': 0, 'beach-house': 0, 'cabin': 0, 'resort': 0, 'boutique-hotel': 0,
  
  // Professional Services
  'law-office': 0, 'real-estate-office': 0, 'consulting-office': 0, 'startup-office': 0, 'coworking-space': 0, 'salon': 0, 'barbershop': 0, 'studio': 0
};

class FullAutomationService {
  constructor() {
    this.isRunning = false;
    this.currentProgress = {
      scale: null,
      completed: 0,
      errors: 0,
      currentStep: 'idle',
      startTime: null,
      estimatedCompletion: null
    };
    this.stopRequested = false;
    this.progressCallback = null;
  }

  /**
   * Get next context for balanced distribution
   */
  getNextBalancedContext() {
    // Find the context(s) with minimum usage
    const minUsage = Math.min(...Object.values(contextUsageTracker));
    const availableContexts = Object.entries(contextUsageTracker)
      .filter(([context, usage]) => usage === minUsage)
      .map(([context]) => context);
    
    // Randomly select from the least used contexts
    const selectedContext = availableContexts[Math.floor(Math.random() * availableContexts.length)];
    
    // Increment usage counter
    contextUsageTracker[selectedContext]++;
    
    console.log(`🎯 Selected context: ${selectedContext} (usage: ${contextUsageTracker[selectedContext]})`);
    
    // Log current distribution
    const total = Object.values(contextUsageTracker).reduce((sum, count) => sum + count, 0);
    const distribution = Object.entries(contextUsageTracker)
      .map(([context, count]) => `${context}: ${count} (${total > 0 ? ((count/total)*100).toFixed(1) : 0}%)`)
      .join(', ');
    console.log(`📊 Category Distribution: ${distribution}`);
    
    return selectedContext;
  }

  /**
   * Reset context distribution for new automation run
   */
  resetContextDistribution() {
    contextUsageTracker = {
      bathroom: 0,
      office: 0, 
      kitchen: 0,
      hallway: 0,
      bedroom: 0,
      livingroom: 0
    };
    console.log('🔄 Context distribution reset for new automation run');
  }

  /**
   * Start full automation with specified scale - Enhanced for overnight operation
   * @param {string} scale - SINGLE, BATCH, or CONTINUOUS
   * @param {function} progressCallback - Called with progress updates
   * @param {function} listingCallback - Called when each listing is created/updated
   */
  async startAutomation(scale, progressCallback = null, listingCallback = null) {
    if (this.isRunning) {
      throw new Error('Automation already running');
    }

    this.isRunning = true;
    this.stopRequested = false;
    this.progressCallback = progressCallback;
    this.listingCallback = listingCallback;
    this.createdListings = []; // Track all created listings
    this.currentProgress = {
      scale: scale,
      completed: 0,
      errors: 0,
      currentStep: 'initializing',
      startTime: Date.now(),
      estimatedCompletion: this.calculateEstimatedCompletion(scale),
      currentListing: null
    };

    try {
      console.log(`🚀 Starting ${scale} automation with enhanced error handling...`);
      
      // Perform initial health check
      const healthCheck = await this.performHealthCheck();
      if (!healthCheck.allHealthy) {
        console.warn('⚠️ Some systems are unhealthy, but continuing...');
      }
      
      this.resetContextDistribution(); // Reset for balanced distribution
      this.reportProgress();

      const targetCount = AUTOMATION_SCALES[scale].count;
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 5;
      
      while (this.currentProgress.completed < targetCount && !this.stopRequested) {
        try {
          const listing = await this.createSingleListing();
          this.currentProgress.completed++;
          this.createdListings.push(listing);
          consecutiveErrors = 0; // Reset error counter on success
          
          // Report the completed listing
          if (this.listingCallback) {
            this.listingCallback(listing);
          }
          
          // Update estimated completion based on actual performance
          this.updateEstimatedCompletion();
          this.reportProgress();
          
          // Rate limiting delay between iterations
          await this.waitForRateLimit();
          
        } catch (error) {
          this.currentProgress.errors++;
          consecutiveErrors++;
          
          console.error(`❌ Automation error at listing ${this.currentProgress.completed + 1} (consecutive: ${consecutiveErrors}):`, error.message);
          
          // Report failed listing
          if (this.listingCallback) {
            this.listingCallback({
              listingId: `failed_${Date.now()}`,
              error: error.message,
              success: false,
              steps: {
                generating_image: 'error',
                creating_copy: 'error', 
                creating_product: 'error',
                publishing_shopify: 'error'
              }
            });
          }
          
          // Stop on critical errors or too many consecutive errors
          if (this.isCriticalError(error)) {
            console.error('🚨 Critical error detected, stopping automation');
            throw error;
          }
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.error(`🚨 Too many consecutive errors (${consecutiveErrors}), stopping automation`);
            throw new Error(`Automation stopped due to ${consecutiveErrors} consecutive errors. Last error: ${error.message}`);
          }
          
          // Longer delay after errors
          await new Promise(resolve => setTimeout(resolve, 5000));
          this.reportProgress();
        }
      }

      this.currentProgress.currentStep = 'completed';
      console.log(`✅ Automation completed: ${this.currentProgress.completed} listings created, ${this.currentProgress.errors} errors`);
      
      return {
        completed: this.currentProgress.completed,
        errors: this.currentProgress.errors,
        listings: this.createdListings
      };
      
    } catch (error) {
      this.currentProgress.currentStep = 'error';
      this.currentProgress.errorMessage = error.message;
      console.error('🚨 Automation failed:', error.message);
      throw error;
    } finally {
      this.isRunning = false;
      this.reportProgress();
    }
  }

  /**
   * Create a single complete listing through the entire pipeline
   */
  async createSingleListing() {
    const listingId = `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize listing with step tracking
    const listing = {
      listingId,
      startTime: Date.now(),
      steps: {
        generating_image: 'pending',
        creating_copy: 'pending',
        creating_product: 'pending',
        publishing_shopify: 'pending'
      },
      imageData: null,
      productCopy: null,
      printifyProduct: null,
      success: false
    };

    this.currentProgress.currentListing = listing;
    
    try {
      // Step 1: Generate wave image with caption
      this.currentProgress.currentStep = 'generating_image';
      listing.steps.generating_image = 'in_progress';
      this.reportProgress();
      if (this.listingCallback) this.listingCallback({...listing});
      
      const imageData = await this.generateWaveImage(listingId);
      listing.imageData = imageData;
      listing.steps.generating_image = 'completed';
      if (this.listingCallback) this.listingCallback({...listing});
      
      // Step 2: Create SEO-optimized copy
      this.currentProgress.currentStep = 'creating_copy';
      listing.steps.creating_copy = 'in_progress';
      this.reportProgress();
      if (this.listingCallback) this.listingCallback({...listing});
      
      const productCopy = this.generateProductCopy(imageData);
      listing.productCopy = productCopy;
      listing.steps.creating_copy = 'completed';
      if (this.listingCallback) this.listingCallback({...listing});
      
      // Step 3: Upload to Printify and create product
      this.currentProgress.currentStep = 'creating_product';
      listing.steps.creating_product = 'in_progress';
      this.reportProgress();
      if (this.listingCallback) this.listingCallback({...listing});
      
      const printifyProduct = await this.createPrintifyProduct(imageData, productCopy);
      listing.printifyProduct = printifyProduct;
      listing.printifyId = printifyProduct.id;
      listing.printifyUrl = `https://printify.com/app/products/${printifyProduct.id}`;
      listing.steps.creating_product = 'completed';
      if (this.listingCallback) this.listingCallback({...listing});
      
      // Step 4: Auto-publish to Shopify (already integrated in server)
      this.currentProgress.currentStep = 'publishing_shopify';
      listing.steps.publishing_shopify = 'in_progress';
      this.reportProgress();
      if (this.listingCallback) this.listingCallback({...listing});
      
      // Publishing happens automatically in server.js
      listing.steps.publishing_shopify = printifyProduct.published !== false ? 'completed' : 'warning';
      listing.published = printifyProduct.published !== false;
      listing.success = true;
      listing.completedTime = Date.now();
      
      // Comprehensive console logging
      console.log(`✅ LISTING COMPLETED #${this.currentProgress.completed + 1}`);
      console.log(`📝 Title: ${productCopy.title}`);
      console.log(`🎨 Caption: ${listing.imageData.caption}`);
      console.log(`🏠 Context: ${listing.imageData.context}`);
      console.log(`🆔 Printify ID: ${printifyProduct.id}`);
      console.log(`🔗 Product URL: https://printify.com/app/products/${printifyProduct.id}`);
      console.log(`📊 Published: ${listing.published ? 'YES' : 'NO'}`);
      console.log(`⏱️ Duration: ${((Date.now() - listing.startTime) / 1000).toFixed(1)}s`);
      console.log('─'.repeat(80));
      
      // Record in persistent tracker
      listing.source = 'automation';
      listingTracker.recordListing(listing);
      
      // Track conversion in analytics
      analytics.trackConversion('listing_created', {
        listing_id: listingId,
        caption: listing.imageData.caption,
        context: listing.imageData.context,
        wave_size: listing.imageData.waveSize,
        title: listing.productCopy.title,
        source: 'automation',
        success: true
      });
      
      // Log updated metrics
      const metrics = listingTracker.getMetrics();
      const distribution = listingTracker.getCategoryDistribution();
      console.log(`📈 TOTAL RECORDED LISTINGS: ${metrics.total} (${metrics.automation} automation, ${metrics.manual} manual)`);
      console.log(`📊 CURRENT DISTRIBUTION: ${Object.entries(distribution.byContext).map(([ctx, count]) => `${ctx}: ${count}`).join(', ')}`);
      
      if (this.listingCallback) this.listingCallback({...listing});
      return listing;
      
    } catch (error) {
      console.error(`❌ Failed to create listing ${listingId}:`, error.message);
      
      // Mark current step as failed
      const currentStep = this.currentProgress.currentStep;
      if (currentStep && listing.steps[currentStep]) {
        listing.steps[currentStep] = 'error';
      }
      listing.error = error.message;
      listing.success = false;
      
      if (this.listingCallback) this.listingCallback({...listing});
      throw error;
    }
  }

  /**
   * Generate wave image with appropriate caption - Enhanced with retry logic
   */
  async generateWaveImage(listingId) {
    await this.checkRateLimit('pexels');
    
    return await this.retryWithBackoff(async () => {
      // Fetch random wave image from Pexels
      const pexelsResponse = await fetch(`http://localhost:3001/api/pexels/search?query=ocean+waves&per_page=1&page=${Math.floor(Math.random() * 100) + 1}`);
      
      if (!pexelsResponse.ok) {
        throw new Error(`Pexels API failed: ${pexelsResponse.status}`);
      }
      
      const pexelsData = await pexelsResponse.json();
      const waveImage = pexelsData.photos[0];
      
      if (!waveImage) {
        throw new Error('No wave images found');
      }
      
      // Determine wave size and generate appropriate caption
      const waveSize = Math.random() > 0.7 ? 'big' : Math.random() > 0.3 ? 'small' : 'medium';
      const context = this.getNextBalancedContext(); // Use balanced context selection
      const caption = generateCaptionPhrase(waveSize, 'millennial_professional', context);
      
      // Process image with caption overlay using HIGHEST quality source
      const imageUrl = waveImage.src.original || waveImage.src.large2x || waveImage.src.large;
      const processedImageData = await this.addCaptionToImage(imageUrl, caption);
      
      this.incrementRateLimit('pexels');
      
      return {
        originalImage: waveImage,
        processedImage: processedImageData,
        caption,
        context,
        waveSize,
        metadata: {
          pexelsId: waveImage.id,
          photographer: waveImage.photographer,
          originalUrl: imageUrl, // Track the actual highest quality URL used
          qualityLevel: waveImage.src.original ? 'original' : waveImage.src.large2x ? 'large2x' : 'large'
        }
      };
    });
  }

  /**
   * Add caption overlay to image using canvas processing - PARALLEL processing for speed
   * Now processes multiple sizes for all variants simultaneously
   */
  async addCaptionToImage(imageUrl, caption) {
    return await this.retryWithBackoff(async () => {
      // Get variant size specifications for optimal image generation
      const variantSizes = this.getVariantSpecifications();
      
      // SPEED OPTIMIZATION: Process all variants in parallel instead of sequentially
      const processingPromises = Object.entries(variantSizes).map(async ([variantId, specs]) => {
        const response = await fetch('http://localhost:3001/api/process-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl,
            caption,
            width: specs.width,
            height: specs.height,
            variantId: variantId
          })
        });

        if (!response.ok) {
          throw new Error(`Image processing failed for variant ${variantId}: ${response.status}`);
        }

        const processedImage = await response.json();
        return [variantId, processedImage];
      });

      // Wait for all variants to process simultaneously (much faster!)
      const results = await Promise.all(processingPromises);
      const processedImages = Object.fromEntries(results);

      console.log(`⚡ SPEED: Processed ${Object.keys(processedImages).length} variants in parallel`);
      console.log(`🔥 QUALITY: Using highest resolution source (${processedImages['33742']?.metadata?.qualityLevel || 'unknown'})`);

      // Return the main size (14x11) as primary, but include all variants
      return {
        ...processedImages['33742'], // 14x11 as primary
        allVariants: processedImages
      };
    });
  }

  /**
   * Generate SEO-optimized product copy
   */
  generateProductCopy(imageData) {
    const seoOptimizedCopy = generateSEOOptimizedCopy(
      imageData.caption,
      imageData.context,
      'therapeutic'
    );
    
    return {
      ...seoOptimizedCopy,
      filename: this.generateFilename(imageData)
    };
  }

  /**
   * Create product on Printify with auto-publishing - Enhanced with retry logic
   */
  async createPrintifyProduct(imageData, productCopy) {
    await this.checkRateLimit('printify');
    
    return await this.retryWithBackoff(async () => {
      // SPEED OPTIMIZATION: Upload all variant images in parallel
      const uploadPromises = Object.entries(imageData.processedImage.allVariants).map(async ([variantId, processedImage]) => {
        const uploadResponse = await fetch('http://localhost:3001/api/printify/upload-image-base64', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: processedImage.dataUrl,
            filename: `${productCopy.filename}-${variantId}`
          })
        });

        if (!uploadResponse.ok) {
          throw new Error(`Image upload failed for variant ${variantId}: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();
        return [variantId, uploadResult];
      });

      // Wait for all uploads to complete simultaneously (much faster!)
      const uploadResults = await Promise.all(uploadPromises);
      const uploadedImages = Object.fromEntries(uploadResults);
      
      console.log(`⚡ SPEED: Uploaded ${Object.keys(uploadedImages).length} variant images in parallel`);
      
      // Create product with optimal 8-variant strategy for maximum profit
      const optimalVariants = this.getOptimalVariants(productCopy.pricing.base);
      
      // Create separate print areas for each variant with properly sized images
      const printAreas = optimalVariants.map(variant => ({
        variant_ids: [variant.id],
        placeholders: [{
          position: "front",
          images: [{
            id: uploadedImages[variant.id.toString()].id,
            x: 0.5,
            y: 0.5,
            scale: 1,
            angle: 0
          }]
        }]
      }));
      
      const productData = {
        title: productCopy.title,
        description: productCopy.description,
        blueprint_id: 97, // Satin Posters
        print_provider_id: 99, // Printify Choice
        variants: optimalVariants,
        print_areas: printAreas,
        tags: productCopy.tags
      };

      const productResponse = await fetch('http://localhost:3001/api/printify/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (!productResponse.ok) {
        throw new Error(`Product creation failed: ${productResponse.status}`);
      }

      this.incrementRateLimit('printify');
      
      return await productResponse.json();
    }, 3, 2000); // More retries and longer delay for Printify operations
  }

  /**
   * Generate SEO-friendly filename
   */
  generateFilename(imageData) {
    const cleanCaption = imageData.caption
      .replace(/[\[\]]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 40);
    
    return `${cleanCaption}-${imageData.context}-wall-art-${Date.now()}`;
  }

  /**
   * Get variant size specifications for proper image generation
   */
  getVariantSpecifications() {
    // Printify size specifications in pixels (300 DPI)
    return {
      '33742': { width: 4200, height: 3300, size: "14″ x 11″" },   // Landscape
      '33749': { width: 3300, height: 4200, size: "11″ x 14″" },   // Portrait
      '113155': { width: 4200, height: 4200, size: "14″ x 14″" },  // Square
      '33744': { width: 6000, height: 4800, size: "20″ x 16″" },   // Large landscape
      '33751': { width: 4800, height: 6000, size: "16″ x 20″" },   // Large portrait
      '33750': { width: 3600, height: 5400, size: "12″ x 18″" },   // Medium portrait
      '33745': { width: 7200, height: 5400, size: "24″ x 18″" },   // XL landscape
      '33752': { width: 5400, height: 7200, size: "18″ x 24″" }    // XL portrait
    };
  }

  /**
   * Get optimal 8 variants for maximum profit and appeal
   * Based on research: 5-15 variants optimal, focusing on popular sizes
   */
  getOptimalVariants(basePrice) {
    // Optimal size selection based on popularity and profit margins
    const optimalSizes = [
      { id: 33742, size: "14″ x 11″", popularity: "high", priceMultiplier: 1.0 },    // Most popular landscape
      { id: 33749, size: "11″ x 14″", popularity: "high", priceMultiplier: 1.0 },    // Most popular portrait
      { id: 113155, size: "14″ x 14″", popularity: "high", priceMultiplier: 1.1 },  // Square format
      { id: 33744, size: "20″ x 16″", popularity: "medium", priceMultiplier: 1.4 }, // Larger landscape
      { id: 33751, size: "16″ x 20″", popularity: "medium", priceMultiplier: 1.4 }, // Larger portrait
      { id: 33750, size: "12″ x 18″", popularity: "medium", priceMultiplier: 1.2 }, // Medium portrait
      { id: 33745, size: "24″ x 18″", popularity: "low", priceMultiplier: 1.8 },   // Large landscape
      { id: 33752, size: "18″ x 24″", popularity: "low", priceMultiplier: 1.8 }    // Large portrait
    ];

    return optimalSizes.map(variant => ({
      id: variant.id,
      price: Math.round(basePrice * variant.priceMultiplier * 100), // Convert to cents with size-based pricing
      is_enabled: true
    }));
  }

  /**
   * Rate limiting management
   */
  async checkRateLimit(service) {
    const now = Date.now();
    const state = rateLimitState[service];
    const limit = RATE_LIMITS[service];
    
    // Reset if period has passed
    if (now >= state.resetTime) {
      state.requests = 0;
      state.resetTime = now + limit.period;
    }
    
    // Wait if at limit
    if (state.requests >= limit.requests) {
      const waitTime = state.resetTime - now;
      console.log(`⏳ Rate limit reached for ${service}, waiting ${Math.round(waitTime/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Reset after waiting
      state.requests = 0;
      state.resetTime = now + limit.period;
    }
  }

  incrementRateLimit(service) {
    rateLimitState[service].requests++;
  }

  async waitForRateLimit() {
    // SPEED OPTIMIZATION: More aggressive rate limiting for maximum throughput
    const delay = Math.max(
      60000 / RATE_LIMITS.printify.requests * 0.7, // Use 70% of limit for safety margin but faster
      50 // Reduced minimum delay for speed
    );
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Progress reporting
   */
  reportProgress() {
    if (this.progressCallback) {
      this.progressCallback({
        ...this.currentProgress,
        isRunning: this.isRunning
      });
    }
  }

  calculateEstimatedCompletion(scale) {
    // SPEED OPTIMIZATION: Updated timing based on parallel processing improvements
    const avgTimePerListing = 8000; // 8 seconds per listing with parallel processing (down from 15s)
    const count = AUTOMATION_SCALES[scale].count;
    
    if (count === Infinity) return null;
    
    return Date.now() + (count * avgTimePerListing);
  }

  updateEstimatedCompletion() {
    if (this.currentProgress.completed === 0) return;
    
    const elapsed = Date.now() - this.currentProgress.startTime;
    const avgTime = elapsed / this.currentProgress.completed;
    const remaining = AUTOMATION_SCALES[this.currentProgress.scale].count - this.currentProgress.completed;
    
    if (remaining > 0) {
      this.currentProgress.estimatedCompletion = Date.now() + (remaining * avgTime);
    }
  }

  isCriticalError(error) {
    const criticalErrors = [
      'Invalid API key',
      'Account suspended', 
      'Rate limit exceeded permanently',
      'Network error',
      'ECONNREFUSED',
      'ENOTFOUND',
      '401',
      '403'
    ];
    
    return criticalErrors.some(critical => 
      error.message.toLowerCase().includes(critical.toLowerCase())
    );
  }

  /**
   * Enhanced error recovery for overnight automation
   */
  async retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt === maxRetries || this.isCriticalError(error)) {
          throw error;
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.log(`⏳ Retrying in ${Math.round(delay/1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Overnight automation health check
   */
  async performHealthCheck() {
    console.log('🔍 Performing automation health check...');
    
    const checks = {
      server: false,
      pexels: false,
      printify: false
    };
    
    try {
      // Check server connection
      const serverResponse = await fetch('http://localhost:3001/health');
      checks.server = serverResponse.ok;
      
      // Check Pexels API
      const pexelsResponse = await fetch('http://localhost:3001/api/pexels/search?query=ocean&per_page=1&page=1');
      checks.pexels = pexelsResponse.ok;
      
      // Check Printify API
      const printifyResponse = await fetch('http://localhost:3001/api/printify/validate');
      checks.printify = printifyResponse.ok;
      
    } catch (error) {
      console.warn('⚠️ Health check error:', error.message);
    }
    
    const allHealthy = Object.values(checks).every(check => check);
    console.log('🔍 Health check results:', checks, allHealthy ? '✅ All systems healthy' : '⚠️ Some systems unhealthy');
    
    return { checks, allHealthy };
  }

  /**
   * Emergency stop and recovery mechanism
   */
  emergencyStop() {
    console.log('🚨 EMERGENCY STOP TRIGGERED');
    this.stopRequested = true;
    this.isRunning = false;
    this.currentProgress.currentStep = 'emergency_stopped';
    this.reportProgress();
  }

  /**
   * Stop automation gracefully
   */
  stopAutomation() {
    console.log('🛑 Stop requested - completing current listing...');
    this.stopRequested = true;
    this.currentProgress.currentStep = 'stopping';
    this.reportProgress();
  }

  /**
   * Get current automation status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      progress: this.currentProgress,
      rateLimits: rateLimitState,
      contextDistribution: contextUsageTracker
    };
  }

  /**
   * Get context usage statistics
   */
  getContextStats() {
    const total = Object.values(contextUsageTracker).reduce((sum, count) => sum + count, 0);
    const stats = Object.entries(contextUsageTracker).map(([context, count]) => ({
      context,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
    }));
    
    return {
      total,
      byContext: stats,
      isBalanced: total > 0 ? (Math.max(...Object.values(contextUsageTracker)) - Math.min(...Object.values(contextUsageTracker))) <= Math.ceil(total / 6) : true
    };
  }
}

// Export singleton instance
export const automationService = new FullAutomationService();

export default automationService;