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
  globalIgnores(['dist', 'node_modules']), // Ignore the build output directory and dependencies
  
  // FRONTEND CONFIGURATION - React/Vite files
  {
    files: ['src/**/*.{js,jsx}'], // Frontend files only
    
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser, // Browser globals (window, document, etc.)
        ...globals.es2020,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
  
  // BACKEND CONFIGURATION - Node.js files
  {
    files: ['backend/**/*.js', 'server.js', 'scripts/**/*.js'], // Backend and script files
    
    extends: [js.configs.recommended],
    
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node, // Node.js globals (require, process, module, etc.)
        ...globals.es2020,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs', // Node.js uses CommonJS (require/module.exports)
      },
    },
    
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
  
  // TEST CONFIGURATION - Vitest/testing files
  {
    files: ['src/**/*.test.{js,jsx}', 'src/test/**/*.{js,jsx}'],
    
    extends: [js.configs.recommended],
    
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020,
        vi: 'readonly',
        global: 'readonly',
        afterEach: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
])
