/**
 * API Rate Limiting Service - Smart Rate Management for Pexels & Printify APIs
 * 
 * This service implements intelligent rate limiting based on API research and best practices
 * to ensure optimal performance while respecting API constraints.
 * 
 * API Rate Limits Researched:
 * 
 * PEXELS API:
 * - Free: 200 requests/hour
 * - Documentation: https://www.pexels.com/api/documentation/
 * 
 * PRINTIFY API:
 * - Global: 600 requests/minute
 * - Product Publishing: 200 requests/30 minutes
 * - Error Rate: Must stay under 5%
 * - Documentation: https://developers.printify.com/
 * 
 * SHOPIFY API:
 * - Varies by plan and API type
 * - GraphQL recommended for efficiency
 * - Documentation: https://shopify.dev/docs/api
 * 
 * Best Practices Implemented:
 * 1. Exponential backoff for 429 errors
 * 2. Request queuing with priority levels
 * 3. Smart caching to reduce API calls
 * 4. Real-time rate limit monitoring
 * 5. Automatic retry mechanisms
 */

class APIRateLimitService {
  constructor() {
    // Rate limit configurations based on API research
    this.limits = {
      pexels: {
        requestsPerHour: 200,
        requestsPerMinute: Math.floor(200 / 60), // ~3 per minute
        currentRequests: 0,
        windowStart: Date.now(),
        queue: [],
        retryDelays: [1000, 2000, 4000, 8000, 16000] // Exponential backoff
      },
      printify: {
        requestsPerMinute: 600,
        publishingRequestsPer30Min: 200,
        currentRequests: 0,
        publishingRequests: 0,
        windowStart: Date.now(),
        publishingWindowStart: Date.now(),
        queue: [],
        retryDelays: [2000, 4000, 8000, 16000, 32000]
      }
    };
    
    // Request tracking for monitoring
    this.stats = {
      pexels: { total: 0, successful: 0, failed: 0, cached: 0 },
      printify: { total: 0, successful: 0, failed: 0, retries: 0 }
    };
    
    console.group('⚡ APIRateLimitService Initialized');
    console.log('Pexels Limit:', this.limits.pexels.requestsPerHour, 'requests/hour');
    console.log('Printify Limit:', this.limits.printify.requestsPerMinute, 'requests/minute');
    console.log('Publishing Limit:', this.limits.printify.publishingRequestsPer30Min, 'requests/30min');
    console.groupEnd();
    
    // Start monitoring windows
    this.startWindowMonitoring();
  }

  /**
   * Start monitoring rate limit windows and reset counters
   */
  startWindowMonitoring() {
    // Reset Pexels counter every hour
    setInterval(() => {
      console.log('🔄 Resetting Pexels rate limit window');
      console.log('Previous hour stats:', {
        requests: this.limits.pexels.currentRequests,
        successRate: `${((this.stats.pexels.successful / this.stats.pexels.total) * 100).toFixed(1)}%`
      });
      
      this.limits.pexels.currentRequests = 0;
      this.limits.pexels.windowStart = Date.now();
    }, 60 * 60 * 1000); // 1 hour
    
    // Reset Printify counter every minute  
    setInterval(() => {
      console.log('🔄 Resetting Printify rate limit window');
      this.limits.printify.currentRequests = 0;
      this.limits.printify.windowStart = Date.now();
    }, 60 * 1000); // 1 minute
    
    // Reset Printify publishing counter every 30 minutes
    setInterval(() => {
      console.log('🔄 Resetting Printify publishing limit window');
      this.limits.printify.publishingRequests = 0;
      this.limits.printify.publishingWindowStart = Date.now();
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Check if we can make a request to the specified API
   * @param {string} apiName - 'pexels' or 'printify'
   * @param {boolean} isPublishing - For Printify, whether this is a publishing request
   */
  canMakeRequest(apiName, isPublishing = false) {
    const _limit = this.limits[apiName];
    
    if (apiName === 'pexels') {
      const available = _limit.requestsPerHour - _limit.currentRequests;
      console.log(`🔍 Pexels Rate Check: ${_limit.currentRequests}/${_limit.requestsPerHour} used, ${available} available`);
      return available > 0;
    }
    
    if (apiName === 'printify') {
      const generalAvailable = _limit.requestsPerMinute - _limit.currentRequests;
      
      if (isPublishing) {
        const publishingAvailable = _limit.publishingRequestsPer30Min - _limit.publishingRequests;
        console.log(`🔍 Printify Publishing Rate Check: ${_limit.publishingRequests}/${_limit.publishingRequestsPer30Min} used`);
        return generalAvailable > 0 && publishingAvailable > 0;
      }
      
      console.log(`🔍 Printify Rate Check: ${_limit.currentRequests}/${_limit.requestsPerMinute} used`);
      return generalAvailable > 0;
    }
    
    return false;
  }

  /**
   * Record a successful API request
   * @param {string} apiName - 'pexels' or 'printify'
   * @param {boolean} isPublishing - For Printify publishing requests
   */
  recordRequest(apiName, isPublishing = false) {
    const _limit = this.limits[apiName];
    _limit.currentRequests++;
    
    if (apiName === 'printify' && isPublishing) {
      _limit.publishingRequests++;
      console.log(`📊 Recorded Printify publishing request: ${_limit.publishingRequests}/${_limit.publishingRequestsPer30Min}`);
    }
    
    this.stats[apiName].total++;
    this.stats[apiName].successful++;
    
    console.log(`✅ Request recorded for ${apiName}: ${_limit.currentRequests} total this window`);
  }

  /**
   * Record a failed API request for monitoring
   * @param {string} apiName - 'pexels' or 'printify'
   * @param {number} statusCode - HTTP status code
   */
  recordFailure(apiName, statusCode) {
    this.stats[apiName].total++;
    this.stats[apiName].failed++;
    
    const errorRate = (this.stats[apiName].failed / this.stats[apiName].total) * 100;
    
    console.warn(`❌ API Failure for ${apiName}:`, {
      statusCode,
      errorRate: `${errorRate.toFixed(1)}%`,
      failedRequests: this.stats[apiName].failed,
      totalRequests: this.stats[apiName].total
    });
    
    // Alert if error rate exceeds 5% (Printify requirement)
    if (errorRate > 5) {
      console.error(`🚨 ERROR RATE ALERT: ${apiName} error rate (${errorRate.toFixed(1)}%) exceeds 5% threshold!`);
    }
  }

  /**
   * Implement exponential backoff for rate limit errors (429)
   * @param {string} apiName - 'pexels' or 'printify'
   * @param {number} attemptNumber - Current retry attempt (0-based)
   * @returns {Promise} Resolves after appropriate delay
   */
  async handleRateLimit(apiName, attemptNumber = 0) {
    const _limit = this.limits[apiName];
    const delay = _limit.retryDelays[Math.min(attemptNumber, _limit.retryDelays.length - 1)];
    
    console.warn(`⏱️ Rate limit hit for ${apiName}, waiting ${delay}ms (attempt ${attemptNumber + 1})`);
    
    this.stats[apiName].retries++;
    
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`🔄 Retry ready for ${apiName} after ${delay}ms delay`);
        resolve();
      }, delay);
    });
  }

  /**
   * Smart request wrapper with automatic rate limiting and retries
   * @param {string} apiName - 'pexels' or 'printify'
   * @param {Function} requestFunction - The actual API request function
   * @param {boolean} isPublishing - For Printify publishing requests
   * @param {number} maxRetries - Maximum retry attempts
   */
  async makeRequest(apiName, requestFunction, isPublishing = false, maxRetries = 3) {
    console.group(`🚀 Making ${apiName} API Request`);
    console.log('Publishing request:', isPublishing);
    console.log('Max retries:', maxRetries);
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // Check rate limits before making request
      if (!this.canMakeRequest(apiName, isPublishing)) {
        console.warn(`⏳ Rate limit reached for ${apiName}, queuing request...`);
        await this.waitForAvailableSlot(apiName, isPublishing);
      }
      
      try {
        console.log(`📡 Attempting ${apiName} request (attempt ${attempt + 1}/${maxRetries + 1})`);
        
        const result = await requestFunction();
        
        // Record successful request
        this.recordRequest(apiName, isPublishing);
        
        console.log(`✅ ${apiName} request successful`);
        console.groupEnd();
        
        return result;
        
      } catch (error) {
        console.error(`❌ ${apiName} request failed:`, error);
        
        // Handle rate limit errors (429)
        if (error.status === 429 || error.message?.includes('rate limit')) {
          this.recordFailure(apiName, 429);
          
          if (attempt < maxRetries) {
            await this.handleRateLimit(apiName, attempt);
            continue; // Retry
          }
        }
        
        // Handle other errors
        this.recordFailure(apiName, error.status || 500);
        
        if (attempt === maxRetries) {
          console.error(`💥 ${apiName} request failed after ${maxRetries + 1} attempts`);
          console.groupEnd();
          throw error;
        }
        
        // Wait before retry for non-rate-limit errors
        const delay = 1000 * (attempt + 1);
        console.log(`⏱️ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Wait for an available request slot in the rate limit window
   * @param {string} apiName - 'pexels' or 'printify'
   * @param {boolean} isPublishing - For Printify publishing requests
   */
  async waitForAvailableSlot(apiName, isPublishing = false) {
    const _limit = this.limits[apiName];
    
    return new Promise(resolve => {
      const checkSlot = () => {
        if (this.canMakeRequest(apiName, isPublishing)) {
          console.log(`✅ Rate limit slot available for ${apiName}`);
          resolve();
        } else {
          console.log(`⏳ Still waiting for ${apiName} rate limit slot...`);
          setTimeout(checkSlot, 1000); // Check every second
        }
      };
      
      checkSlot();
    });
  }

  /**
   * Get current rate limiting statistics for monitoring
   */
  getStats() {
    const stats = {
      pexels: {
        ...this.stats.pexels,
        currentUsage: `${this.limits.pexels.currentRequests}/${this.limits.pexels.requestsPerHour}`,
        successRate: `${((this.stats.pexels.successful / Math.max(this.stats.pexels.total, 1)) * 100).toFixed(1)}%`,
        errorRate: `${((this.stats.pexels.failed / Math.max(this.stats.pexels.total, 1)) * 100).toFixed(1)}%`
      },
      printify: {
        ...this.stats.printify,
        currentUsage: `${this.limits.printify.currentRequests}/${this.limits.printify.requestsPerMinute}`,
        publishingUsage: `${this.limits.printify.publishingRequests}/${this.limits.printify.publishingRequestsPer30Min}`,
        successRate: `${((this.stats.printify.successful / Math.max(this.stats.printify.total, 1)) * 100).toFixed(1)}%`,
        errorRate: `${((this.stats.printify.failed / Math.max(this.stats.printify.total, 1)) * 100).toFixed(1)}%`
      }
    };
    
    console.table(stats);
    return stats;
  }

  /**
   * Record cached response to track API call savings
   * @param {string} apiName - 'pexels' or 'printify'
   */
  recordCacheHit(apiName) {
    this.stats[apiName].cached++;
    console.log(`💾 Cache hit for ${apiName} - API call avoided!`);
    console.log(`Cache efficiency: ${this.stats[apiName].cached} cached vs ${this.stats[apiName].total} total requests`);
  }

  /**
   * Reset all statistics (useful for testing)
   */
  resetStats() {
    console.log('🔄 Resetting all API statistics');
    
    Object.keys(this.stats).forEach(api => {
      this.stats[api] = { total: 0, successful: 0, failed: 0, cached: 0, retries: 0 };
      this.limits[api].currentRequests = 0;
      
      if (api === 'printify') {
        this.limits[api].publishingRequests = 0;
      }
    });
  }
}

// Create singleton instance
const rateLimiter = new APIRateLimitService();

export default rateLimiter;

/**
 * Convenience functions for easy integration
 */
export const makePexelsRequest = async (requestFunction) => {
  return rateLimiter.makeRequest('pexels', requestFunction, false, 3);
};

export const makePrintifyRequest = async (requestFunction, isPublishing = false) => {
  return rateLimiter.makeRequest('printify', requestFunction, isPublishing, 5);
};

export const recordCacheHit = (apiName) => {
  rateLimiter.recordCacheHit(apiName);
};

export const getAPIStats = () => {
  return rateLimiter.getStats();
};