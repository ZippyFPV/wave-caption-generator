import { useState, useEffect, useCallback } from 'react';
import { automationService, AUTOMATION_SCALES } from '../services/fullAutomation.js';

export const useAutomation = () => {
  // Automation-related state
  const [automationProgress, setAutomationProgress] = useState(null);
  const [selectedScale, setSelectedScale] = useState('SINGLE');
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [automationListings, setAutomationListings] = useState([]);
  const [automationSummary, setAutomationSummary] = useState(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [showAutomationGallery, setShowAutomationGallery] = useState(false);

  // Cross-tab automation status monitoring
  useEffect(() => {
    const checkAutomationStatus = () => {
      const status = automationService.getStatus();
      if (status.isRunning && status.progress) {
        setAutomationProgress({
          ...status.progress,
          isRunning: status.isRunning
        });
      }
    };

    // Check immediately and then every 2 seconds
    checkAutomationStatus();
    const interval = setInterval(checkAutomationStatus, 2000);

    // Storage event listener for cross-tab communication
    const handleStorageChange = (e) => {
      if (e.key === 'automationStatus') {
        checkAutomationStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Start automation
  const handleStartAutomation = useCallback(async () => {
    try {
      console.log(`🚀 Starting ${selectedScale} automation...`);
      
      // Reset listings for new run
      setAutomationListings([]);
      setAutomationSummary(null);
      
      // Update localStorage for cross-tab communication
      localStorage.setItem('automationStatus', JSON.stringify({
        isRunning: true,
        scale: selectedScale,
        startTime: Date.now()
      }));

      const result = await automationService.startAutomation(
        selectedScale,
        // Progress callback
        (progress) => {
          setAutomationProgress(progress);
          // Update localStorage for cross-tab sync
          localStorage.setItem('automationProgress', JSON.stringify(progress));
        },
        // Listing callback
        (listing) => {
          console.log('📝 New listing update:', listing.listingId, listing.success ? '✅' : '⏳');
          setAutomationListings(prev => {
            const updated = prev.filter(l => l.listingId !== listing.listingId);
            return [...updated, listing].slice(-20); // Keep last 20
          });
        }
      );

      // Show completion summary
      setAutomationSummary(result);
      setShowSummaryDialog(true);
      
      console.log('✅ Automation completed:', result);
      
      // Clear cross-tab status
      localStorage.removeItem('automationStatus');
      localStorage.removeItem('automationProgress');

    } catch (error) {
      console.error('❌ Automation failed:', error);
      
      // Clear cross-tab status on error
      localStorage.removeItem('automationStatus');
      localStorage.removeItem('automationProgress');
      
      setAutomationProgress(prev => prev ? {
        ...prev,
        currentStep: 'error',
        errorMessage: error.message
      } : null);
    }
  }, [selectedScale]);

  // Stop automation
  const handleStopAutomation = useCallback(() => {
    console.log('🛑 Stopping automation...');
    automationService.stopAutomation();
    
    // Clear cross-tab status
    localStorage.removeItem('automationStatus');
    localStorage.removeItem('automationProgress');
  }, []);

  // Generate automation summary for reporting
  const generateAutomationSummary = useCallback(() => {
    const metrics = {
      scale: selectedScale,
      progress: automationProgress,
      listings: automationListings.length,
      successful: automationListings.filter(l => l.success).length,
      failed: automationListings.filter(l => l.error).length,
    };
    
    return {
      ...metrics,
      successRate: metrics.listings > 0 ? 
        Math.round((metrics.successful / metrics.listings) * 100) : 0
    };
  }, [selectedScale, automationProgress, automationListings]);

  return {
    // State
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
    
    // Actions
    handleStartAutomation,
    handleStopAutomation,
    generateAutomationSummary,
    
    // Constants
    AUTOMATION_SCALES
  };
};