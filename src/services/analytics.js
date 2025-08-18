import { ENABLE_ANALYTICS, POSTHOG_KEY, POSTHOG_HOST } from '../config';
import posthog from 'posthog-js';

// Initialize PostHog following official React docs
if (ENABLE_ANALYTICS && POSTHOG_KEY && typeof window !== 'undefined') {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // We'll handle pageviews manually
    capture_pageleave: true,
    persistence: 'localStorage+cookie'
  });
}

const _noop = () => {};

const safeCall = (fn, ...args) => {
  try {
    fn(...args);
  } catch {
    /* ignore */
  }
};

export const analytics = {
  page: (name, props = {}) => {
    if (!ENABLE_ANALYTICS) return;
    
    // PostHog pageview tracking (official method)
    if (POSTHOG_KEY && typeof window !== 'undefined') {
      safeCall(posthog.capture, '$pageview', { $current_url: name, ...props });
    }
    
    // Existing GA/FB tracking
    if (typeof window !== 'undefined' && window.gtag) 
      safeCall(window.gtag, 'config', 'GA_MEASUREMENT_ID', { page_path: name, ...props });
    if (typeof window !== 'undefined' && window.fbq) 
      safeCall(window.fbq, 'track', 'PageView', props);
  },
  
  event: (action, params = {}) => {
    if (!ENABLE_ANALYTICS) return;
    
    // PostHog event tracking (official method)
    if (POSTHOG_KEY && typeof window !== 'undefined') {
      safeCall(posthog.capture, action, params);
    }
    
    // Existing GA/FB tracking
    if (typeof window !== 'undefined' && window.gtag) 
      safeCall(window.gtag, 'event', action, params);
    if (typeof window !== 'undefined' && window.fbq) 
      safeCall(window.fbq, 'trackCustom', action, params);
  },
  
  // Conversion tracking method
  trackConversion: (type, data = {}) => {
    if (!ENABLE_ANALYTICS) return;
    
    const conversionData = {
      conversion_type: type,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    // PostHog conversion tracking
    if (POSTHOG_KEY && typeof window !== 'undefined') {
      safeCall(posthog.capture, 'conversion', conversionData);
    }
    
    // Track in other platforms
    if (typeof window !== 'undefined' && window.gtag) 
      safeCall(window.gtag, 'event', 'conversion', conversionData);
  },
  
  // PostHog identify method for user properties
  identifyUser: (userId, properties = {}) => {
    if (!ENABLE_ANALYTICS || !POSTHOG_KEY) return;
    
    if (typeof window !== 'undefined') {
      safeCall(posthog.identify, userId, properties);
    }
  },
  
  identify: (id, _traits = {}) => {
    /* noop or implement later */
  }
};

export default analytics;