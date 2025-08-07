// ESLINT CONFIGURATION FILE
// ESLint is a static analysis tool for identifying and fixing problems in JavaScript code
// It helps maintain code quality, consistency, and catch potential bugs before runtime

import js from '@eslint/js' // Core JavaScript ESLint rules
import globals from 'globals' // Predefined global variables for different environments
import reactHooks from 'eslint-plugin-react-hooks' // Rules specific to React Hooks usage
import reactRefresh from 'eslint-plugin-react-refresh' // Rules for React Fast Refresh
import { defineConfig, globalIgnores } from 'eslint/config' // ESLint configuration helpers

export default defineConfig([
  // GLOBAL IGNORES - Files/folders ESLint should never check
  globalIgnores(['dist']), // Ignore the build output directory
  
  {
    // FILE PATTERNS - Which files this configuration applies to
    files: ['**/*.{js,jsx}'], // All JavaScript and JSX files
    
    // CONFIGURATION INHERITANCE - Extend other ESLint configurations
    extends: [
      js.configs.recommended, // Basic JavaScript best practices
      reactHooks.configs['recommended-latest'], // React Hooks rules (useEffect dependencies, etc.)
      reactRefresh.configs.vite, // Vite-specific React Fast Refresh rules
    ],
    
    // LANGUAGE OPTIONS - Configure how ESLint parses your code
    languageOptions: {
      ecmaVersion: 2020, // Support for ES2020 features
      globals: globals.browser, // Browser globals (window, document, etc.)
      parserOptions: {
        ecmaVersion: 'latest', // Use the latest ECMAScript version
        ecmaFeatures: { jsx: true }, // Enable JSX parsing
        sourceType: 'module', // Code uses ES6 modules (import/export)
      },
    },
    
    // CUSTOM RULES - Override or add specific linting rules
    rules: {
      // Allow unused variables if they start with uppercase or underscore
      // Useful for React components and constants that might be imported but not used
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      
      // Other common rules you might want to add:
      // 'no-console': 'warn', // Warn about console.log statements
      // 'prefer-const': 'error', // Prefer const over let when variable isn't reassigned
      // 'react-hooks/exhaustive-deps': 'warn', // Ensure effect dependencies are correct
    },
  },
])
