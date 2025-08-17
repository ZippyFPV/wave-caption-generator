import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
  Chip,
  Stack,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Waves,
  Visibility,
  Store,
  Publish,
  Emergency,
  Assessment
} from '@mui/icons-material';

// Custom Hooks
import { useImageProcessing } from '../hooks/useImageProcessing';
import { useAutomation } from '../hooks/useAutomation.js';
import { useListingManagement } from '../hooks/useListingManagement.js';
import { useSystemStatus } from '../hooks/useSystemStatus.js';
import { usePhraseManagement } from '../hooks/usePhraseManagement.js';

// UI Components
import StatusIndicator from './ui/StatusIndicator';

// Tab Components
import DashboardTab from './workflow/DashboardTab';
import GenerateTab from './workflow/GenerateTab';
import ReviewTab from './workflow/ReviewTab';
import ListingsTab from './workflow/ListingsTab';
import PublishTab from './workflow/PublishTab';
import AutomationTab from './workflow/AutomationTab';

// Services
import { listingTracker } from '../services/listingTracker.js';

// Tab configuration
const WORKFLOW_TABS = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Assessment, 
    color: '#6B73FF' // Indigo
  },
  { 
    id: 'generate', 
    label: 'Generate Images', 
    icon: Waves, 
    color: '#2196F3' // Blue
  },
  { 
    id: 'review', 
    label: 'Review & Approve', 
    icon: Visibility, 
    color: '#FF9800' // Amber
  },
  { 
    id: 'listings', 
    label: 'Create Listings', 
    icon: Store, 
    color: '#4CAF50' // Green
  },
  { 
    id: 'publish', 
    label: 'Publish to Store', 
    icon: Publish, 
    color: '#9C27B0' // Purple
  },
  { 
    id: 'automation', 
    label: 'AUTOMATION CONTROL', 
    icon: Emergency, 
    color: '#F44336' // Red
  }
];

// StatusIndicator is now imported from ui/StatusIndicator

const WorkflowWaveApp = () => {
  // Core UI state
  const [currentTab, setCurrentTab] = useState(0);
  const [tabStatuses, setTabStatuses] = useState({
    dashboard: 'ready',
    generate: 'inactive',
    review: 'inactive',
    listings: 'inactive',
    publish: 'inactive',
    automation: 'inactive'
  });

  // Batch mode and selection state
  const [batchMode, setBatchMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [approvedImages, setApprovedImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [expandedImage, setExpandedImage] = useState(null);

  // Persistent metrics state
  const [persistentMetrics, setPersistentMetrics] = useState(listingTracker.getMetrics());

  // Custom hooks
  const {
    processedImages,
    setProcessedImages,
    imageStats,
    setImageStats: _setImageStats,
    loading,
    setLoading: _setLoading,
    error,
    setError: _setError,
    fetchImages,
    handleImageDownload: _handleImageDownload,
    generateVariationsForApproved: _generateVariationsForApproved,
    CONTENT_THEMES
  } = useImageProcessing();

  const {
    automationProgress,
    selectedScale,
    setSelectedScale,
    confirmationDialog,
    setConfirmationDialog,
    automationListings,
    automationSummary,
    showSummaryDialog,
    setShowSummaryDialog,
    showAutomationGallery,
    setShowAutomationGallery,
    handleStartAutomation,
    handleStopAutomation,
    generateAutomationSummary: _generateAutomationSummary,
    AUTOMATION_SCALES
  } = useAutomation();

  const {
    creatingListings,
    setCreatingListings,
    createdProducts,
    setCreatedProducts,
    listingProgress,
    setListingProgress,
    bulkDeleteDialog,
    setBulkDeleteDialog,
    bulkDeleteLoading,
    setBulkDeleteLoading,
    confirmPhrase,
    setConfirmPhrase,
    createPrintifyListings,
    handleProductDelete,
    handleBulkDelete,
    handleRefreshProducts,
    handleProductPublish,
    handleBulkPublish
  } = useListingManagement();

  const {
    systemStatus,
    setSystemStatus: _setSystemStatus,
    systemCheckDialog: _systemCheckDialog,
    setSystemCheckDialog: _setSystemCheckDialog,
    getSystemHealth: _getSystemHealth,
    isSystemReady,
    getSystemSummary,
    checkSystemStatus: _checkSystemStatus,
    refreshSystemStatus: _refreshSystemStatus
  } = useSystemStatus();

  const {
    approvedPhrases,
    setApprovedPhrases,
    rejectedPhrases,
    setRejectedPhrases,
    showPhraseHistory,
    setShowPhraseHistory,
    editingPhrase: _editingPhrase,
    setEditingPhrase: _setEditingPhrase,
    editDialog,
    setEditDialog,
    handlePhraseApproval,
    handleBatchPhraseApproval,
    handlePhraseEdit,
    handleSaveEditedPhrase: _handleSaveEditedPhrase,
    clearPhraseHistory: _clearPhraseHistory,
    exportPhraseData: _exportPhraseData,
    getPhraseStats: _getPhraseStats,
    getPhraseQualityInsights: _getPhraseQualityInsights
  } = usePhraseManagement();

  // Update persistent metrics when listings change
  useEffect(() => {
    setPersistentMetrics(listingTracker.getMetrics());
  }, [createdProducts]);

  // Update tab statuses based on state
  useEffect(() => {
    setTabStatuses({
      dashboard: 'ready',
      generate: loading ? 'processing' : processedImages.length > 0 ? 'ready' : 'inactive',
      review: processedImages.length > 0 ? 'ready' : 'inactive',
      listings: approvedImages.length > 0 ? 'ready' : 'inactive',
      publish: createdProducts.length > 0 ? 'ready' : 'inactive',
      automation: isSystemReady() ? 'ready' : 'checking'
    });
  }, [loading, processedImages.length, approvedImages.length, createdProducts.length, isSystemReady]);

  // Update approved images when images are approved
  useEffect(() => {
    const newApprovedImages = processedImages.filter(img => 
      !deletedImages.includes(img.id) && 
      approvedPhrases.some(phrase => phrase.id === img.id)
    );
    setApprovedImages(newApprovedImages);
  }, [processedImages, deletedImages, approvedPhrases]);

  // Enhanced image approval handlers
  const handleImageApproval = (imageId, action) => {
    handlePhraseApproval(imageId, action, processedImages, setProcessedImages);
  };

  const handleBatchApproval = (action) => {
    handleBatchPhraseApproval(selectedImages, action, processedImages, setProcessedImages, setSelectedImages);
  };

  const handleImageEdit = (image) => {
    handlePhraseEdit(image, processedImages);
  };

  const handleImageDelete = (imageId) => {
    console.log('🗑️ Deleting image:', imageId);
    setDeletedImages(prev => [...prev, imageId]);
    setSelectedImages(prev => prev.filter(id => id !== imageId));
    
    // Remove from approved/rejected if present
    setApprovedPhrases(prev => prev.filter(p => p.id !== imageId));
    setRejectedPhrases(prev => prev.filter(p => p.id !== imageId));
  };

  // Enhanced listing creation
  const createPrintifyListingsHandler = async () => {
    const products = await createPrintifyListings(approvedImages);
    if (products && products.length > 0) {
      setCreatedProducts(prev => [...prev, ...products]);
    }
  };

  // Render tab content
  const renderTabContent = () => {
    const commonProps = {
      StatusIndicator,
      tabStatuses,
      persistentMetrics
    };

    switch (currentTab) {
      case 0: // Dashboard
        return (
          <DashboardTab 
            {...commonProps}
            imageStats={imageStats}
            systemStatus={systemStatus}
            loading={loading}
            setCurrentTab={setCurrentTab}
          />
        );
      
      case 1: // Generate
        return (
          <GenerateTab 
            {...commonProps}
            batchMode={batchMode}
            setBatchMode={setBatchMode}
            fetchImages={fetchImages}
            loading={loading}
            CONTENT_THEMES={CONTENT_THEMES}
            error={error}
            imageStats={imageStats}
            processedImages={processedImages}
            handlePhraseApproval={handleImageApproval}
            handlePhraseEdit={handleImageEdit}
            approvedPhrases={approvedPhrases}
            rejectedPhrases={rejectedPhrases}
            showPhraseHistory={showPhraseHistory}
            setShowPhraseHistory={setShowPhraseHistory}
          />
        );
      
      case 2: // Review
        return (
          <ReviewTab 
            {...commonProps}
            batchMode={batchMode}
            setBatchMode={setBatchMode}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            approvedImages={approvedImages}
            setApprovedImages={setApprovedImages}
            deletedImages={deletedImages}
            setDeletedImages={setDeletedImages}
            processedImages={processedImages}
            handleBatchApproval={handleBatchApproval}
            handleImageApproval={handleImageApproval}
            handleImageEdit={handleImageEdit}
            handleImageDelete={handleImageDelete}
            expandedImage={expandedImage}
            setExpandedImage={setExpandedImage}
            editDialog={editDialog}
            setEditDialog={setEditDialog}
          />
        );
      
      case 3: // Listings
        return (
          <ListingsTab 
            {...commonProps}
            approvedImages={approvedImages}
            creatingListings={creatingListings}
            setCreatingListings={setCreatingListings}
            createdProducts={createdProducts}
            setCreatedProducts={setCreatedProducts}
            listingProgress={listingProgress}
            setListingProgress={setListingProgress}
            createPrintifyListings={createPrintifyListingsHandler}
            handleProductDelete={handleProductDelete}
            handleRefreshProducts={handleRefreshProducts}
          />
        );
      
      case 4: // Publish
        return (
          <PublishTab 
            {...commonProps}
            createdProducts={createdProducts}
            handleBulkPublish={handleBulkPublish}
            handleProductPublish={handleProductPublish}
            handleProductDelete={handleProductDelete}
            bulkDeleteDialog={bulkDeleteDialog}
            setBulkDeleteDialog={setBulkDeleteDialog}
            bulkDeleteLoading={bulkDeleteLoading}
            setBulkDeleteLoading={setBulkDeleteLoading}
            confirmPhrase={confirmPhrase}
            setConfirmPhrase={setConfirmPhrase}
            handleBulkDelete={handleBulkDelete}
          />
        );
      
      case 5: // Automation
        return (
          <AutomationTab 
            {...commonProps}
            automationProgress={automationProgress}
            selectedScale={selectedScale}
            setSelectedScale={setSelectedScale}
            confirmationDialog={confirmationDialog}
            setConfirmationDialog={setConfirmationDialog}
            handleStartAutomation={handleStartAutomation}
            handleStopAutomation={handleStopAutomation}
            AUTOMATION_SCALES={AUTOMATION_SCALES}
            automationListings={automationListings}
            showAutomationGallery={showAutomationGallery}
            setShowAutomationGallery={setShowAutomationGallery}
            automationSummary={automationSummary}
            showSummaryDialog={showSummaryDialog}
            setShowSummaryDialog={setShowSummaryDialog}
          />
        );
      
      default:
        return <DashboardTab {...commonProps} />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Waves sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Wave Caption Generator - Workflow System
          </Typography>
          <Chip
            label={`${persistentMetrics.total} Total Created`}
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white', mr: 1 }}
          />
          <Chip
            label={getSystemSummary().message}
            variant="outlined"
            color={getSystemSummary().ready ? 'success' : 'warning'}
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2 }}>
        {/* Cross-tab automation status banner */}
        {automationProgress?.isRunning && currentTab !== 5 && (
          <Alert severity="info" variant="filled" sx={{ m: 2, bgcolor: '#1976d2' }}>
            🚀 {selectedScale} Automation Running - {automationProgress.currentStep}
          </Alert>
        )}

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
            sx={{ minHeight: 80 }}
          >
            {WORKFLOW_TABS.map((tab, index) => {
              const IconComponent = tab.icon;
              const status = tabStatuses[tab.id];
              
              return (
                <Tab
                  key={tab.id}
                  label={
                    <Stack alignItems="center" spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconComponent sx={{ color: tab.color }} />
                        <StatusIndicator status={status} />
                      </Stack>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {tab.label}
                      </Typography>
                    </Stack>
                  }
                  sx={{
                    bgcolor: index === 5 ? '#FFEBEE' : 'transparent', // Red background for emergency tab
                    '&.Mui-selected': {
                      bgcolor: index === 5 ? '#FFCDD2' : '#E3F2FD'
                    },
                    minHeight: 80,
                    py: 1
                  }}
                />
              );
            })}
          </Tabs>
        </Box>

        {/* Tab Content */}
        {renderTabContent()}
      </Container>
    </Box>
  );
};

export default WorkflowWaveApp;