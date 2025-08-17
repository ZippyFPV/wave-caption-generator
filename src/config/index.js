export const PRINTIFY_API_BASE = import.meta.env.VITE_PRINTIFY_API_BASE || 'https://api.printify.com/v1';
export const PRINTIFY_TOKEN = import.meta.env.VITE_PRINTIFY_TOKEN || import.meta.env.VITE_PRINTIFY_API_TOKEN || '';
export const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';
export const HEALTH_POLL_INTERVAL_MS = Number(import.meta.env.VITE_HEALTH_POLL_MS || 10000);
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

export default {
  PRINTIFY_API_BASE,
  PRINTIFY_TOKEN,
  PEXELS_API_KEY,
  HEALTH_POLL_INTERVAL_MS,
  ENABLE_ANALYTICS
};