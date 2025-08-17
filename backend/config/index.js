import dotenv from 'dotenv';

dotenv.config();

export const PRINTIFY_API_BASE = process.env.VITE_PRINTIFY_API_BASE || 'https://api.printify.com/v1';
export const PRINTIFY_TOKEN = process.env.VITE_PRINTIFY_API_TOKEN || process.env.VITE_PRINTIFY_TOKEN || '';
export const PRINTIFY_SHOP_ID = process.env.VITE_PRINTIFY_SHOP_ID || '';
export const PEXELS_API_KEY = process.env.VITE_PEXELS_API_KEY || '';

// Backend specific config
export const PORT = process.env.PORT || 3001;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Rate limiting
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100; // requests per window

export default {
  PRINTIFY_API_BASE,
  PRINTIFY_TOKEN,
  PRINTIFY_SHOP_ID,
  PEXELS_API_KEY,
  PORT,
  NODE_ENV,
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX_REQUESTS
};