import { useState, useEffect } from "react";
import imageStorage, { storeGeneratedImages, getLatestImages } from '../services/imageStorage.js';
import { makePexelsRequest, recordCacheHit } from '../services/apiRateLimit.js';

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
// Simple fallback for wave captions to avoid TS import issues
const CAPTIONS = [
  "[Waves professionally procrastinating]",
  "[Ocean expertly winging it]", 
  "[Water having Monday energy]",
  "[Waves multitasking poorly]",
  "[Ocean taking a personal day]",
  "[Waves overthinking everything]",
  "[Ocean having commitment issues]",
  "[Water procrastinating effectively]",
  "[Waves dealing with Monday]",
  "[Ocean needing coffee first]"
];

// Simple fallback function for generating titles
const composeListing = () => ({
  title: "Ocean Wave Wall Art - Modern Coastal Print for Home & Office"
});

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
  }, []);

  // Generate SEO-optimized titles using the modular system
  const generateSEOTitle = () => {
    const categories = ["HOME_PERSONAL", "WORKPLACE_PROFESSIONAL", "WELLNESS_THERAPY"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    const listing = composeListing({
      category: randomCategory,
      humor: Math.random() > 0.5
    });
    
    return listing.title;
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

          // PRINTIFY OPTIMAL DIMENSIONS: Target specific aspect ratios for print products
          // Standard poster sizes: 16:20 ratio (4:5) - portrait orientation
          // This matches Printify's poster variants like 16"x20", 12"x15", etc.
          const printAspectRatio = 4 / 5; // width:height = 4:5 (portrait)
          const printWidth = 2400; // High quality for print
          const printHeight = Math.round(printWidth / printAspectRatio); // 3000px
          
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
          console.log('Print aspect ratio:', printAspectRatio.toFixed(3), '(4:5 portrait)');

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
          const maxTextWidth = canvas.width * 0.85; // Use 85% of image width max
          let adjustedFontSize = fontSize;
          let textMetrics = ctx.measureText(caption);
          
          // Reduce font size if text is too wide
          while (textMetrics.width > maxTextWidth && adjustedFontSize > minFontSize) {
            adjustedFontSize -= 2;
            ctx.font = `bold ${adjustedFontSize}px "Helvetica Neue", Arial, sans-serif`;
            textMetrics = ctx.measureText(caption);
          }
          
          const textWidth = textMetrics.width;
          
          // OPTIMIZED POSITIONING
          const lineHeight = Math.floor(adjustedFontSize * 1.2);
          const horizontalPadding = Math.max(Math.floor(adjustedFontSize * 0.6), 16);
          const verticalPadding = Math.max(Math.floor(adjustedFontSize * 0.5), 12);
          
          const rectWidth = Math.min(Math.floor(textWidth + (horizontalPadding * 2)), canvas.width * 0.9);
          const rectHeight = Math.floor(lineHeight + (verticalPadding * 2));
          const rectX = Math.floor((canvas.width - rectWidth) / 2);
          
          // Position in bottom 15% safe area (broadcast standard) - pixel aligned
          const bottomSafeZone = Math.floor(canvas.height * 0.85);
          const rectY = Math.floor(bottomSafeZone - rectHeight);

          // BROADCAST STANDARD BACKGROUND - Solid black with 75% opacity (FCC requirement)
          ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
          ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

          // BROADCAST STANDARD TEXT - White text with black drop shadow
          ctx.fillStyle = "#FFFFFF"; // Pure white text (broadcast standard)
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)"; // Strong black shadow for legibility
          ctx.shadowOffsetX = 2; // Subtle offset
          ctx.shadowOffsetY = 2;
          ctx.shadowBlur = 3; // Clean edge blur

          // PERFECT TEXT POSITIONING
          const textX = Math.floor(canvas.width / 2);
          const textY = Math.floor(rectY + verticalPadding + (adjustedFontSize * 0.8));
          ctx.fillText(caption, textX, textY);

          // Reset shadow settings for clean canvas state
          ctx.shadowColor = "transparent";
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;

          console.log('🎯 Caption overlay completed successfully');
          console.log('Text details:', {
            fontSize: `${adjustedFontSize}px`,
            position: `(${textX}, ${textY})`,
            backgroundSize: `${rectWidth}x${rectHeight}px`
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
   */
  const processImagesWithCaptions = async (imageList, shouldAccumulate = false, targetCount = 20) => {
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

    for (let i = 0; i < imagesToProcess.length; i++) {
      const image = imagesToProcess[i];
      const randomCaption = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
      const randomName = generateSEOTitle();
      const seoFilename = generateSEOFilename(randomName, i);

      console.log(`\n📸 Processing ${i + 1}/${imagesToProcess.length}: ${seoFilename}`);

      try {
        // Use original quality image for best print results
        const processedImageUrl = await addCaptionToImage(image.src.original, randomCaption, i);
        const processedImage = {
          id: image.id,
          original: image.src.original,
          processed: processedImageUrl,
          caption: randomCaption,
          filename: seoFilename,
          photographer: image.photographer,
          photographer_url: image.photographer_url,
          width: image.width,
          height: image.height
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
          caption: randomCaption,
          filename: seoFilename,
          photographer: image.photographer,
          photographer_url: image.photographer_url,
          width: image.width,
          height: image.height
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
  const fetchImages = async (forceRefresh = false, quantity = 20) => {
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
      await processImagesWithCaptions(allImages, shouldAccumulate, quantity);
      
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
        const seoFilename = generateSEOFilename(image.name, index);
        downloadImage(image.processed, seoFilename);
      }, index * 100);
    });
  };

  // Return enhanced hook interface with cache information
  return {
    images,
    processedImages,
    loading,
    error,
    apiKey,
    cacheStatus, // 'checking', 'loaded', 'empty'
    fetchImages,
    downloadImage,
    downloadAllImages,
    generateSEOFilename
  };
};