import { ENABLE_ANALYTICS } from '../config';

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
    if (typeof window !== 'undefined' && window.gtag) 
      safeCall(window.gtag, 'config', 'GA_MEASUREMENT_ID', { page_path: name, ...props });
    if (typeof window !== 'undefined' && window.fbq) 
      safeCall(window.fbq, 'track', 'PageView', props);
  },
  
  event: (action, params = {}) => {
    if (!ENABLE_ANALYTICS) return;
    if (typeof window !== 'undefined' && window.gtag) 
      safeCall(window.gtag, 'event', action, params);
    if (typeof window !== 'undefined' && window.fbq) 
      safeCall(window.fbq, 'trackCustom', action, params);
  },
  
  identify: (id, _traits = {}) => {
    /* noop or implement later */
  }
};

export default analytics;