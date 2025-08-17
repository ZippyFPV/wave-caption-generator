import { useCallback } from 'react';
import { useWorkflowStore } from '../store/index.js';

/**
 * Enhanced Phrase Management Hook with Centralized State
 * 
 * This hook manages phrase approval, rejection, and editing workflows
 * while leveraging the centralized store for state management.
 * 
 * Single Responsibility: Phrase lifecycle management
 */
export const usePhraseManagement = () => {
  // Get state and actions from centralized store
  const {
    approvedPhrases,
    setApprovedPhrases,
    addApprovedPhrase,
    rejectedPhrases,
    setRejectedPhrases,
    addRejectedPhrase,
    showPhraseHistory,
    setShowPhraseHistory,
    editDialog,
    setEditDialog,
    processedImages,
    setProcessedImages
  } = useWorkflowStore();

  /**
   * Handle approval or rejection of a phrase
   */
  const handlePhraseApproval = useCallback((imageId, action, overrideImages = null, overrideSetImages = null) => {
    console.log(`${action === 'approve' ? '✅' : '❌'} ${action === 'approve' ? 'Approving' : 'Rejecting'} phrase for image:`, imageId);
    
    // Use provided images or get from store
    const images = overrideImages || processedImages;
    const setImages = overrideSetImages || setProcessedImages;
    
    const image = images.find(img => img.id === imageId);
    if (!image) {
      console.warn('Image not found for phrase approval:', imageId);
      return;
    }

    const phraseData = {
      id: imageId,
      caption: image.caption,
      context: image.metadata?.context || 'unknown',
      persona: image.metadata?.persona || 'unknown',
      timestamp: Date.now(),
      action: action
    };

    if (action === 'approve') {
      // Remove from rejected if present, add to approved
      setRejectedPhrases(rejectedPhrases.filter(p => p.id !== imageId));
      addApprovedPhrase(phraseData);
    } else if (action === 'reject') {
      // Remove from approved if present, add to rejected
      setApprovedPhrases(approvedPhrases.filter(p => p.id !== imageId));
      addRejectedPhrase(phraseData);
    }

    // Update the image's approval status
    const updatedImages = images.map(img => 
      img.id === imageId 
        ? { ...img, approved: action === 'approve', rejected: action === 'reject' }
        : img
    );
    setImages(updatedImages);
  }, [processedImages, setProcessedImages, approvedPhrases, setApprovedPhrases, addApprovedPhrase, rejectedPhrases, setRejectedPhrases, addRejectedPhrase]);

  /**
   * Handle batch phrase approval/rejection
   */
  const handleBatchPhraseApproval = useCallback((selectedImages, action, overrideImages = null, overrideSetImages = null, clearSelection = null) => {
    console.log(`${action === 'approve' ? '✅' : '❌'} Batch ${action} for ${selectedImages.length} phrases`);
    
    selectedImages.forEach(imageId => {
      handlePhraseApproval(imageId, action, overrideImages, overrideSetImages);
    });
    
    // Clear selection if function provided
    if (clearSelection) {
      clearSelection([]);
    }
  }, [handlePhraseApproval]);

  /**
   * Handle phrase editing
   */
  const handlePhraseEdit = useCallback((imageOrId, overrideImages = null) => {
    const images = overrideImages || processedImages;
    const image = typeof imageOrId === 'string' 
      ? images.find(img => img.id === imageOrId)
      : imageOrId;
      
    if (!image) {
      console.warn('Image not found for phrase editing:', imageOrId);
      return;
    }

    console.log('✏️ Opening phrase editor for image:', image.id);
    
    setEditDialog({
      id: image.id,
      caption: image.caption,
      title: `Wave Art - ${image.caption}`,
      description: `Beautiful ocean wave art featuring "${image.caption}". Perfect for adding a calming, natural element to any space.`,
      processed: image.processed,
      metadata: image.metadata
    });
  }, [processedImages, setEditDialog]);

  /**
   * Save edited phrase
   */
  const handleSaveEditedPhrase = useCallback((editedData, overrideImages = null, overrideSetImages = null) => {
    if (!editDialog) return;

    console.log('💾 Saving edited phrase for image:', editDialog.id);
    
    const images = overrideImages || processedImages;
    const setImages = overrideSetImages || setProcessedImages;
    
    // Update the processed image with new caption/title
    const updatedImages = images.map(img => 
      img.id === editDialog.id 
        ? { 
            ...img, 
            caption: editedData.caption,
            title: editedData.title,
            description: editedData.description,
            edited: true,
            editedAt: Date.now()
          }
        : img
    );
    setImages(updatedImages);

    // Update approved/rejected lists if this phrase was in them
    const updatedApproved = approvedPhrases.map(p => 
      p.id === editDialog.id 
        ? { ...p, caption: editedData.caption, edited: true }
        : p
    );
    setApprovedPhrases(updatedApproved);
    
    const updatedRejected = rejectedPhrases.map(p => 
      p.id === editDialog.id 
        ? { ...p, caption: editedData.caption, edited: true }
        : p
    );
    setRejectedPhrases(updatedRejected);

    setEditDialog(null);
  }, [editDialog, processedImages, setProcessedImages, approvedPhrases, setApprovedPhrases, rejectedPhrases, setRejectedPhrases, setEditDialog]);

  /**
   * Get phrase statistics
   */
  const getPhraseStats = useCallback((overrideImages = null) => {
    const images = overrideImages || processedImages;
    const total = images.length;
    const approved = approvedPhrases.length;
    const rejected = rejectedPhrases.length;
    const pending = total - approved - rejected;
    const successRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    return {
      total,
      approved,
      rejected,
      pending,
      successRate,
      approvalRate: successRate,
      rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0
    };
  }, [processedImages, approvedPhrases.length, rejectedPhrases.length]);

  /**
   * Get phrase quality insights
   */
  const getPhraseQualityInsights = useCallback(() => {
    const allPhrases = [...approvedPhrases, ...rejectedPhrases];
    
    if (allPhrases.length === 0) {
      return {
        topContexts: [],
        topPersonas: [],
        commonPatterns: [],
        recommendations: []
      };
    }

    // Analyze contexts and personas
    const contextCounts = {};
    const personaCounts = {};
    
    allPhrases.forEach(phrase => {
      const context = phrase.context || 'unknown';
      const persona = phrase.persona || 'unknown';
      
      contextCounts[context] = (contextCounts[context] || 0) + 1;
      personaCounts[persona] = (personaCounts[persona] || 0) + 1;
    });

    const topContexts = Object.entries(contextCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([context, count]) => ({ context, count }));

    const topPersonas = Object.entries(personaCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([persona, count]) => ({ persona, count }));

    // Generate recommendations
    const recommendations = [];
    const approvalRate = approvedPhrases.length / allPhrases.length;
    
    if (approvalRate > 0.7) {
      recommendations.push('Excellent approval rate! Continue with current phrase generation strategy.');
    } else if (approvalRate < 0.3) {
      recommendations.push('Low approval rate. Consider adjusting phrase generation parameters.');
    } else {
      recommendations.push('Moderate approval rate. Fine-tune based on top performing contexts and personas.');
    }

    return {
      topContexts,
      topPersonas,
      commonPatterns: [],
      recommendations
    };
  }, [approvedPhrases, rejectedPhrases]);

  /**
   * Clear phrase history
   */
  const clearPhraseHistory = useCallback(() => {
    console.log('🗑️ Clearing phrase history...');
    setApprovedPhrases([]);
    setRejectedPhrases([]);
  }, [setApprovedPhrases, setRejectedPhrases]);

  /**
   * Export phrase data
   */
  const exportPhraseData = useCallback(() => {
    const data = {
      approved: approvedPhrases,
      rejected: rejectedPhrases,
      stats: getPhraseStats(),
      insights: getPhraseQualityInsights(),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `phrase-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📁 Phrase data exported');
  }, [approvedPhrases, rejectedPhrases, getPhraseStats, getPhraseQualityInsights]);

  return {
    // State (from store)
    approvedPhrases,
    rejectedPhrases,
    showPhraseHistory,
    editDialog,
    
    // Store setters for backward compatibility
    setApprovedPhrases,
    setRejectedPhrases,
    setShowPhraseHistory,
    setEditDialog,
    editingPhrase: null, // Legacy compatibility
    setEditingPhrase: () => {}, // Legacy compatibility
    
    // Core actions
    handlePhraseApproval,
    handleBatchPhraseApproval,
    handlePhraseEdit,
    handleSaveEditedPhrase,
    clearPhraseHistory,
    exportPhraseData,
    
    // Analytics
    getPhraseStats,
    getPhraseQualityInsights
  };
};

export default usePhraseManagement;