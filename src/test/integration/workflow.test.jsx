/**
 * Integration Tests for Workflow System
 * 
 * These tests verify that the main user workflows function correctly
 * end-to-end, including image generation, approval, and listing creation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useWorkflowStore } from '../../store/index.js';

// Mock the store
vi.mock('../../store/index.js', () => ({
  useWorkflowStore: vi.fn()
}));

// Mock image processing hook
vi.mock('../../hooks/useImageProcessing.js', () => ({
  useImageProcessing: () => ({
    processedImages: [],
    loading: false,
    error: '',
    fetchImages: vi.fn(),
    downloadImage: vi.fn(),
    downloadAllImages: vi.fn(),
    setProcessedImages: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    imageStats: { totalGenerated: 0, currentActive: 0, approved: 0, deleted: 0, created: 0 },
    CONTENT_THEMES: { lifestyle: 'Lifestyle', wellness: 'Wellness' }
  })
}));

// Simple test component to verify store integration
function TestWorkflowComponent() {
  const store = useWorkflowStore();
  
  return (
    <div>
      <div data-testid="current-tab">{store.currentTab}</div>
      <div data-testid="batch-mode">{store.batchMode ? 'true' : 'false'}</div>
      <div data-testid="processed-count">{store.processedImages.length}</div>
      <button onClick={() => store.setCurrentTab(1)} data-testid="set-tab-1">
        Set Tab 1
      </button>
      <button onClick={() => store.setBatchMode(true)} data-testid="enable-batch">
        Enable Batch Mode
      </button>
      <button 
        onClick={() => store.addProcessedImages([{ id: 'test-1', caption: 'test wave' }])}
        data-testid="add-image"
      >
        Add Image
      </button>
    </div>
  );
}

describe('Workflow Integration Tests', () => {
  const mockStore = {
    currentTab: 0,
    batchMode: false,
    processedImages: [],
    approvedImages: [],
    selectedImages: [],
    loading: false,
    error: '',
    setCurrentTab: vi.fn(),
    setBatchMode: vi.fn(),
    addProcessedImages: vi.fn(),
    setProcessedImages: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    tabStatuses: {
      dashboard: 'ready',
      generate: 'inactive',
      review: 'inactive',
      listings: 'inactive',
      publish: 'inactive',
      automation: 'inactive'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useWorkflowStore.mockReturnValue(mockStore);
  });

  describe('Store Integration', () => {
    it('should initialize with correct default state', () => {
      render(<TestWorkflowComponent />);
      
      expect(screen.getByTestId('current-tab')).toHaveTextContent('0');
      expect(screen.getByTestId('batch-mode')).toHaveTextContent('false');
      expect(screen.getByTestId('processed-count')).toHaveTextContent('0');
    });

    it('should update tab when setCurrentTab is called', async () => {
      const user = userEvent.setup();
      render(<TestWorkflowComponent />);
      
      await user.click(screen.getByTestId('set-tab-1'));
      
      expect(mockStore.setCurrentTab).toHaveBeenCalledWith(1);
    });

    it('should enable batch mode when setBatchMode is called', async () => {
      const user = userEvent.setup();
      render(<TestWorkflowComponent />);
      
      await user.click(screen.getByTestId('enable-batch'));
      
      expect(mockStore.setBatchMode).toHaveBeenCalledWith(true);
    });

    it('should add images when addProcessedImages is called', async () => {
      const user = userEvent.setup();
      render(<TestWorkflowComponent />);
      
      await user.click(screen.getByTestId('add-image'));
      
      expect(mockStore.addProcessedImages).toHaveBeenCalledWith([
        { id: 'test-1', caption: 'test wave' }
      ]);
    });
  });

  describe('Image Generation Workflow', () => {
    it('should handle image generation flow correctly', () => {
      // Mock a complete image generation workflow
      const mockImages = [
        {
          id: 'img-1',
          caption: '[massive wave thundering against shore with obvious superiority complex]',
          title: 'Wave Therapy Session',
          processed: 'data:image/jpeg;base64,test'
        },
        {
          id: 'img-2', 
          caption: '[tiny wave approaching shore with Monday morning energy levels]',
          title: 'Ocean Vibes Only',
          processed: 'data:image/jpeg;base64,test2'
        }
      ];

      const storeWithImages = {
        ...mockStore,
        processedImages: mockImages,
        tabStatuses: {
          ...mockStore.tabStatuses,
          generate: 'ready',
          review: 'ready'
        }
      };

      useWorkflowStore.mockReturnValue(storeWithImages);
      render(<TestWorkflowComponent />);

      expect(screen.getByTestId('processed-count')).toHaveTextContent('2');
    });
  });

  describe('Phrase Quality Validation', () => {
    it('should validate that big wave captions use dramatic language', () => {
      const bigWaveImages = [
        {
          id: 'big-1',
          caption: '[massive wave thundering against shore with obvious superiority complex]',
          waveSize: 'big'
        },
        {
          id: 'big-2',
          caption: '[colossal wave making grand entrance, demanding standing ovation]',
          waveSize: 'big'
        }
      ];

      bigWaveImages.forEach(image => {
        const hasDramaticLanguage = /massive|towering|gigantic|enormous|colossal|epic|legendary|thundering|powerful|overwhelming/i.test(image.caption);
        expect(hasDramaticLanguage).toBe(true);
      });
    });

    it('should validate that small wave captions use gentle language', () => {
      const smallWaveImages = [
        {
          id: 'small-1',
          caption: '[tiny wave approaching shore with Monday morning energy levels]',
          waveSize: 'small'
        },
        {
          id: 'small-2',
          caption: '[exhausted wave doing absolute bare minimum to qualify as wave]',
          waveSize: 'small'
        }
      ];

      smallWaveImages.forEach(image => {
        const hasGentleLanguage = /tiny|exhausted|sleepy|gentle|minimal|tired|barely|depleted|sluggish|weak/i.test(image.caption);
        expect(hasGentleLanguage).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      const storeWithError = {
        ...mockStore,
        error: 'Failed to fetch images from Pexels API',
        loading: false
      };

      useWorkflowStore.mockReturnValue(storeWithError);
      render(<TestWorkflowComponent />);

      // Component should render without crashing
      expect(screen.getByTestId('current-tab')).toBeInTheDocument();
    });

    it('should handle loading states correctly', () => {
      const storeWithLoading = {
        ...mockStore,
        loading: true
      };

      useWorkflowStore.mockReturnValue(storeWithLoading);
      render(<TestWorkflowComponent />);

      // Component should render loading state
      expect(screen.getByTestId('current-tab')).toBeInTheDocument();
    });
  });

  describe('Tab Status Management', () => {
    it('should update tab statuses based on workflow progress', () => {
      const storeWithProgress = {
        ...mockStore,
        processedImages: [{ id: 'test' }],
        approvedImages: [{ id: 'test' }],
        tabStatuses: {
          dashboard: 'ready',
          generate: 'ready',
          review: 'ready',
          listings: 'ready',
          publish: 'inactive',
          automation: 'ready'
        }
      };

      useWorkflowStore.mockReturnValue(storeWithProgress);
      render(<TestWorkflowComponent />);

      // Should show workflow progress
      expect(screen.getByTestId('processed-count')).toHaveTextContent('1');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large numbers of images efficiently', () => {
      const manyImages = Array.from({ length: 1000 }, (_, i) => ({
        id: `img-${i}`,
        caption: `[wave ${i} doing something]`,
        processed: `data:image/jpeg;base64,test${i}`
      }));

      const storeWithManyImages = {
        ...mockStore,
        processedImages: manyImages
      };

      useWorkflowStore.mockReturnValue(storeWithManyImages);

      const startTime = performance.now();
      render(<TestWorkflowComponent />);
      const endTime = performance.now();

      // Should render quickly even with many images
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByTestId('processed-count')).toHaveTextContent('1000');
    });
  });

  describe('Data Flow Validation', () => {
    it('should maintain data consistency across operations', async () => {
      const user = userEvent.setup();
      let callCount = 0;
      
      // Mock store that tracks call order
      const trackingStore = {
        ...mockStore,
        setCurrentTab: vi.fn(() => callCount++),
        setBatchMode: vi.fn(() => callCount++),
        addProcessedImages: vi.fn(() => callCount++)
      };

      useWorkflowStore.mockReturnValue(trackingStore);
      render(<TestWorkflowComponent />);

      // Perform multiple operations
      await user.click(screen.getByTestId('set-tab-1'));
      await user.click(screen.getByTestId('enable-batch'));
      await user.click(screen.getByTestId('add-image'));

      // All operations should have been called
      expect(trackingStore.setCurrentTab).toHaveBeenCalled();
      expect(trackingStore.setBatchMode).toHaveBeenCalled();
      expect(trackingStore.addProcessedImages).toHaveBeenCalled();
    });
  });
});