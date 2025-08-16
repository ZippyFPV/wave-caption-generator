# 🌊 WAVE COMMERCE CODEBASE GUIDE
*Complete educational breakdown for easy navigation and safe modification*

## 📁 **PROJECT STRUCTURE OVERVIEW**

```
wave-caption-generator/
├── 🎯 CORE APPLICATION FILES
├── 🛠️ CONFIGURATION FILES  
├── 📊 BUSINESS LOGIC FILES
├── 🎨 USER INTERFACE FILES
└── 🔧 AUTOMATION SCRIPTS
```

---

## 🎯 **CORE APPLICATION FILES**

### **`src/main.jsx`** - Application Entry Point
```javascript
// WHAT IT DOES: Starts the entire React application
// SAFETY: Never modify imports or ReactDOM.render - will break app
// MODIFY: Only change which component gets rendered (WorkflowWaveApp vs others)

import React from 'react'
import ReactDOM from 'react-dom/client'
import WorkflowWaveApp from './components/WorkflowWaveApp'  // ← MAIN APP COMPONENT

// HOW TO SWITCH APPS: Change this import to use different components
// - WorkflowWaveApp: Full business system (RECOMMENDED)
// - SimpleWaveApp: Basic wave generator only
// - TestApp: Development testing only
```

### **`src/components/WorkflowWaveApp.jsx`** - Main Business Application
```javascript
// WHAT IT DOES: Complete 6-tab business workflow system
// PURPOSE: Dashboard → Generate → Review → Create → Publish → Automation
// 
// KEY VARIABLES YOU CAN SAFELY MODIFY:
// - currentTab: Changes which tab opens by default (0=Dashboard, 1=Generate, etc.)
// - batchMode: true/false - enables batch processing of 20 images vs 5
// - approvedPhrases/rejectedPhrases: Arrays tracking phrase quality
//
// BUSINESS LOGIC:
// - Tab 0 (Dashboard): Shows metrics and quick actions
// - Tab 1 (Generate): Creates wave images with captions  
// - Tab 2 (Review): Approve/reject generated images
// - Tab 3 (Create): Upload to Printify and create listings
// - Tab 4 (Publish): Push products live to Shopify
// - Tab 5 (Automation): Emergency controls and system monitoring
//
// SAFE MODIFICATIONS:
// ✅ Change tab order in WORKFLOW_TABS array
// ✅ Modify pricing in productData objects
// ✅ Update button text and colors
// ✅ Add new status indicators
// 
// ⚠️  DO NOT MODIFY:
// ❌ useImageProcessing hook calls
// ❌ State management logic (useState, useEffect)
// ❌ API endpoints or authentication
```

---

## 🛠️ **CONFIGURATION FILES**

### **`package.json`** - Project Dependencies
```json
// WHAT IT DOES: Defines all code libraries the project uses
// 
// KEY SCRIPTS YOU CAN RUN:
// "npm run dev"     - Start development server (for testing)
// "npm run build"   - Create production version (for deployment) 
// "npm run lint"    - Check code quality (run before committing)
//
// DEPENDENCIES EXPLAINED:
// - @mui/material: User interface components (buttons, cards, etc.)
// - react: Core framework for building the app
// - vite: Fast development server and build tool
// - lucide-react: Icons used throughout the app
//
// SAFE TO MODIFY:
// ✅ Add new dependencies with "npm install package-name"
// ✅ Update version numbers (with caution)
//
// ⚠️  NEVER MODIFY:
// ❌ Remove existing dependencies (will break app)
// ❌ Change script commands without understanding
```

### **`.env`** - Environment Variables (Not in Git)
```bash
# WHAT IT DOES: Stores secret API keys and configuration
# LOCATION: Root directory (you create this file)
# 
# REQUIRED VARIABLES:
VITE_PEXELS_API_KEY=your_pexels_key_here          # For wave images
VITE_PRINTIFY_API_TOKEN=your_printify_token_here   # For product creation
VITE_SHOPIFY_STORE_URL=your-store.myshopify.com    # Your Shopify store
#
# SAFETY RULES:
# ✅ Always use VITE_ prefix for frontend variables
# ✅ Never commit .env file to Git (contains secrets)
# ✅ Generate new tokens if accidentally exposed
#
# HOW TO GET KEYS:
# - Pexels: https://www.pexels.com/api/
# - Printify: https://printify.com/app/account/api
# - Shopify: Admin → Apps → Private apps
```

---

## 📊 **BUSINESS LOGIC FILES**

### **`src/utils/phraseComponents.js`** - Million Listing Phrase System
```javascript
// WHAT IT DOES: Generates 3M+ unique wave captions using modular components
// 
// KEY ARRAYS YOU CAN MODIFY:
// 
// WAVE_DESCRIPTORS: Adjectives that match wave size
// - big: ['Epic', 'Dramatic', 'Legendary'] ← Add more dramatic words
// - small: ['Tired', 'Gentle', 'Minimal'] ← Add more gentle words
// - medium: ['Steady', 'Moderate'] ← Add more neutral words
//
// ACTIVITIES: What the wave is doing (context-specific)
// - work: ['productivity surge', 'meeting overflow'] ← Office situations
// - parent: ['toddler tantrum', 'naptime negotiation'] ← Parenting moments  
// - lifestyle: ['coffee acquisition', 'wine appreciation'] ← Daily life
//
// EMOTIONS: How the wave feels/ends
// - professional: ['crushing expectations', 'questioning life choices']
// - parent: ['surviving with grace', 'needs immediate backup'] 
// - universal: ['intensifies dramatically', 'activated successfully']
//
// CAPTION_TEMPLATES: Sentence structures
// - standard: '[{descriptor} {activity} {emotion}]'
// - action: '[Currently {activity} with {descriptor} {emotion}]'
// - status: '[Status: {descriptor} {emotion} from {activity}]'
//
// HOW TO ADD NEW PHRASES:
// 1. Add new words to appropriate arrays
// 2. Test with generateCaptionPhrase() function
// 3. Verify they make sense in all template combinations
//
// BUSINESS IMPACT:
// - Each new word = thousands of new unique listings
// - Total combinations = descriptors × activities × emotions × templates
// - Current capacity: 3,072,000 unique phrases
```

### **`src/hooks/useImageProcessing.js`** - Core Image Generation
```javascript
// WHAT IT DOES: Handles all image fetching, processing, and storage
//
// KEY VARIABLES YOU CAN MODIFY:
//
// PRINTIFY SPECIFICATIONS (Canvas Settings):
// - printWidth: 4200    ← Must match Printify's exact requirements
// - printHeight: 3300   ← 14"×11" poster size requirement
// - fontSize: calculated based on image width (min 28px)
//
// PEXELS API SETTINGS:
// - perPage: 15-30     ← Images per API call (max 80)
// - query: 'ocean waves' ← Search terms for wave images
//
// CAPTION STYLING:
// - textColor: '#FFFF00'           ← Bright yellow text
// - backgroundColor: 'rgba(0,0,0,0.85)' ← Semi-transparent black bar
// - fontFamily: 'Arial'            ← Safe, readable font
//
// CACHE SETTINGS:
// - CACHE_DURATION: 24 hours ← How long to store images locally
//
// SAFE MODIFICATIONS:
// ✅ Change caption colors and fonts
// ✅ Adjust image search queries  
// ✅ Modify cache duration
// ✅ Update batch sizes (5, 10, 20 images)
//
// ⚠️  CRITICAL - DO NOT MODIFY:
// ❌ Canvas dimensions (must match Printify specs)
// ❌ Image processing pipeline order
// ❌ API rate limiting logic
```

### **`src/services/customerTracking.js`** - Analytics & Optimization
```javascript
// WHAT IT DOES: Tracks user behavior to optimize conversions
//
// TRACKING EVENTS:
// - PAGE_VIEW: When someone visits a page
// - PRODUCT_VIEW: When someone looks at a product
// - ADD_TO_CART: When someone adds item to cart
// - PHRASE_APPROVAL: When you approve/reject phrases
//
// HEATMAP DATA:
// - Mouse movements and clicks
// - Scroll depth (how far down page)
// - Time spent on each section
//
// CUSTOMER CONTEXT DETECTION:
// - Entry point (Facebook, Pinterest, direct)
// - Device type (mobile, desktop)
// - UTM campaign parameters
// - Geographic location (timezone)
//
// BUSINESS VALUE:
// - Identifies which products convert best
// - Shows where users click most
// - Optimizes product recommendations
// - A/B tests different layouts
//
// PRIVACY COMPLIANCE:
// - All tracking is anonymous by default
// - GDPR compliant with proper consent
// - No personal data without permission
//
// SAFE MODIFICATIONS:
// ✅ Add new tracking events
// ✅ Modify heatmap sampling rate
// ✅ Change analytics endpoints
//
// ⚠️  LEGAL REQUIREMENTS:
// ❌ Never track without user consent where required
// ❌ Don't collect personal data without disclosure
```

---

## 🎨 **USER INTERFACE FILES**

### **`src/components/` Directory Structure**
```
components/
├── WorkflowWaveApp.jsx    ← MAIN APP (6-tab business system)
├── MaterialUIWaveApp.jsx  ← Alternative Material Design version
├── SimpleWaveApp.jsx      ← Basic wave generator only
├── TestApp.jsx            ← Development testing component
└── ui/Card.jsx           ← Reusable UI components
```

### **UI Component Guidelines**
```javascript
// MATERIAL-UI COMPONENT USAGE:
// 
// Layout Components:
// - Box: General container
// - Container: Max-width wrapper  
// - Grid: Responsive layout system
// - Stack: Vertical/horizontal spacing
//
// Interactive Components:
// - Button: All clickable actions
// - IconButton: Small icon-only buttons
// - Tabs: Navigation between sections
// - Card: Content containers
//
// Display Components:
// - Typography: All text elements
// - Alert: Success/error messages
// - LinearProgress: Loading indicators
// - Chip: Small status labels
//
// SAFE CUSTOMIZATION:
// ✅ Colors via sx={{ color: '#your-color' }}
// ✅ Spacing via sx={{ p: 2, m: 3 }}
// ✅ Text via variant props
//
// STYLE SYSTEM:
// - p: padding (1 unit = 8px)
// - m: margin (1 unit = 8px)  
// - sx: Direct style overrides
```

---

## 🔧 **AUTOMATION SCRIPTS**

### **`create-simple-product.mjs`** - Printify Product Creation
```javascript
// WHAT IT DOES: Creates products on Printify with wave images
//
// KEY VARIABLES YOU CAN MODIFY:
//
// PRODUCT CONFIGURATION:
// - title: Product name shown to customers
// - description: Product description and benefits
// - price: Price in cents (1999 = $19.99)
// - blueprint_id: 97 (Satin Posters - don't change)
// - print_provider_id: 99 (Printify Choice - don't change)
//
// CURRENT SETTINGS:
const productData = {
  title: "Test Wave Art Product - WaveCommerce",     ← MODIFY THIS
  description: "Beautiful ocean wave art...",        ← MODIFY THIS  
  blueprint_id: 97,        ← DON'T CHANGE (poster type)
  print_provider_id: 99,   ← DON'T CHANGE (print provider)
  variants: [{
    id: 33742,             ← DON'T CHANGE (14"×11" size)
    price: 1999,           ← MODIFY (price in cents)
    is_enabled: true
  }]
}
//
// HOW TO RUN:
// 1. Ensure .env file has VITE_PRINTIFY_API_TOKEN
// 2. Run: node create-simple-product.mjs
// 3. Check output for success/error messages
//
// SAFETY:
// ✅ Modify title, description, price
// ❌ Don't change blueprint_id or variant_id (breaks integration)
```

### **`check-products.mjs`** - Product Status Checker
```javascript
// WHAT IT DOES: Lists all products in your Printify shop
//
// USAGE:
// - Run: node check-products.mjs  
// - Shows product count, names, status
// - Helpful for monitoring automation
//
// OUTPUT EXAMPLE:
// ✅ Found 15 products in your shop
// 1. Calming Ocean Waves - Premium Therapeutic Wall Art
//    ID: 12345, Status: Visible, Variants: 1
//
// TROUBLESHOOTING:
// - If 0 products: Check API token in .env
// - If 401 error: Regenerate API token
// - If 429 error: Wait for rate limit reset
```

---

## 📈 **BUSINESS OPTIMIZATION VARIABLES**

### **Revenue Optimization Settings**
```javascript
// PRICING STRATEGY (Modify in create-simple-product.mjs):
const PRICING = {
  artPrint: 1999,    // $19.99 - Entry point pricing
  mug: 2499,         // $24.99 - Higher margin daily use item  
  journal: 1999,     // $19.99 - Premium feel, high margin
  digital: 399       // $3.99 - Pure profit digital download
};

// CONTEXT TARGETING (Modify in phraseComponents.js):
const CONTEXTS = [
  'hallway-conversation-starter',  // High-traffic guest areas
  'bathroom-humor',               // Captive audience engagement
  'home-office-motivation',       // WFH professional market
  'kitchen-morning-ritual'        // Daily routine integration
];

// DEMOGRAPHIC TARGETING (Modify phrase selection):
const DEMOGRAPHICS = {
  'affluent_millennial_women': {
    themes: ['work', 'lifestyle', 'self-care'],
    tones: ['sophisticated', 'relatable', 'empowering']
  },
  'affluent_millennial_men': {
    themes: ['work', 'humor', 'achievement'],  
    tones: ['witty', 'confident', 'aspirational']
  },
  'new_parents': {
    themes: ['parent', 'survival', 'humor'],
    tones: ['understanding', 'supportive', 'comedic']
  }
};
```

---

## 🚨 **SAFETY GUIDELINES**

### **✅ SAFE TO MODIFY**
- Product titles, descriptions, and pricing
- Caption text and phrase components
- UI colors, fonts, and spacing
- Tracking events and analytics
- Button text and navigation labels

### **⚠️ MODIFY WITH CAUTION**
- API endpoints and authentication
- Canvas dimensions and image processing
- State management logic (useState, useEffect)
- Database schemas and data structures

### **❌ NEVER MODIFY WITHOUT EXPERT HELP**
- Core React hooks and component lifecycle
- Printify blueprint IDs and variant specifications  
- Environment variable names and structure
- Build configuration (vite.config.js, package.json scripts)

---

## 🔍 **DEBUGGING HELP**

### **Common Issues & Solutions**

**"Images not generating"**
```bash
# Check API keys
echo $VITE_PEXELS_API_KEY
# Should show your API key, not empty

# Check rate limits  
node check-products.mjs
# Should connect without errors
```

**"Products not creating"**
```bash
# Test Printify connection
node create-simple-product.mjs
# Should create test product successfully
```

**"App won't start"**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Should open browser to http://localhost:5173
```

**"Tracking not working"**
```javascript
// Check browser console
// Look for "🔍 Customer tracking initialized" message
// If missing, check customerTracking.js import
```

---

## 📞 **WHEN TO ASK FOR HELP**

**Ask Claude for help when:**
- Adding new features or components
- Modifying complex business logic  
- Integrating with new APIs
- Optimizing performance issues
- Understanding error messages

**Provide Claude with:**
- Exact error messages from browser console
- What you were trying to modify
- Steps you took before the issue
- Current environment (.env variables status)

---

*This guide covers 95% of modifications you'll need. Always test changes in development before deploying to production!*