import { describe, it, expect, vi } from 'vitest';
import {
  generateCaptionPhrase,
  calculateMaxCombinations,
  getPhraseQualityStats,
  WAVE_DESCRIPTORS,
  WAVE_ACTIONS
} from '../phraseComponents.js';

describe('Phrase Components System', () => {
  describe('generateCaptionPhrase', () => {
    it('should generate captions with proper format', () => {
      const caption = generateCaptionPhrase('big', 'professional', 'lifestyle');
      
      expect(caption).toMatch(/^\[.+\]$/); // Should be wrapped in brackets
      expect(caption.length).toBeGreaterThan(10); // Should have meaningful content
    });

    it('should generate different captions for different wave sizes', () => {
      const bigWaveCaption = generateCaptionPhrase('big');
      const smallWaveCaption = generateCaptionPhrase('small');
      const mediumWaveCaption = generateCaptionPhrase('medium');
      
      // All should be different (with high probability)
      expect(bigWaveCaption).not.toBe(smallWaveCaption);
      expect(bigWaveCaption).not.toBe(mediumWaveCaption);
      expect(smallWaveCaption).not.toBe(mediumWaveCaption);
    });

    it('should use appropriate descriptors for wave size', () => {
      // Test multiple generations to check consistency
      for (let i = 0; i < 10; i++) {
        const bigCaption = generateCaptionPhrase('big');
        const smallCaption = generateCaptionPhrase('small');
        
        // Big wave captions should contain a descriptor from the big pool
        const bigPool = WAVE_DESCRIPTORS.big.map(d => d.toLowerCase());
        const smallPool = WAVE_DESCRIPTORS.small.map(d => d.toLowerCase());
        const captionWords = (bigCaption + ' ' + smallCaption).toLowerCase();

        const containsPower = bigPool.some(w => captionWords.includes(w));
        const containsGentle = smallPool.some(w => captionWords.includes(w));

        expect(containsPower).toBe(true);
        expect(containsGentle).toBe(true);
      }
    });

    it('should handle invalid wave sizes gracefully', () => {
      const caption = generateCaptionPhrase('invalid-size');
      
      expect(caption).toMatch(/^\[.+\]$/);
      expect(caption.length).toBeGreaterThan(10);
    });

    it('should generate unique captions on repeated calls', () => {
      const captions = new Set();
      
      // Generate multiple captions
      for (let i = 0; i < 20; i++) {
        const caption = generateCaptionPhrase('medium');
        captions.add(caption);
      }
      
      // Should have good variety (at least 10 unique out of 20)
      expect(captions.size).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Wave Action Alignment', () => {
    it('should have appropriate actions for each wave size', () => {
      const dramaticActions = WAVE_ACTIONS.dramatic;
      const gentleActions = WAVE_ACTIONS.gentle;
      const normalActions = WAVE_ACTIONS.normal;
      
      // Check that we have actions for each category
      expect(dramaticActions.length).toBeGreaterThan(0);
      expect(gentleActions.length).toBeGreaterThan(0);
      expect(normalActions.length).toBeGreaterThan(0);
      
      // Check that dramatic actions contain power words
      dramaticActions.forEach(action => {
        const bigPool = WAVE_DESCRIPTORS.big.map(d => d.toLowerCase());
        const hasBig = bigPool.some(w => action.toLowerCase().includes(w));
        expect(hasBig).toBe(true);
      });
       
       // Check that gentle actions contain gentle words
      gentleActions.forEach(action => {
        const smallPool = WAVE_DESCRIPTORS.small.map(d => d.toLowerCase());
        const hasSmall = smallPool.some(w => action.toLowerCase().includes(w));
        expect(hasSmall).toBe(true);
      });
       
       // Check that normal actions contain moderate words
       normalActions.forEach(action => {
         const hasModerateWords = /steady|consistent|moderate|regular|standard|typical|routine|average|normal|reliable/i.test(action);
         expect(hasModerateWords).toBe(true);
       });
    });
  });

  describe('calculateMaxCombinations', () => {
    it('should return valid combination statistics', () => {
      const stats = calculateMaxCombinations();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byCategory');
      expect(stats).toHaveProperty('dailyCapacity');
      expect(stats).toHaveProperty('monthlyCapacity');
      
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byCategory.bigWaves).toBeGreaterThan(0);
      expect(stats.byCategory.smallWaves).toBeGreaterThan(0);
      expect(stats.byCategory.mediumWaves).toBeGreaterThan(0);
      
      // Daily capacity should be reasonable
      expect(stats.dailyCapacity).toBeGreaterThan(stats.total);
      expect(stats.monthlyCapacity).toBeGreaterThan(stats.dailyCapacity);
    });
  });

  describe('getPhraseQualityStats', () => {
    it('should return quality assurance information', () => {
      const qualityStats = getPhraseQualityStats();
      
      expect(qualityStats).toHaveProperty('qualityAssurance');
      expect(qualityStats).toHaveProperty('recommendations');
      
      expect(qualityStats.qualityAssurance.waveAlignmentEnabled).toBe(true);
      expect(qualityStats.qualityAssurance.validationActive).toBe(true);
      expect(qualityStats.qualityAssurance.authenticityScore).toBeGreaterThan(90);
      
      expect(Array.isArray(qualityStats.recommendations)).toBe(true);
    });
  });

  describe('Wave Size Validation', () => {
    it('should consistently map wave sizes to appropriate actions', () => {
      // Test consistency over multiple generations
      const testRuns = 50;
      const bigWaveResults = [];
      const smallWaveResults = [];
      const mediumWaveResults = [];
      
      for (let i = 0; i < testRuns; i++) {
        bigWaveResults.push(generateCaptionPhrase('big'));
        smallWaveResults.push(generateCaptionPhrase('small'));
        mediumWaveResults.push(generateCaptionPhrase('medium'));
      }
      
      // Check that big wave captions consistently use dramatic language
      const bigWavePowerWords = bigWaveResults.filter(caption => 
        WAVE_DESCRIPTORS.big.some(d => caption.toLowerCase().includes(d.toLowerCase()))
      );
      // Expect a strong majority, not necessarily 100% due to randomness
      expect(bigWavePowerWords.length).toBeGreaterThanOrEqual(Math.floor(testRuns * 0.7));
      
      // Check that small wave captions consistently use gentle language
      const smallWaveGentleWords = smallWaveResults.filter(caption => 
        WAVE_DESCRIPTORS.small.some(d => caption.toLowerCase().includes(d.toLowerCase()))
      );
      expect(smallWaveGentleWords.length).toBeGreaterThanOrEqual(Math.floor(testRuns * 0.7));
      
      // Check that medium wave captions consistently use moderate language
      const mediumWaveModerateWords = mediumWaveResults.filter(caption => 
        /steady|consistent|moderate|regular|standard|typical|routine|average|normal|reliable/i.test(caption)
      );
      expect(mediumWaveModerateWords.length).toBeGreaterThanOrEqual(Math.floor(testRuns * 0.7));
    });
  });

  describe('Performance Tests', () => {
    it('should generate captions quickly', () => {
      const startTime = performance.now();
      
      // Generate 1000 captions
      for (let i = 0; i < 1000; i++) {
        generateCaptionPhrase('medium');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete in under 100ms
      expect(duration).toBeLessThan(100);
    });
    
    it('should handle concurrent generation', async () => {
      const promises = [];
      
      // Generate 100 captions concurrently
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve(generateCaptionPhrase('big')));
      }
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(100);
      results.forEach(caption => {
        expect(caption).toMatch(/^\[.+\]$/);
      });
    });
  });
});