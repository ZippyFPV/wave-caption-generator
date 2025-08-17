import { useState, useEffect } from "react";
import { storeGeneratedImages, getLatestImages } from '../services/imageStorage.js';
import { makePexelsRequest, recordCacheHit } from '../services/apiRateLimit.js';
import { generateMassiveVariation, MASSIVE_CUSTOMER_PERSONAS, CONTENT_THEMES } from '../utils/massiveVariationGenerator.js';
import { generateCaptionPhrase } from '../utils/phraseComponents.js';

/**
 * Analyze wave intensity from image properties
 * @param {Object} image - Pexels image object
 * @returns {string} 'big', 'medium', or 'small'
 */
const analyzeWaveIntensity = (image) => {
  // Use image dimensions and title/tags as proxies for wave intensity
  const width = image.width || 3000;
  const height = image.height || 2000;
  const aspectRatio = width / height;
  
  // Analyze image metadata for intensity clues
  const title = (image.alt || '').toLowerCase();
  const _photographer = (image.photographer || '').toLowerCase();  // TODO: use for intensity analysis
  
  // High intensity indicators
  const highIntensityTerms = ['storm', 'crash', 'powerful', 'dramatic', 'splash', 'surf', 'break', 'rough'];
  const lowIntensityTerms = ['calm', 'gentle', 'peaceful', 'serene', 'quiet', 'still', 'smooth', 'soft'];
  
  const hasHighTerms = highIntensityTerms.some(term => title.includes(term));
  const hasLowTerms = lowIntensityTerms.some(term => title.includes(term));
  
  // Image with extreme landscape aspect ratios tend to be dramatic seascapes
  const isDramaticAspect = aspectRatio > 2.5 || aspectRatio < 0.8;
  
  // Very large images often capture more dramatic scenes
  const isHighResolution = width > 4000 && height > 3000;
  
  // Decision logic prioritizing metadata over randomness
  if (hasHighTerms || (isDramaticAspect && isHighResolution)) {
    return 'big';
  } else if (hasLowTerms) {
    return 'small';
  } else {
    // For neutral cases, use weighted randomness favoring medium waves
    const random = Math.random();
    if (random > 0.8) return 'big';      // 20% big waves
    if (random < 0.3) return 'small';    // 30% small waves  
    return 'medium';                      // 50% medium waves
  }
};

/**
 * Image Processing Hook - Enhanced with Persistence and Rate Limiting
 * 
 * This hook manages the complete image workflow with smart caching and API optimization
 * to minimize unnecessary API calls while providing excellent user experience.
 * 
 * Key Features:
 * - Automatic image persistence using IndexedDB
 * - Smart cache checking to avoid redundant API calls  
 * - Rate limiting integration for Pexels API
 * - Comprehensive logging for debugging
 * - Fallback mechanisms for browser compatibility
 * 
 * API References:
 * - Pexels API: https://www.pexels.com/api/documentation/
 * - Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
 * - IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */
// Massive variation system with 15 customer personas
const CUSTOMER_PERSONAS = Object.keys(MASSIVE_CUSTOMER_PERSONAS);
const SEASONS = ['year-round', 'holiday', 'gift', 'summer', 'winter'];

// State for tracking global variation index to ensure uniqueness
let _globalVariationIndex = 0;  // TODO: convert to useRef if needed in component

// Massive variation content generation - guarantees 100% unique combinations
const generateMassiveContent = (imageIndex, batchStartIndex = 0, theme = null) => {
  // Use global index to ensure every generation is completely unique
  const uniqueGlobalIndex = batchStartIndex + imageIndex + (Date.now() % 1000);
  _globalVariationIndex = uniqueGlobalIndex;
  
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
};

/**
 * Enhanced Image Processing Hook with Persistence and Rate Limiting
 * 
 * Automatically loads cached images on initialization to avoid unnecessary API calls
 * and provides intelligent caching for optimal performance.
 */
export const useImageProcessing = () => {
  const [images, setImages] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cacheStatus, setCacheStatus] = useState('checking'); // 'checking', 'loaded', 'empty'

  const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

  /**
   * Initialize hook by checking for cached images
   * This runs once on component mount to load any existing images
   */
  useEffect(() => {
    console.group('🚀 useImageProcessing Hook Initialization');
    console.log('Checking for cached images...');
    console.log('Pexels API Key available:', !!apiKey);
    
    const loadCachedImages = async () => {
      try {
        const cachedImages = await getLatestImages();
        
        if (cachedImages.length > 0) {
          console.log(`✅ Found ${cachedImages.length} cached images - no API call needed!`);
          setProcessedImages(cachedImages);
          setCacheStatus('loaded');
          recordCacheHit('pexels'); // Track cache efficiency
        } else {
          console.log('📭 No cached images found - will fetch from API when requested');
          setCacheStatus('empty');
        }
      } catch (error) {
        console.error('❌ Error loading cached images:', error);
        setCacheStatus('empty');
      }
    };
    
    loadCachedImages();
    console.groupEnd();
  }, [apiKey]);

  // Enhanced SEO title generation with persona targeting
  const _generateSEOTitle = (_persona, _season) => {
    const content = generateMassiveContent(0, 0);
    return content.title;
  };

  // File-safe versions for downloads (SEO + URL friendly)
  const generateSEOFilename = (title, index) => {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim() + `_${index + 1}`
    );
  };

  /**
   * Enhanced Canvas API function for adding captions to images
   * 
   * Optimized for print quality with comprehensive logging for debugging
   * 
   * @param {string} imageUrl - URL of the source image
   * @param {string} caption - Text caption to overlay
   * @param {number} imageIndex - Index for logging purposes
   * @returns {Promise<string>} Data URL of processed image
   */
  const addCaptionToImage = (imageUrl, caption, imageIndex = 0) => {
    return new Promise((resolve) => {
      console.group(`🎨 Processing Image ${imageIndex + 1}`);
      console.log('Source URL:', imageUrl);
      console.log('Caption:', caption);
      console.log('Processing start time:', new Date().toISOString());

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          console.log('✅ Image loaded successfully');
          console.log('Original dimensions:', `${img.width}x${img.height}px`);
          console.log('File size estimate:', `~${Math.round((img.width * img.height * 3) / 1024)}KB`);

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // PRINTIFY EXACT SPECIFICATIONS: Match Printify's design requirements
          // 14″ x 11″ Satin Poster variant (ID: 33742) requires exactly 4200x3300 pixels
          // Aspect ratio: 14:11 = 1.273 (landscape orientation)
          const printAspectRatio = 14 / 11; // width:height = 14:11 (landscape)
          const printWidth = 4200; // Printify's exact requirement
          const printHeight = 3300; // Printify's exact requirement
          
          // CROP TO FIT PRINT ASPECT RATIO: Ensure no white space
          let cropX = 0;
          let cropY = 0;
          let cropWidth = img.width;
          let cropHeight = img.height;
          
          const sourceAspectRatio = img.width / img.height;
          
          if (sourceAspectRatio > printAspectRatio) {
            // Source is wider - crop sides
            cropWidth = Math.round(img.height * printAspectRatio);
            cropX = Math.round((img.width - cropWidth) / 2);
          } else {
            // Source is taller - crop top/bottom
            cropHeight = Math.round(img.width / printAspectRatio);
            cropY = Math.round((img.height - cropHeight) / 2);
          }

          // Set canvas to optimal print dimensions
          canvas.width = printWidth;
          canvas.height = printHeight;
          
          console.log('Canvas dimensions:', `${canvas.width}x${canvas.height}px`);
          console.log('Crop area:', `${cropWidth}x${cropHeight}px at (${cropX}, ${cropY})`);
          console.log('Print aspect ratio:', printAspectRatio.toFixed(3), '(14:11 landscape for Printify)');

          // HIGH-QUALITY RENDERING SETTINGS
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          
          // Draw cropped image to fill entire canvas (no white space)
          // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
          ctx.drawImage(
            img, 
            cropX, cropY, cropWidth, cropHeight, // Source crop area
            0, 0, canvas.width, canvas.height     // Destination (fill entire canvas)
          );

          // PIXEL PERFECT TEXT RENDERING OPTIMIZATION
          // Force 1:1 pixel ratio for consistent output across devices
          
          // SMART CAPTION SIZING - Prevents text stretching
          // Dynamic sizing based on both image dimensions and text length
          const minFontSize = 24;
          const maxFontSize = Math.min(canvas.width / 15, canvas.height / 12); // Cap based on image size
          const baseFontSize = Math.min(canvas.height * 0.04, maxFontSize); // Smaller base percentage
          const fontSize = Math.max(Math.floor(baseFontSize), minFontSize);
          
          // PIXEL PERFECT FONT RENDERING
          ctx.font = `bold ${fontSize}px "Helvetica Neue", Arial, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          
          // OPTIMIZE TEXT RENDERING FOR CRISP EDGES
          ctx.textRenderingOptimization = "optimizeSpeed";
          
          // SMART TEXT WRAPPING - Prevent overflow
          const maxTextWidth = canvas.width * 0.8; // Use 80% of image width max (more conservative)
          let adjustedFontSize = fontSize;
          let textMetrics = ctx.measureText(caption);
          
          // Reduce font size if text is too wide - more aggressive reduction
          while (textMetrics.width > maxTextWidth && adjustedFontSize > minFontSize) {
            adjustedFontSize -= 1; // Smaller increments for better fit
            ctx.font = `bold ${adjustedFontSize}px "Helvetica Neue", Arial, sans-serif`;
            textMetrics = ctx.measureText(caption);
          }
          
          // Additional safety check - ensure minimum readable size
          if (adjustedFontSize < minFontSize) {
            adjustedFontSize = minFontSize;
            ctx.font = `bold ${adjustedFontSize}px "Helvetica Neue", Arial, sans-serif`;
            textMetrics = ctx.measureText(caption);
          }
          
          const textWidth = textMetrics.width;
          
          // OPTIMIZED POSITIONING
          const lineHeight = Math.floor(adjustedFontSize * 1.2);
          const horizontalPadding = Math.max(Math.floor(adjustedFontSize * 0.6), 16);
          const verticalPadding = Math.max(Math.floor(adjustedFontSize * 0.5), 12);
          
          const rectWidth = Math.min(Math.floor(textWidth + (horizontalPadding * 2)), canvas.width * 0.85);
          const rectHeight = Math.floor(lineHeight + (verticalPadding * 2));
          const rectX = Math.floor((canvas.width - rectWidth) / 2);
          
          // Safety check: ensure rectangle fits within canvas bounds
          const safeRectX = Math.max(10, Math.min(rectX, canvas.width - rectWidth - 10));
          const safeRectWidth = Math.min(rectWidth, canvas.width - (safeRectX * 2));
          
          // Position in bottom 20% safe area to prevent cutoff - pixel aligned
          // Ensure there's always margin from the bottom edge
          const bottomMargin = Math.max(20, Math.floor(canvas.height * 0.03)); // At least 20px or 3% margin
          const rectY = Math.max(
            Math.floor(canvas.height * 0.7), // Never go below 30% from top
            Math.floor(canvas.height - rectHeight - bottomMargin) // Proper bottom positioning
          );

          // BROADCAST STANDARD BACKGROUND - Solid black with 75% opacity (FCC requirement)
          ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
          ctx.fillRect(safeRectX, rectY, safeRectWidth, rectHeight);

          // BROADCAST STANDARD TEXT - White text with black drop shadow
          ctx.fillStyle = "#FFFFFF"; // Pure white text (broadcast standard)
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)"; // Strong black shadow for legibility
          ctx.shadowOffsetX = 2; // Subtle offset
          ctx.shadowOffsetY = 2;
          ctx.shadowBlur = 3; // Clean edge blur

          // PERFECT TEXT POSITIONING - Centered within safe rectangle
          const textX = Math.floor(safeRectX + (safeRectWidth / 2));
          const textY = Math.floor(rectY + verticalPadding + (adjustedFontSize * 0.8));
          
          // Final validation: ensure text position is within canvas bounds
          const safeTextY = Math.max(adjustedFontSize, Math.min(textY, canvas.height - 10));
          
          ctx.fillText(caption, textX, safeTextY);

          // Reset shadow settings for clean canvas state
          ctx.shadowColor = "transparent";
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;

          console.log('🎯 Caption overlay completed successfully');
          console.log('Text details:', {
            fontSize: `${adjustedFontSize}px`,
            position: `(${textX}, ${safeTextY})`,
            backgroundSize: `${safeRectWidth}x${rectHeight}px`,
            backgroundPosition: `(${safeRectX}, ${rectY})`,
            bottomMargin: `${canvas.height - rectY - rectHeight}px`
          });
          
          // OPTIMIZED EXPORT QUALITY - Balance file size vs quality for performance
          // 95% quality provides excellent results with reasonable file sizes (3-8MB typical)
          const dataURL = canvas.toDataURL("image/jpeg", 0.95);
          
          console.log('📤 Image export completed');
          console.log('Final data URL length:', `${Math.round(dataURL.length / 1024)}KB`);
          console.log('Processing completed at:', new Date().toISOString());
          console.groupEnd();
          
          resolve(dataURL);
        } catch (error) {
          console.error("Canvas processing error:", error);
          resolve(imageUrl);
        }
      };

      img.onerror = (error) => {
        console.error("Image load error for URL:", imageUrl, error);
        resolve(imageUrl);
      };

      setTimeout(() => {
        if (!img.complete) {
          console.warn("Image load timeout for:", imageUrl);
          resolve(imageUrl);
        }
      }, 10000);

      img.src = imageUrl;
    });
  };

  /**
   * Enhanced image processing with caption overlay and automatic storage
   * 
   * Processes images with captions and automatically stores them for future use
   * to avoid unnecessary reprocessing and API calls.
   * 
   * @param {Array} imageList - Array of Pexels image objects
   * @param {boolean} shouldAccumulate - Whether to add to existing images
   * @param {number} targetCount - Number of images to process
   * @param {string} theme - Content theme for generation
   */
  const processImagesWithCaptions = async (imageList, shouldAccumulate = false, targetCount = 20, theme = null) => {
    console.group("🎨 Image Processing with Captions");
    console.log(`Starting processing: ${imageList.length} source images`);
    console.log(`Target count: ${targetCount} processed images`);
    console.log('Processing start time:', new Date().toISOString());
    console.log('Accumulate mode:', shouldAccumulate ? 'Adding to existing images' : 'Starting fresh');
    
    // Clear existing images unless we're accumulating
    if (!shouldAccumulate) {
      setProcessedImages([]);
    }

    const imagesToProcess = imageList.slice(0, targetCount);
    const processedResults = [];

    // Generate batch start index for complete uniqueness across all images
    const batchStartIndex = Date.now() % 10000;
    console.log(`🚀 Batch Start Index: ${batchStartIndex} - Ensuring 100% unique variations`);

    for (let i = 0; i < imagesToProcess.length; i++) {
      const image = imagesToProcess[i];
      
      // Generate massive variation content - guaranteed unique
      const generatedContent = generateMassiveContent(i, batchStartIndex, theme);
      const { title, filename, metadata } = generatedContent;
      
      // Generate wave-describing closed caption phrase based on image analysis
      const waveSize = analyzeWaveIntensity(image);
      const caption = generateCaptionPhrase(waveSize, metadata.persona, theme);

      console.log(`\n📸 Processing ${i + 1}/${imagesToProcess.length}: ${filename}`);
      console.log(`🎯 Persona: ${metadata.persona} | Season: ${metadata.season} | Global Index: ${metadata.globalIndex}`);
      console.log(`💹 Conversion: ${metadata.estimatedConversion}% | Uniqueness: ${metadata.uniquenessScore}%`);

      try {
        // Use original quality image for best print results
        const processedImageUrl = await addCaptionToImage(image.src.original, caption, i);
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
          metadata: metadata // Include complete targeting metadata
        };
        
        processedResults.push(processedImage);
        
        // Add each completed image immediately to state for real-time UI updates
        setProcessedImages(prev => [...prev, processedImage]);
        console.log(`✅ Image ${i + 1} processed successfully`);
        
      } catch (error) {
        console.error(`❌ Error processing image ${i + 1}:`, error);
        
        // Still add the image even if caption processing failed, use original image
        const fallbackImage = {
          id: image.id,
          original: image.src.original,
          processed: image.src.original, // Fallback to original if processing fails
          caption: caption,
          title: title,
          filename: filename,
          photographer: image.photographer,
          photographer_url: image.photographer_url,
          width: image.width,
          height: image.height,
          metadata: metadata
        };
        
        processedResults.push(fallbackImage);
        setProcessedImages(prev => [...prev, fallbackImage]);
        console.warn(`⚠️ Added fallback for image ${i + 1} (processing failed)`);
      }
    }

    // Store all processed images for future use
    try {
      console.log('\n💾 Storing processed images to cache...');
      
      // If accumulating, combine with existing images
      const allProcessedImages = shouldAccumulate ? 
        [...processedImages, ...processedResults] : 
        processedResults;
      
      // Track image generation for analytics
      analytics.event('images_generated', {
        count: allProcessedImages.length,
        theme: selectedTheme || 'default',
        batch_mode: batchMode,
        source: 'manual'
      });
      
      const sessionId = await storeGeneratedImages(allProcessedImages, {
        totalImages: allProcessedImages.length,
        processingDate: new Date().toISOString(),
        pexelsQuery: 'ocean waves crashing',
        apiVersion: 'v1',
        accumulated: shouldAccumulate
      });
      
      console.log(`✅ Images stored with session ID: ${sessionId}`);
      setCacheStatus('loaded');
      
    } catch (storageError) {
      console.error('💥 Failed to store images:', storageError);
      console.warn('⚠️ Images will not be cached - will need to regenerate on reload');
    }

    console.log('\n🎉 Image processing completed!');
    const currentTotal = shouldAccumulate ? processedImages.length + processedResults.length : processedResults.length;
    console.log('Final stats:', {
      newlyProcessed: processedResults.length,
      totalImages: currentTotal,
      successful: processedResults.filter(img => img.processed !== img.original).length,
      fallbacks: processedResults.filter(img => img.processed === img.original).length,
      mode: shouldAccumulate ? 'accumulated' : 'fresh'
    });
    console.groupEnd();
  };

  /**
   * Enhanced fetchImages function with smart caching and rate limiting
   * 
   * Checks cache first to avoid unnecessary API calls, implements proper rate limiting,
   * and provides comprehensive error handling with detailed logging.
   * 
   * Rate Limiting Strategy:
   * - Pexels API allows 200 requests/hour (free tier)
   * - This function uses 3 requests (3 pages), so can be called ~66 times/hour
   * - With caching, typically only called once per 24 hours
   */
  const fetchImages = async (forceRefresh = false, quantity = 20, theme = null) => {
    console.group('🌊 Wave Image Fetch Process');
    console.log(`Requested quantity: ${quantity} images`);
    
    // Validation checks
    if (!apiKey) {
      const errorMsg = "Please add your Pexels API key to the .env file and restart the server";
      console.error('❌ API Key missing:', errorMsg);
      setError(errorMsg);
      console.groupEnd();
      return;
    }

    // Check if we already have fresh cached images (unless forcing refresh)
    if (!forceRefresh && processedImages.length > 0 && cacheStatus === 'loaded') {
      console.log('✅ Using existing cached images - no API call needed');
      console.log('Cache contains:', processedImages.length, 'images');
      console.groupEnd();
      return;
    }

    if (forceRefresh) {
      console.log(`🔄 Force refresh requested - bypassing cache and generating ${quantity} new images`);
    }

    setLoading(true);
    setError("");
    console.log('🚀 Starting Pexels API fetch...');
    
    // Calculate how many images we need to fetch from API to get the requested quantity
    const imagesPerPage = 15;
    const pagesNeeded = Math.ceil(quantity / imagesPerPage);
    console.log(`Target: ${quantity} images (${pagesNeeded} pages × ${imagesPerPage} per page)`);
    console.log('API Key present:', !!apiKey);

    try {
      // Create rate-limited fetch function for Pexels API
      const fetchPexelsPage = async (page) => {
        console.log(`📡 Fetching page ${page} from Pexels API...`);
        
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

      // Fetch required pages with rate limiting
      console.log(`📊 Starting rate-limited API requests for ${pagesNeeded} pages...`);
      const promises = [];
      for (let page = 1; page <= pagesNeeded; page++) {
        promises.push(fetchPexelsPage(page));
      }

      const data = await Promise.all(promises);
      const allImages = data.flatMap((d) => d.photos || []).slice(0, quantity);

      console.log(`🎯 Total images fetched: ${allImages.length}`);
      console.log('Image sizes available:', allImages[0]?.src ? Object.keys(allImages[0].src) : 'unknown');
      
      setImages(allImages);
      
      // Process images with captions and store in cache
      // Use accumulate mode if force refresh and we already have images
      const shouldAccumulate = forceRefresh && processedImages.length > 0;
      await processImagesWithCaptions(allImages, shouldAccumulate, quantity, theme);
      
    } catch (error) {
      console.error('💥 Fetch process failed:', error);
      console.log('Error details:', {
        message: error.message,
        status: error.status,
        stack: error.stack?.split('\n')[0]
      });

      // Enhanced error handling with specific guidance
      if (error.message.includes("401")) {
        const errorMsg = "Authentication Error: Please check your Pexels API key is correct in the .env file";
        setError(errorMsg);
        console.error('🔑 Auth Error - check API key');
      } else if (error.message.includes("429")) {
        const errorMsg = "Rate limit exceeded. The app will retry automatically. You can use cached images in the meantime.";
        setError(errorMsg);
        console.error('⏰ Rate limit hit - will retry with backoff');
      } else if (error.message.includes("Failed to fetch")) {
        const errorMsg = "Network error. Please check your internet connection and try again.";
        setError(errorMsg);
        console.error('🌐 Network error - check connection');
      } else {
        const errorMsg = `Error fetching images: ${error.message}`;
        setError(errorMsg);
        console.error('🚨 Unknown error:', error);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Fetch process completed');
      console.groupEnd();
    }
  };

  const downloadImage = (imageData, fileName) => {
    const link = document.createElement("a");
    link.download = `${fileName}.jpg`;
    link.href = imageData;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = () => {
    processedImages.forEach((image, index) => {
      setTimeout(() => {
        // Use the pre-generated filename from the comprehensive system
        const filename = image.filename || generateSEOFilename(image.title, index);
        downloadImage(image.processed, filename);
      }, index * 100);
    });
  };

  // Delete specific images by IDs
  const deleteImages = (imageIds) => {
    setProcessedImages(prev => prev.filter(img => !imageIds.includes(img.id)));
    // Also update cache
    const remaining = processedImages.filter(img => !imageIds.includes(img.id));
    storeGeneratedImages(remaining);
  };

  // Delete duplicate images based on caption similarity
  const deleteDuplicates = () => {
    const uniqueImages = [];
    const seenCaptions = new Set();
    
    processedImages.forEach(image => {
      const normalizedCaption = image.caption.toLowerCase().trim();
      if (!seenCaptions.has(normalizedCaption)) {
        seenCaptions.add(normalizedCaption);
        uniqueImages.push(image);
      }
    });
    
    setProcessedImages(uniqueImages);
    storeGeneratedImages(uniqueImages);
    
    return processedImages.length - uniqueImages.length; // Return number of duplicates removed
  };

  // Calculate statistics for the dashboard
  const imageStats = {
    totalGenerated: processedImages.length,
    currentActive: processedImages.length,
    approved: processedImages.filter(img => img.approved).length,
    deleted: 0, // This hook doesn't track deleted images
    created: 0  // This hook doesn't track created products
  };

  // Return enhanced hook interface with cache information
  return {
    images,
    processedImages,
    setProcessedImages,
    imageStats,
    setImageStats: () => {}, // Placeholder - stats are calculated automatically
    loading,
    setLoading,
    error,
    setError,
    apiKey,
    cacheStatus, // 'checking', 'loaded', 'empty'
    fetchImages,
    handleImageDownload: downloadImage,
    downloadImage,
    downloadAllImages,
    deleteImages,
    deleteDuplicates,
    generateSEOFilename,
    generateVariationsForApproved: () => {}, // Placeholder for future implementation
    CONTENT_THEMES
  };
};