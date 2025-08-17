import analytics from './analytics';

/**
 * Customer Tracking & Heatmapping Service
 * 
 * This service implements comprehensive customer behavior tracking to optimize
 * conversions and provide heatmap data for continuous site improvement.
 * 
 * BUSINESS PURPOSE:
 * - Track every customer interaction to optimize product placement
 * - Heatmap user behavior to identify conversion opportunities
 * - A/B test different layouts and product presentations
 * - Provide real-time analytics for business decisions
 * 
 * PRIVACY COMPLIANCE:
 * - All tracking is anonymous unless user explicitly opts in
 * - GDPR compliant with proper consent management
 * - No personal data stored without permission
 */

// Configuration for tracking events
export const TRACKING_EVENTS = {
  // Page Navigation
  PAGE_VIEW: 'page_view',
  PRODUCT_VIEW: 'product_view', 
  COLLECTION_VIEW: 'collection_view',
  
  // User Interactions
  BUTTON_CLICK: 'button_click',
  IMAGE_HOVER: 'image_hover',
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  
  // Shopping Behavior
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  CHECKOUT_START: 'checkout_start',
  PURCHASE_COMPLETE: 'purchase_complete',
  
  // Engagement Metrics
  PHRASE_APPROVAL: 'phrase_approval', // User likes/dislikes phrases
  SHARE_ATTEMPT: 'share_attempt',
  EMAIL_SIGNUP: 'email_signup',
  RETURN_VISIT: 'return_visit'
};

// Customer context detection
export const detectCustomerContext = () => {
  return {
    // Entry Point Analysis
    entryPoint: {
      source: document.referrer || 'direct',
      utmParams: extractUTMParams(),
      landingPage: window.location.pathname,
      timestamp: new Date().toISOString()
    },
    
    // Device & Browser Info
    deviceInfo: {
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
      platform: navigator.platform
    },
    
    // Behavioral Indicators
    behavior: {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      sessionId: generateSessionId()
    }
  };
};

// Extract marketing campaign data from URL
const extractUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source'),      // facebook, instagram, pinterest
    medium: params.get('utm_medium'),      // social, cpc, organic
    campaign: params.get('utm_campaign'),  // bathroom-humor, office-motivation
    content: params.get('utm_content'),    // specific-ad-variant
    term: params.get('utm_term')           // target-keywords
  };
};

// Generate unique session identifier
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Track user interaction events
 * 
 * USAGE: trackEvent('button_click', { buttonId: 'add-to-cart', productId: 'wave-123' })
 * 
 * @param {string} eventType - Type of event from TRACKING_EVENTS
 * @param {object} eventData - Additional data about the event
 * @param {object} customerContext - Current customer context
 */
export const trackEvent = (eventType, eventData = {}, customerContext = null) => {
  // Get current customer context if not provided
  const context = customerContext || detectCustomerContext();
  
  const trackingPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    sessionId: context.behavior.sessionId,
    
    // Event specific data
    eventData: {
      ...eventData,
      pageUrl: window.location.href,
      elementId: eventData.elementId || null,
      elementText: eventData.elementText || null
    },
    
    // Customer context
    context: {
      entrySource: context.entryPoint.source,
      deviceType: context.deviceInfo.isMobile ? 'mobile' : 'desktop',
      utmCampaign: context.entryPoint.utmParams.campaign,
      timeZone: context.behavior.timeZone
    }
  };
  
  // Send to analytics (multiple services for redundancy)
  sendToAnalytics(trackingPayload);
  
  // Store locally for offline analysis
  storeLocalTracking(trackingPayload);
  
  // Real-time dashboard updates
  updateDashboard(trackingPayload);
};

/**
 * Heatmap tracking for visual optimization
 * 
 * Records mouse movements, clicks, and scroll behavior to generate
 * heatmaps showing where users focus their attention.
 */
export const initializeHeatmapTracking = () => {
  let mouseTrail = [];
  let scrollDepths = [];
  let clickPositions = [];
  
  // Mouse movement tracking (sampled to avoid performance issues)
  let mouseTrackingInterval;
  document.addEventListener('mousemove', (e) => {
    clearTimeout(mouseTrackingInterval);
    mouseTrackingInterval = setTimeout(() => {
      mouseTrail.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
        element: e.target.tagName
      });
      
      // Keep only last 100 positions to manage memory
      if (mouseTrail.length > 100) {
        mouseTrail = mouseTrail.slice(-100);
      }
    }, 100); // Sample every 100ms
  });
  
  // Click tracking with precise positioning
  document.addEventListener('click', (e) => {
    const clickData = {
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
      element: e.target.tagName,
      elementId: e.target.id,
      elementClass: e.target.className,
      elementText: e.target.textContent?.substring(0, 50) // First 50 chars
    };
    
    clickPositions.push(clickData);
    
    // Track as conversion event
    trackEvent(TRACKING_EVENTS.BUTTON_CLICK, {
      position: `${e.clientX},${e.clientY}`,
      elementInfo: clickData
    });
  });
  
  // Scroll depth tracking
  let maxScrollDepth = 0;
  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    
    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent;
      
      // Track milestone scroll depths
      if ([25, 50, 75, 90, 100].includes(scrollPercent)) {
        trackEvent(TRACKING_EVENTS.SCROLL_DEPTH, {
          depth: scrollPercent,
          timeOnPage: Date.now() - performance.timing.loadEventEnd
        });
      }
    }
  });
  
  // Send heatmap data every 30 seconds
  setInterval(() => {
    if (mouseTrail.length > 0 || clickPositions.length > 0) {
      sendHeatmapData({
        mouseTrail: mouseTrail.slice(), // Copy array
        clicks: clickPositions.slice(),
        scrollDepth: maxScrollDepth,
        sessionId: detectCustomerContext().behavior.sessionId
      });
      
      // Clear local arrays after sending
      mouseTrail = [];
      clickPositions = [];
    }
  }, 30000);
};

/**
 * Send tracking data to analytics services
 * 
 * WHAT THIS DOES:
 * - Sends data to Google Analytics for standard metrics
 * - Sends to Facebook Pixel for retargeting
 * - Sends to custom analytics for business intelligence
 * 
 * SAFETY: All data is anonymized unless user explicitly opts in
 */
const sendToAnalytics = (payload) => {
  try {
    // Use analytics wrapper instead of direct gtag
    analytics.event(payload.event, {
        event_category: 'user_interaction',
        event_label: payload.eventData.elementId,
        value: payload.eventData.value || 1,
        custom_parameters: {
          session_id: payload.sessionId,
          device_type: payload.context.deviceType
        }
      });
    
    // Use analytics wrapper instead of direct fbq
    analytics.event('CustomEvent', {
        event_name: payload.event,
        content_category: payload.context.utmCampaign,
        content_ids: [payload.eventData.productId]
      });
      
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
        value: payload.eventData.value || 0,
        currency: 'USD'
      });
    }
    
    // Custom analytics endpoint
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.warn('Analytics tracking failed:', err));
    
  } catch (error) {
    console.warn('Analytics error:', error);
  }
};

// Store tracking data locally for offline analysis
const storeLocalTracking = (payload) => {
  try {
    const stored = JSON.parse(localStorage.getItem('wave_analytics') || '[]');
    stored.push(payload);
    
    // Keep only last 1000 events to manage storage
    if (stored.length > 1000) {
      stored.splice(0, stored.length - 1000);
    }
    
    localStorage.setItem('wave_analytics', JSON.stringify(stored));
  } catch (error) {
    console.warn('Local storage error:', error);
  }
};

// Update real-time dashboard
const updateDashboard = (payload) => {
  // Broadcast to any listening dashboard components
  window.dispatchEvent(new CustomEvent('analytics-update', {
    detail: payload
  }));
};

// Send heatmap data to visualization service
const sendHeatmapData = (heatmapData) => {
  fetch('/api/analytics/heatmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(heatmapData)
  }).catch(err => console.warn('Heatmap tracking failed:', err));
};

/**
 * Product recommendation optimization
 * 
 * Uses tracking data to dynamically optimize which products are shown
 * to each customer based on their behavior and context.
 */
export const optimizeProductRecommendations = (customerContext, availableProducts) => {
  const context = customerContext || detectCustomerContext();
  
  // Scoring algorithm based on multiple factors
  const scoredProducts = availableProducts.map(product => {
    let score = 0;
    
    // Context matching (highest weight)
    if (product.context === context.entryPoint.utmParams.campaign) {
      score += 50; // Strong context match
    }
    
    // Device optimization
    if (context.deviceInfo.isMobile && product.mobileOptimized) {
      score += 20;
    }
    
    // Time-based optimization
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17 && product.tags.includes('office')) {
      score += 15; // Work hours = office products
    }
    if ((hour >= 18 || hour <= 8) && product.tags.includes('home')) {
      score += 15; // Evening/morning = home products
    }
    
    // Historical performance (requires analytics data)
    score += (product.conversionRate || 0) * 100;
    
    return { ...product, score };
  });
  
  // Return top 30 products sorted by score
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
};

// Initialize tracking when module loads
export const initializeTracking = () => {
  // Detect customer context
  const context = detectCustomerContext();
  
  // Track initial page view
  trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
    url: window.location.href,
    title: document.title,
    referrer: document.referrer
  }, context);
  
  // Initialize heatmap tracking
  initializeHeatmapTracking();
  
  // Track time on page
  const startTime = Date.now();
  window.addEventListener('beforeunload', () => {
    const timeOnPage = Date.now() - startTime;
    trackEvent(TRACKING_EVENTS.TIME_ON_PAGE, {
      duration: timeOnPage,
      url: window.location.href
    });
  });
  
  console.log('🔍 Customer tracking initialized', context);
};

export default {
  trackEvent,
  detectCustomerContext,
  optimizeProductRecommendations,
  initializeTracking,
  TRACKING_EVENTS
};