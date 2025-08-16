/**
 * Listing Tracker Service - Persistent tracking of all completed listings
 * 
 * Ensures accurate performance metrics by storing all completed listings
 * in localStorage for persistence across sessions.
 */

const STORAGE_KEY = 'wave_commerce_listings';

export class ListingTracker {
  constructor() {
    this.listings = this.loadFromStorage();
  }

  /**
   * Load listings from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading listings from storage:', error);
      return [];
    }
  }

  /**
   * Save listings to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.listings));
    } catch (error) {
      console.error('Error saving listings to storage:', error);
    }
  }

  /**
   * Record a completed listing
   */
  recordListing(listing) {
    const record = {
      id: listing.listingId || listing.printifyId || `listing_${Date.now()}`,
      printifyId: listing.printifyId,
      title: listing.productCopy?.title || listing.title,
      caption: listing.imageData?.caption || listing.caption,
      context: listing.imageData?.context || listing.context,
      published: listing.published !== false,
      createdAt: listing.completedTime || Date.now(),
      source: listing.source || 'automation', // 'automation' or 'manual'
      success: listing.success !== false,
      // Additional fields for duplicate detection
      captionHash: this.generateCaptionHash(listing.imageData?.caption || listing.caption),
      contextCaptionCombo: `${listing.imageData?.context || listing.context}_${listing.imageData?.caption || listing.caption}`
    };

    // Check for potential duplicates before adding
    const duplicateCheck = this.checkForDuplicates(record);
    if (duplicateCheck.isDuplicate) {
      console.warn(`⚠️ Potential duplicate detected:`, duplicateCheck);
    }

    // Avoid exact duplicates
    const existingIndex = this.listings.findIndex(l => 
      l.printifyId === record.printifyId || l.id === record.id
    );

    if (existingIndex >= 0) {
      this.listings[existingIndex] = record;
    } else {
      this.listings.push(record);
    }

    this.saveToStorage();
    
    console.log(`📊 Listing recorded: ${record.title} (${record.context})`);
    console.log(`📈 Total recorded listings: ${this.listings.length}`);
    
    return record;
  }

  /**
   * Generate a simple hash of the caption for duplicate detection
   */
  generateCaptionHash(caption) {
    if (!caption) return null;
    // Simple hash function for caption similarity
    const cleanCaption = caption.toLowerCase().replace(/[^a-z0-9]/g, '');
    let hash = 0;
    for (let i = 0; i < cleanCaption.length; i++) {
      const char = cleanCaption.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  /**
   * Check for potential duplicates
   */
  checkForDuplicates(newRecord) {
    const duplicates = {
      exact: [],
      similar: [],
      sameContext: []
    };

    for (const existing of this.listings) {
      // Exact caption match
      if (existing.caption === newRecord.caption) {
        duplicates.exact.push(existing);
      }
      
      // Similar caption (same hash)
      if (existing.captionHash === newRecord.captionHash && existing.captionHash !== null) {
        duplicates.similar.push(existing);
      }
      
      // Same context + similar caption
      if (existing.context === newRecord.context && 
          existing.captionHash === newRecord.captionHash) {
        duplicates.sameContext.push(existing);
      }
    }

    const isDuplicate = duplicates.exact.length > 0 || duplicates.sameContext.length > 0;
    
    return {
      isDuplicate,
      duplicates,
      riskLevel: this.calculateDuplicateRisk(duplicates)
    };
  }

  /**
   * Calculate duplicate risk level
   */
  calculateDuplicateRisk(duplicates) {
    if (duplicates.exact.length > 0) return 'HIGH';
    if (duplicates.sameContext.length > 0) return 'MEDIUM';
    if (duplicates.similar.length > 0) return 'LOW';
    return 'NONE';
  }

  /**
   * Get duplicate analysis for all listings
   */
  getDuplicateAnalysis() {
    const analysis = {
      total: this.listings.length,
      exactDuplicates: 0,
      similarCaptions: 0,
      contextOverlaps: {},
      riskListings: []
    };

    // Count context overlaps
    const contextCounts = {};
    this.listings.forEach(listing => {
      const context = listing.context || 'unknown';
      contextCounts[context] = (contextCounts[context] || 0) + 1;
    });
    analysis.contextOverlaps = contextCounts;

    // Find potential duplicates
    const captionGroups = {};
    this.listings.forEach(listing => {
      if (listing.captionHash) {
        if (!captionGroups[listing.captionHash]) {
          captionGroups[listing.captionHash] = [];
        }
        captionGroups[listing.captionHash].push(listing);
      }
    });

    // Identify risk listings
    Object.values(captionGroups).forEach(group => {
      if (group.length > 1) {
        analysis.similarCaptions += group.length;
        analysis.riskListings.push(...group);
      }
    });

    return analysis;
  }

  /**
   * Get all recorded listings
   */
  getAllListings() {
    return this.listings;
  }

  /**
   * Get listings by source (automation/manual)
   */
  getListingsBySource(source) {
    return this.listings.filter(l => l.source === source);
  }

  /**
   * Get category distribution
   */
  getCategoryDistribution() {
    const contexts = ['bathroom', 'office', 'kitchen', 'hallway', 'bedroom', 'livingroom'];
    const distribution = {};
    
    contexts.forEach(context => {
      distribution[context] = this.listings.filter(l => l.context === context).length;
    });

    const total = this.listings.length;
    
    return {
      total,
      byContext: distribution,
      percentages: Object.fromEntries(
        Object.entries(distribution).map(([context, count]) => [
          context, 
          total > 0 ? ((count / total) * 100).toFixed(1) : 0
        ])
      )
    };
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const all = this.listings;
    const automation = this.getListingsBySource('automation');
    const manual = this.getListingsBySource('manual');
    const published = all.filter(l => l.published);
    const successful = all.filter(l => l.success);

    return {
      total: all.length,
      automation: automation.length,
      manual: manual.length,
      published: published.length,
      successful: successful.length,
      successRate: all.length > 0 ? ((successful.length / all.length) * 100).toFixed(1) : 100
    };
  }

  /**
   * Clear all listings (use with caution)
   */
  clearAll() {
    this.listings = [];
    this.saveToStorage();
    console.log('🗑️ All listings cleared');
  }

  /**
   * Export listings as JSON
   */
  exportData() {
    return {
      listings: this.listings,
      exported: Date.now(),
      version: '1.0',
      duplicateAnalysis: this.getDuplicateAnalysis()
    };
  }

  /**
   * Get listings that might be duplicates
   */
  getPotentialDuplicates() {
    const analysis = this.getDuplicateAnalysis();
    return analysis.riskListings;
  }

  /**
   * Validate a new listing against existing ones before creation
   */
  validateNewListing(caption, context) {
    const mockRecord = {
      caption,
      context,
      captionHash: this.generateCaptionHash(caption),
      contextCaptionCombo: `${context}_${caption}`
    };

    return this.checkForDuplicates(mockRecord);
  }
}

// Export singleton instance
export const listingTracker = new ListingTracker();
export default listingTracker;

// Quick function to check if a caption would be a duplicate
export const checkCaptionDuplicate = (caption, context) => {
  return listingTracker.validateNewListing(caption, context);
};