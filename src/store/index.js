/**
 * Store Index - Central export for all stores
 * 
 * This file exports all store hooks and provides store orchestration
 * for the Wave Caption Generator application.
 */

import useWorkflowStore, { startMetricsSync } from './workflowStore.js';

// Export individual stores
export { default as useWorkflowStore } from './workflowStore.js';

// Store initialization
export const initializeStores = async () => {
  console.log('🏪 Initializing application stores...');
  
  // Initialize workflow store
  await useWorkflowStore.getState().initialize();
  
  console.log('✅ All stores initialized successfully');
};

// Store cleanup (for development/testing)
export const resetAllStores = () => {
  console.log('🔄 Resetting all stores...');
  useWorkflowStore.getState().resetWorkflow();
  console.log('✅ All stores reset');
};

// Export utility functions
export { startMetricsSync };

export default {
  useWorkflowStore,
  initializeStores,
  resetAllStores,
  startMetricsSync
};