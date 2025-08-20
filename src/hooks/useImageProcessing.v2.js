import { useCallback } from "react";
import { useWorkflowStore } from '../store/index.js';
import { storeGeneratedImages, getLatestImages } from '../services/imageStorage.js';
import { makePexelsRequest, recordCacheHit } from '../services/apiRateLimit.js';
import { generateMassiveVariation, MASSIVE_CUSTOMER_PERSONAS, CONTENT_THEMES } from '../utils/massiveVariationGenerator.js';
import { generateCaptionPhrase } from '../utils/phraseComponents.js';
import { validateCaptionAgainstImage } from '../utils/validation.js';

/**
 * Analyze wave intensity from image properties
 * @param {Object} image - Pexels image object
 * @returns {string} 'big', 'medium', or 'small'
 */
const analyzeWaveIntensity = (image) => {
  const width = image.width || 3000;
  const height = image.height || 2000;
  const aspectRatio = width / height;
  
  const title = (image.alt || '').toLowerCase();
  
  const highIntensityTerms = ['storm', 'crash', 'powerful', 'dramatic', 'splash', 'surf', 'break', 'rough'];
  const lowIntensityTerms = ['calm', 'gentle', 'peaceful', 'serene', 'quiet', 'still', 'smooth', 'soft'];
  
  const hasHighTerms = highIntensityTerms.some(term => title.includes(term));
  const hasLowTerms = lowIntensityTerms.some(term => title.includes(term));
  
  const isDramaticAspect = aspectRatio > 2.5 || aspectRatio < 0.8;
  const isHighResolution = width > 4000 && height > 3000;
  
  if (hasHighTerms || (isDramaticAspect && isHighResolution)) {
    return 'big';
  } else if (hasLowTerms) {
    return 'small';
  } else {
    const random = Math.random();
    if (random > 0.8) return 'big';
    if (random < 0.3) return 'small';
    return 'medium';
  }
};

/**
 * Enhanced Image Processing Hook with Centralized State Management
 * 
 * This hook provides image processing functions while leveraging the centralized
 * workflow store for state management, eliminating local state and prop drilling.
 */
export const useImageProcessing = () => {
  // Get state and actions from the centralized store
  const {
    processedImages,
    setProcessedImages,
    addProcessedImages,
    loading,
    setLoading,
    error,
    setError,
    imageStats,
    qaThreshold,
    addToQAQueue,
    addApprovedImage
  } = useWorkflowStore();

  const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

  // Massive variation system
  const CUSTOMER_PERSONAS = Object.keys(MASSIVE_CUSTOMER_PERSONAS);
  let _globalVariationIndex = 0;

  const generateMassiveContent = useCallback((imageIndex, batchStartIndex = 0, theme = null) => {
    const SEASONS = ['year-round', 'holiday', 'gift', 'summer', 'winter'];
    const uniqueGlobalIndex = batchStartIndex + imageIndex + (Date.now() % 1000);
    let _globalVariationIndex = uniqueGlobalIndex;
    
    const persona = CUSTOMER_PERSONAS[imageIndex % CUSTOMER_PERSONAS.length];
    const season = SEASONS[Math.floor(imageIndex / CUSTOMER_PERSONAS.length) % SEASONS.length];
    const humorLevel = Math.random() > 0.3 ? 'medium' : 'light';
    
    return generateMassiveVariation(uniqueGlobalIndex, {
      persona,
      season,
      humorLevel,
      contentGoal: 'conversion',
      theme
    });
  }, [CUSTOMER_PERSONAS]);

  /**
   * Enhanced Canvas API function for adding captions to images
   */
  const addCaptionToImage = useCallback((imageUrl, caption, imageIndex = 0) => {
    return new Promise((resolve) => {
      console.group(`🎨 Processing Image ${imageIndex + 1}`);
      console.log('Source URL:', imageUrl);
      console.log('Caption:', caption);

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // PRINTIFY EXACT SPECIFICATIONS
          const printAspectRatio = 14 / 11;
          const printWidth = 4200;
          const printHeight = 3300;
          
          // CROP TO FIT PRINT ASPECT RATIO
          let cropX = 0;
          let cropY = 0;
          let cropWidth = img.width;
          let cropHeight = img.height;
          
          const sourceAspectRatio = img.width / img.height;
          
          if (sourceAspectRatio > printAspectRatio) {
            cropWidth = Math.round(img.height * printAspectRatio);
            cropX = Math.round((img.width - cropWidth) / 2);
          } else {
            cropHeight = Math.round(img.width / printAspectRatio);
            cropY = Math.round((img.height - cropHeight) / 2);
          }

          canvas.width = printWidth;
          canvas.height = printHeight;
          
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          
          ctx.drawImage(
            img, 
            cropX, cropY, cropWidth, cropHeight,
            0, 0, canvas.width, canvas.height
          );

          // CAPTION RENDERING
          const minFontSize = 24;
          const maxFontSize = Math.min(canvas.width / 15, canvas.height / 12);
          const baseFontSize = Math.min(canvas.height * 0.04, maxFontSize);
          const fontSize = Math.max(Math.floor(baseFontSize), minFontSize);
          
          ctx.font = `bold ${fontSize}px "Helvetica Neue", Arial, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          
          const maxTextWidth = canvas.width * 0.8;
          let adjustedFontSize = fontSize;
          let textMetrics = ctx.measureText(caption);
          
          while (textMetrics.width > maxTextWidth && adjustedFontSize > minFontSize) {
            adjustedFontSize -= 1;
            ctx.font = `bold ${adjustedFontSize}px "Helvetica Neue", Arial, sans-serif`;
            textMetrics = ctx.measureText(caption);
          }
          
          const textWidth = textMetrics.width;
          const lineHeight = Math.floor(adjustedFontSize * 1.2);
          const horizontalPadding = Math.max(Math.floor(adjustedFontSize * 0.6), 16);
          const verticalPadding = Math.max(Math.floor(adjustedFontSize * 0.5), 12);
          
          const rectWidth = Math.min(Math.floor(textWidth + (horizontalPadding * 2)), canvas.width * 0.85);
          const rectHeight = Math.floor(lineHeight + (verticalPadding * 2));
          const rectX = Math.floor((canvas.width - rectWidth) / 2);
          
          const safeRectX = Math.max(10, Math.min(rectX, canvas.width - rectWidth - 10));
          const safeRectWidth = Math.min(rectWidth, canvas.width - (safeRectX * 2));
          
          const bottomMargin = Math.max(20, Math.floor(canvas.height * 0.03));
          const rectY = Math.max(
            Math.floor(canvas.height * 0.7),
            Math.floor(canvas.height - rectHeight - bottomMargin)
          );

          // BACKGROUND AND TEXT
          ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
          ctx.fillRect(safeRectX, rectY, safeRectWidth, rectHeight);

          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.shadowBlur = 3;

          const textX = Math.floor(safeRectX + (safeRectWidth / 2));
          const textY = Math.floor(rectY + verticalPadding + (adjustedFontSize * 0.8));
          const safeTextY = Math.max(adjustedFontSize, Math.min(textY, canvas.height - 10));
          
          ctx.fillText(caption, textX, safeTextY);

          // Reset shadow
          ctx.shadowColor = "transparent";
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;

          const dataURL = canvas.toDataURL("image/jpeg", 0.95);
          console.log('✅ Image processing completed');
          console.groupEnd();
          resolve(dataURL);
        } catch (error) {
          console.error("Canvas processing error:", error);
          console.groupEnd();
          resolve(imageUrl);
        }
      };

      img.onerror = (error) => {
        console.error("Image load error:", error);
        console.groupEnd();
        resolve(imageUrl);
      };

      setTimeout(() => {
        if (!img.complete) {
          console.warn("Image load timeout");
          console.groupEnd();
          resolve(imageUrl);
        }
      }, 10000);

      img.src = imageUrl;
    });
  }, []);

  /**
   * Process images with captions and store them
   */
  const processImagesWithCaptions = useCallback(async (imageList, shouldAccumulate = false, targetCount = 20, theme = null) => {
    console.group("🎨 Image Processing with Captions");
    console.log(`Processing ${imageList.length} source images, target: ${targetCount}`);
    
    if (!shouldAccumulate) {
      setProcessedImages([]);
    }

    const imagesToProcess = imageList.slice(0, targetCount);
    const processedResults = [];
    const batchStartIndex = Date.now() % 10000;

    for (let i = 0; i < imagesToProcess.length; i++) {
      const image = imagesToProcess[i];
      
      const generatedContent = generateMassiveContent(i, batchStartIndex, theme);
      const { title, filename, metadata } = generatedContent;
      
      const waveSize = analyzeWaveIntensity(image);
      const caption = generateCaptionPhrase(waveSize, metadata.persona, theme);

      try {
        const processedImageUrl = await addCaptionToImage(image.src.original, caption, i);
        const validation = validateCaptionAgainstImage({ ...image, metadata: { ...metadata, waveSize } }, caption);

        const processedImage = {
          id: image.id,
          original: image.src.original,
          processed: processedImageUrl,
          caption: caption,
          title: title,
          filename: filename,
          photographer: image.photographer,
          photographer_url: image.photographer_url,
          width: image.width,
          height: image.height,
          metadata: metadata,
          validation,
          readyForPublish: validation.score >= (qaThreshold || 0.85)
        };
        
        processedResults.push(processedImage);
        
        // Add to store immediately for real-time updates
        addProcessedImages([processedImage]);

        // If below threshold, add to QA queue for manual review
        if (!processedImage.readyForPublish) {
          addToQAQueue({ imageId: processedImage.id, reason: 'validation_score', score: validation.score, issues: validation.issues, processedImage });
        } else {
          // Optionally mark approvedImages for quick listing flow
          if (typeof addApprovedImage === 'function') addApprovedImage(processedImage);
        }

        console.log(`✅ Image ${i + 1} processed successfully`);

      } catch (error) {
        console.error(`❌ Error processing image ${i + 1}:`, error);
        
        const fallbackImage = {
          id: image.id,
          original: image.src.original,
          processed: image.src.original,
          caption: caption,
          title: title,
          filename: filename,
          photographer: image.photographer,
          photographer_url: image.photographer_url,
          width: image.width,
          height: image.height,
          metadata: metadata
          // No validation available in fallback
        };
        
        processedResults.push(fallbackImage);
        addProcessedImages([fallbackImage]);
      }
    }

    // Store processed images for caching
    try {
      const allProcessedImages = shouldAccumulate ? 
        [...processedImages, ...processedResults] : 
        processedResults;
      
      await storeGeneratedImages(allProcessedImages, {
        totalImages: allProcessedImages.length,
        processingDate: new Date().toISOString(),
        pexelsQuery: 'ocean waves crashing',
        apiVersion: 'v1',
        accumulated: shouldAccumulate
      });
      
      console.log('✅ Images stored to cache');
    } catch (storageError) {
      console.error('💥 Failed to store images:', storageError);
    }

    console.log('🎉 Image processing completed!');
    console.groupEnd();
  }, [processedImages, setProcessedImages, addProcessedImages, generateMassiveContent, addCaptionToImage, qaThreshold, addToQAQueue, addApprovedImage]);

  /**
   * Fetch images from Pexels API with smart caching
   */
  const fetchImages = useCallback(async (forceRefresh = false, quantity = 20, theme = null) => {
    console.group('🌊 Wave Image Fetch Process');
    
    if (!apiKey) {
      const errorMsg = "Please add your Pexels API key to the .env file";
      console.error('❌ API Key missing');
      setError(errorMsg);
      console.groupEnd();
      return;
    }

    // Check cache first
    if (!forceRefresh && processedImages.length > 0) {
      console.log('✅ Using existing cached images');
      console.groupEnd();
      return;
    }

    setLoading(true);
    setError("");
    
    const imagesPerPage = 15;
    const pagesNeeded = Math.ceil(quantity / imagesPerPage);

    try {
      const fetchPexelsPage = async (page) => {
        return makePexelsRequest(async () => {
          const response = await fetch(
            `https://api.pexels.com/v1/search?query=ocean waves crashing&per_page=${imagesPerPage}&page=${page}`,
            {
              method: "GET",
              headers: {
                Authorization: apiKey,
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          console.log(`✅ Page ${page} fetched: ${data.photos?.length || 0} images`);
          return data;
        });
      };

      const promises = [];
      for (let page = 1; page <= pagesNeeded; page++) {
        promises.push(fetchPexelsPage(page));
      }

      const data = await Promise.all(promises);
      const allImages = data.flatMap((d) => d.photos || []).slice(0, quantity);

      console.log(`🎯 Total images fetched: ${allImages.length}`);
      
      const shouldAccumulate = forceRefresh && processedImages.length > 0;
      await processImagesWithCaptions(allImages, shouldAccumulate, quantity, theme);
      
    } catch (error) {
      console.error('💥 Fetch process failed:', error);

      if (error.message.includes("401")) {
        setError("Authentication Error: Please check your Pexels API key");
      } else if (error.message.includes("429")) {
        setError("Rate limit exceeded. Please wait and try again.");
      } else if (error.message.includes("Failed to fetch")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(`Error fetching images: ${error.message}`);
      }
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, [apiKey, processedImages.length, setLoading, setError, processImagesWithCaptions]);

  /**
   * Download utilities
   */
  const downloadImage = useCallback((imageData, fileName) => {
    const link = document.createElement("a");
    link.download = `${fileName}.jpg`;
    link.href = imageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const downloadAllImages = useCallback(() => {
    processedImages.forEach((image, index) => {
      setTimeout(() => {
        const filename = image.filename || `wave-art-${image.id}`;
        downloadImage(image.processed, filename);
      }, index * 100);
    });
  }, [processedImages, downloadImage]);

  /**
   * Initialize hook by loading cached images
   */
  const initializeCache = useCallback(async () => {
    try {
      const cachedImages = await getLatestImages();
      if (cachedImages.length > 0) {
        console.log(`✅ Found ${cachedImages.length} cached images`);
        setProcessedImages(cachedImages);
        recordCacheHit('pexels');
      }
    } catch (error) {
      console.error('❌ Error loading cached images:', error);
    }
  }, [setProcessedImages]);

  return {
    // State (from store)
    processedImages,
    loading,
    error,
    imageStats,
    
    // Core functions
    fetchImages,
    downloadImage,
    downloadAllImages,
    
    // Store actions
    setProcessedImages,
    setLoading,
    setError,
    
    // Utilities
    initializeCache,
    CONTENT_THEMES,
    
    // Legacy compatibility
    handleImageDownload: downloadImage,
    generateVariationsForApproved: () => {}, // Placeholder
    images: [], // For backward compatibility
    cacheStatus: processedImages.length > 0 ? 'loaded' : 'empty',
    deleteImages: () => {}, // To be implemented
    deleteDuplicates: () => {}, // To be implemented
    generateSEOFilename: (title, index) => title?.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-") + `_${index + 1}`,
    apiKey
  };
};

export default useImageProcessing;