import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { listingTracker } from '../services/listingTracker.js';

/**
 * Centralized Workflow State Management
 * 
 * This store manages all shared state across the Wave Caption Generator workflow,
 * eliminating prop drilling and providing a single source of truth.
 * 
 * State categories:
 * - UI State: Current tab, batch mode, dialogs
 * - Image Data: Processed images, approved images, selection state
 * - Automation: Progress, configuration, status
 * - Listings: Created products, progress, metrics
 * - System: API status, health checks, error state
 */
const useWorkflowStore = create(
  subscribeWithSelector((set, get) => ({
    // ===================
    // UI STATE
    // ===================
    currentTab: 0,
    batchMode: false,
    expandedImage: null,
    
    // Tab status tracking
    tabStatuses: {
      dashboard: 'ready',
      generate: 'inactive',
      review: 'inactive',
      listings: 'inactive',
      publish: 'inactive',
      automation: 'inactive'
    },

    // ===================
    // IMAGE DATA STATE
    // ===================
    processedImages: [],
    selectedImages: [],
    approvedImages: [],
    deletedImages: [],
    
    // Image processing state
    loading: false,
    error: '',
    
    // Image statistics (computed)
    get imageStats() {
      const state = get();
      return {
        totalGenerated: state.processedImages.length + state.deletedImages.length,
        currentActive: state.processedImages.length,
        approved: state.approvedImages.length,
        deleted: state.deletedImages.length,
        created: state.createdProducts.length
      };
    },

    // ===================
    // PHRASE MANAGEMENT STATE
    // ===================
    approvedPhrases: [],
    rejectedPhrases: [],
    showPhraseHistory: false,
    editDialog: null,

    // ===================
    // AUTOMATION STATE
    // ===================
    automationProgress: null,
    selectedScale: 'SINGLE',
    confirmationDialog: false,
    automationListings: [],
    automationSummary: null,
    showSummaryDialog: false,
    showAutomationGallery: false,

    // ===================
    // LISTINGS STATE
    // ===================
    creatingListings: false,
    createdProducts: [],
    listingProgress: 0,
    bulkDeleteDialog: false,
    bulkDeleteLoading: false,
    confirmPhrase: '',

    // ===================
    // SYSTEM STATE
    // ===================
    systemStatus: {
      pexelsApi: 'checking',
      printifyApi: 'checking',
      serverConnection: 'checking'
    },
    systemCheckDialog: false,

    // Persistent metrics (synced with listingTracker)
    persistentMetrics: listingTracker.getMetrics(),

    // ===================
    // UI ACTIONS
    // ===================
    setCurrentTab: (tab) => set({ currentTab: tab }),
    setBatchMode: (mode) => set({ batchMode: mode }),
    setExpandedImage: (image) => set({ expandedImage: image }),
    
    updateTabStatuses: (statuses) => set(state => ({
      tabStatuses: { ...state.tabStatuses, ...statuses }
    })),

    // ===================
    // IMAGE ACTIONS
    // ===================
    setProcessedImages: (images) => set({ processedImages: images }),
    addProcessedImages: (newImages) => set(state => ({
      processedImages: [...state.processedImages, ...newImages]
    })),
    
    setSelectedImages: (images) => set({ selectedImages: images }),
    addSelectedImage: (imageId) => set(state => ({
      selectedImages: [...state.selectedImages, imageId]
    })),
    removeSelectedImage: (imageId) => set(state => ({
      selectedImages: state.selectedImages.filter(id => id !== imageId)
    })),
    clearSelectedImages: () => set({ selectedImages: [] }),

    setApprovedImages: (images) => set({ approvedImages: images }),
    addApprovedImage: (image) => set(state => ({
      approvedImages: [...state.approvedImages, image]
    })),
    
    setDeletedImages: (images) => set({ deletedImages: images }),
    addDeletedImage: (imageId) => set(state => ({
      deletedImages: [...state.deletedImages, imageId]
    })),

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // ===================
    // PHRASE ACTIONS
    // ===================
    setApprovedPhrases: (phrases) => set({ approvedPhrases: phrases }),
    addApprovedPhrase: (phrase) => set(state => ({
      approvedPhrases: [...state.approvedPhrases.filter(p => p.id !== phrase.id), phrase]
    })),
    
    setRejectedPhrases: (phrases) => set({ rejectedPhrases: phrases }),
    addRejectedPhrase: (phrase) => set(state => ({
      rejectedPhrases: [...state.rejectedPhrases.filter(p => p.id !== phrase.id), phrase]
    })),
    
    setShowPhraseHistory: (show) => set({ showPhraseHistory: show }),
    setEditDialog: (dialog) => set({ editDialog: dialog }),

    // ===================
    // AUTOMATION ACTIONS
    // ===================
    setAutomationProgress: (progress) => set({ automationProgress: progress }),
    setSelectedScale: (scale) => set({ selectedScale: scale }),
    setConfirmationDialog: (show) => set({ confirmationDialog: show }),
    setAutomationListings: (listings) => set({ automationListings: listings }),
    addAutomationListing: (listing) => set(state => ({
      automationListings: [...state.automationListings, listing]
    })),
    setAutomationSummary: (summary) => set({ automationSummary: summary }),
    setShowSummaryDialog: (show) => set({ showSummaryDialog: show }),
    setShowAutomationGallery: (show) => set({ showAutomationGallery: show }),

    // ===================
    // LISTINGS ACTIONS
    // ===================
    setCreatingListings: (creating) => set({ creatingListings: creating }),
    setCreatedProducts: (products) => set({ createdProducts: products }),
    addCreatedProducts: (newProducts) => set(state => ({
      createdProducts: [...state.createdProducts, ...newProducts]
    })),
    setListingProgress: (progress) => set({ listingProgress: progress }),
    setBulkDeleteDialog: (show) => set({ bulkDeleteDialog: show }),
    setBulkDeleteLoading: (loading) => set({ bulkDeleteLoading: loading }),
    setConfirmPhrase: (phrase) => set({ confirmPhrase: phrase }),

    // ===================
    // SYSTEM ACTIONS
    // ===================
    setSystemStatus: (status) => set(state => ({
      systemStatus: { ...state.systemStatus, ...status }
    })),
    setSystemCheckDialog: (show) => set({ systemCheckDialog: show }),
    
    updatePersistentMetrics: () => set({ 
      persistentMetrics: listingTracker.getMetrics() 
    }),

    // ===================
    // COMPUTED GETTERS
    // ===================
    getSystemHealth: () => {
      const { systemStatus } = get();
      const statuses = Object.values(systemStatus);
      const connected = statuses.filter(s => s === 'connected').length;
      const total = statuses.length;
      return { connected, total, healthy: connected === total };
    },

    isSystemReady: () => {
      const health = get().getSystemHealth();
      return health.healthy;
    },

    getSystemSummary: () => {
      const health = get().getSystemHealth();
      return {
        ready: health.healthy,
        message: health.healthy 
          ? `All Systems Ready (${health.connected}/${health.total})`
          : `Systems Checking (${health.connected}/${health.total})`
      };
    },

    // ===================
    // BULK OPERATIONS
    // ===================
    resetWorkflow: () => set(state => ({
      processedImages: [],
      selectedImages: [],
      approvedImages: [],
      deletedImages: [],
      createdProducts: [],
      approvedPhrases: [],
      rejectedPhrases: [],
      loading: false,
      error: '',
      currentTab: 0,
      tabStatuses: {
        dashboard: 'ready',
        generate: 'inactive',
        review: 'inactive',
        listings: 'inactive',
        publish: 'inactive',
        automation: state.isSystemReady() ? 'ready' : 'checking'
      }
    })),

    // Initialize store with cached data
    initialize: async () => {
      // This could load cached images, restore session state, etc.
      console.log('🏪 Workflow store initialized');
      get().updatePersistentMetrics();
    }
  }))
);

// Set up automatic metrics updates
let metricsInterval;
const startMetricsSync = () => {
  if (metricsInterval) clearInterval(metricsInterval);
  metricsInterval = setInterval(() => {
    useWorkflowStore.getState().updatePersistentMetrics();
  }, 2000); // Update every 2 seconds
};

// Subscribe to store changes for automatic tab status updates
useWorkflowStore.subscribe(
  (state) => ({
    processedImages: state.processedImages.length,
    approvedImages: state.approvedImages.length,
    createdProducts: state.createdProducts.length,
    loading: state.loading,
    systemReady: state.isSystemReady()
  }),
  (current, previous) => {
    // Auto-update tab statuses when data changes
    const newStatuses = {};
    
    if (current.loading !== previous.loading || current.processedImages !== previous.processedImages) {
      newStatuses.generate = current.loading ? 'processing' : 
        current.processedImages > 0 ? 'ready' : 'inactive';
    }
    
    if (current.processedImages !== previous.processedImages) {
      newStatuses.review = current.processedImages > 0 ? 'ready' : 'inactive';
    }
    
    if (current.approvedImages !== previous.approvedImages) {
      newStatuses.listings = current.approvedImages > 0 ? 'ready' : 'inactive';
    }
    
    if (current.createdProducts !== previous.createdProducts) {
      newStatuses.publish = current.createdProducts > 0 ? 'ready' : 'inactive';
    }
    
    if (current.systemReady !== previous.systemReady) {
      newStatuses.automation = current.systemReady ? 'ready' : 'checking';
    }
    
    if (Object.keys(newStatuses).length > 0) {
      useWorkflowStore.getState().updateTabStatuses(newStatuses);
    }
  }
);

// Start metrics sync
startMetricsSync();

export default useWorkflowStore;
export { startMetricsSync };