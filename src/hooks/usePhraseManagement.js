import { useState, useCallback } from 'react';

export const usePhraseManagement = () => {
  // Phrase management state
  const [approvedPhrases, setApprovedPhrases] = useState([]);
  const [rejectedPhrases, setRejectedPhrases] = useState([]);
  const [showPhraseHistory, setShowPhraseHistory] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState(null);
  const [editDialog, setEditDialog] = useState(null);

  // Handle phrase approval/rejection
  const handlePhraseApproval = useCallback((imageId, action, processedImages, setProcessedImages) => {
    console.log(`${action === 'approve' ? '✅' : '❌'} ${action === 'approve' ? 'Approving' : 'Rejecting'} phrase for image:`, imageId);
    
    const image = processedImages.find(img => img.id === imageId);
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
      setApprovedPhrases(prev => {
        // Remove from rejected if it was there
        setRejectedPhrases(rejected => rejected.filter(p => p.id !== imageId));
        // Add to approved if not already there
        const exists = prev.some(p => p.id === imageId);
        return exists ? prev : [...prev, phraseData];
      });
    } else if (action === 'reject') {
      setRejectedPhrases(prev => {
        // Remove from approved if it was there
        setApprovedPhrases(approved => approved.filter(p => p.id !== imageId));
        // Add to rejected if not already there
        const exists = prev.some(p => p.id !== imageId);
        return exists ? prev : [...prev, phraseData];
      });
    }

    // Update the image's approval status in processedImages
    setProcessedImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, approved: action === 'approve', rejected: action === 'reject' }
        : img
    ));
  }, []);

  // Handle batch phrase approval
  const handleBatchPhraseApproval = useCallback((selectedImages, action, processedImages, setProcessedImages, setSelectedImages) => {
    console.log(`${action === 'approve' ? '✅' : '❌'} Batch ${action} for ${selectedImages.length} phrases`);
    
    selectedImages.forEach(imageId => {
      handlePhraseApproval(imageId, action, processedImages, setProcessedImages);
    });
    
    // Clear selection after batch operation
    setSelectedImages([]);
  }, [handlePhraseApproval]);

  // Handle phrase editing
  const handlePhraseEdit = useCallback((imageOrId, processedImages) => {
    const image = typeof imageOrId === 'string' 
      ? processedImages.find(img => img.id === imageOrId)
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
  }, []);

  // Save edited phrase
  const handleSaveEditedPhrase = useCallback((editedData, processedImages, setProcessedImages) => {
    if (!editDialog) return;

    console.log('💾 Saving edited phrase for image:', editDialog.id);
    
    // Update the processed image with new caption/title
    setProcessedImages(prev => prev.map(img => 
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
    ));

    // Update approved/rejected lists if this phrase was in them
    setApprovedPhrases(prev => prev.map(p => 
      p.id === editDialog.id 
        ? { ...p, caption: editedData.caption, edited: true }
        : p
    ));
    
    setRejectedPhrases(prev => prev.map(p => 
      p.id === editDialog.id 
        ? { ...p, caption: editedData.caption, edited: true }
        : p
    ));

    setEditDialog(null);
  }, [editDialog]);

  // Get phrase statistics
  const getPhraseStats = useCallback((processedImages) => {
    const total = processedImages.length;
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
  }, [approvedPhrases.length, rejectedPhrases.length]);

  // Get phrase quality insights
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

    // Analyze contexts
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
    if (approvedPhrases.length > rejectedPhrases.length) {
      recommendations.push('Great approval rate! Keep generating similar content.');
    } else if (rejectedPhrases.length > approvedPhrases.length) {
      recommendations.push('Consider adjusting generation parameters for better quality.');
    }

    return {
      topContexts,
      topPersonas,
      commonPatterns: [],
      recommendations
    };
  }, [approvedPhrases, rejectedPhrases]);

  // Clear phrase history
  const clearPhraseHistory = useCallback(() => {
    console.log('🗑️ Clearing phrase history...');
    setApprovedPhrases([]);
    setRejectedPhrases([]);
  }, []);

  // Export phrase data
  const exportPhraseData = useCallback(() => {
    const data = {
      approved: approvedPhrases,
      rejected: rejectedPhrases,
      stats: getPhraseStats([]),
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
    // State
    approvedPhrases,
    setApprovedPhrases,
    rejectedPhrases,
    setRejectedPhrases,
    showPhraseHistory,
    setShowPhraseHistory,
    editingPhrase,
    setEditingPhrase,
    editDialog,
    setEditDialog,
    
    // Actions
    handlePhraseApproval,
    handleBatchPhraseApproval,
    handlePhraseEdit,
    handleSaveEditedPhrase,
    clearPhraseHistory,
    exportPhraseData,
    
    // Computed values
    getPhraseStats,
    getPhraseQualityInsights
  };
};