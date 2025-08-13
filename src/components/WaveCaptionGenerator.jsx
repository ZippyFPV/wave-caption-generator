import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Loader2, Image as ImageIcon, Zap, Grid3X3, Settings2, Plus, Sparkles, TrendingUp, Eye, MoreHorizontal, Check } from 'lucide-react';

const WaveCaptionGenerator = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');

  const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

  // Wave captions
  const CAPTIONS = [
    "Find your flow",
    "Ocean vibes only", 
    "Waves of possibility",
    "Deep blue dreams",
    "Ride the wave",
    "Ocean therapy",
    "Coastal calm",
    "Blue horizon",
    "Wave energy",
    "Sea the beauty",
    "Tidal mindfulness",
    "Ocean escape"
  ];

  // SEO-optimized titles
  const SEO_TITLES = [
    "Ocean Wave Wall Art - Modern Coastal Print",
    "Blue Wave Photography - Beach House Decor", 
    "Minimalist Ocean Print - Scandinavian Style",
    "Coastal Wave Art - Relaxing Beach Vibes",
    "Ocean Therapy Print - Calming Wall Art",
    "Modern Wave Photography - Clean Aesthetic",
    "Beach House Wall Art - Ocean Waves Print",
    "Zen Ocean Art - Peaceful Water Photography",
    "Abstract Wave Print - Contemporary Art",
    "Ocean Mindfulness Art - Meditation Decor"
  ];

  const addCaptionToImage = (imageUrl, caption) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const fontSize = Math.max(img.width / 25, 28);
        ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textMetrics = ctx.measureText(caption);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        
        const padding = fontSize * 0.7;
        const rectWidth = textWidth + (padding * 2);
        const rectHeight = textHeight + (padding * 1.6);
        const x = canvas.width / 2;
        const y = canvas.height - (rectHeight * 1.5);
        
        // Modern rounded background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        const radius = fontSize * 0.3;
        const rectX = x - rectWidth/2;
        const rectY = y - rectHeight/2;
        
        ctx.beginPath();
        ctx.moveTo(rectX + radius, rectY);
        ctx.lineTo(rectX + rectWidth - radius, rectY);
        ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + radius);
        ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
        ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - radius, rectY + rectHeight);
        ctx.lineTo(rectX + radius, rectY + rectHeight);
        ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - radius);
        ctx.lineTo(rectX, rectY + radius);
        ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
        ctx.closePath();
        ctx.fill();
        
        // High-contrast white text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(caption, x, y + fontSize * 0.1);
        
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      
      img.onerror = () => resolve(imageUrl);
      img.src = imageUrl;
    });
  };

  const fetchImages = async () => {
    if (!apiKey) {
      setError('Please add your Pexels API key to .env file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=ocean waves&per_page=20&page=${currentPage}`,
        {
          headers: {
            Authorization: apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const newImages = [];

      for (let i = 0; i < data.photos.length; i++) {
        const photo = data.photos[i];
        const randomCaption = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
        const randomTitle = SEO_TITLES[Math.floor(Math.random() * SEO_TITLES.length)];
        
        const processedImageUrl = await addCaptionToImage(photo.src.large, randomCaption);
        
        const newImage = {
          id: photo.id,
          original: photo.src.large,
          processed: processedImageUrl,
          caption: randomCaption,
          title: randomTitle,
          photographer: photo.photographer,
          width: photo.width,
          height: photo.height
        };

        newImages.push(newImage);
        setImages(prev => [...prev, newImage]);
      }

      setCurrentPage(prev => prev + 1);
    } catch (err) {
      setError(err.message.includes('401') 
        ? 'Invalid API key. Please check your Pexels API key.'
        : err.message.includes('429')
        ? 'Rate limit exceeded. Please wait a moment and try again.'
        : `Error: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (image) => {
    const link = document.createElement('a');
    const filename = image.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    link.download = `${filename}.jpg`;
    link.href = image.processed;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSelected = () => {
    const selected = images.filter(img => selectedImages.has(img.id));
    selected.forEach((image, index) => {
      setTimeout(() => downloadImage(image), index * 200);
    });
  };

  const downloadAll = () => {
    images.forEach((image, index) => {
      setTimeout(() => downloadImage(image), index * 200);
    });
  };

  const toggleImageSelection = (imageId) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const clearAll = () => {
    setImages([]);
    setSelectedImages(new Set());
    setCurrentPage(1);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shopify-style Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Wave Caption Generator</h1>
                  <p className="text-sm text-gray-500">Create stunning ocean art with captions</p>
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-3">
              {selectedImages.size > 0 && (
                <button
                  onClick={downloadSelected}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {selectedImages.size}
                </button>
              )}
              
              {images.length > 0 && (
                <button
                  onClick={downloadAll}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  All ({images.length})
                </button>
              )}

              <button
                onClick={fetchImages}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats bar */}
          {images.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span className="flex items-center">
                    <ImageIcon className="w-4 h-4 mr-1" />
                    {images.length} images
                  </span>
                  {selectedImages.size > 0 && (
                    <span className="flex items-center text-blue-600 font-medium">
                      <Check className="w-4 h-4 mr-1" />
                      {selectedImages.size} selected
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  {images.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Create beautiful wave art</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Generate stunning ocean wave images with inspirational captions. Perfect for social media, prints, and digital marketing.
            </p>
            
            {!apiKey && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-lg mx-auto">
                <p className="text-amber-800 text-sm">
                  <strong>API key required:</strong> Add your Pexels API key to the <code className="bg-amber-100 px-1 rounded text-xs">.env</code> file to get started.
                </p>
              </div>
            )}
            
            <button
              onClick={fetchImages}
              disabled={loading || !apiKey}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create your first collection
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && images.length === 0 && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating your collection...</h3>
            <p className="text-gray-600">Fetching images and adding captions</p>
          </div>
        )}

        {/* Pinterest-style Images Grid */}
        {images.length > 0 && (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 space-y-6">
              {images.map((image, index) => (
                <div key={image.id} className="break-inside-avoid group relative">
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                    <div className="relative">
                      <img
                        src={image.processed}
                        alt={image.caption}
                        className="w-full h-auto object-cover"
                        style={{ aspectRatio: `${image.width}/${image.height}` }}
                      />
                      
                      {/* Hover overlay with selection */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => toggleImageSelection(image.id)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                              selectedImages.has(image.id)
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white/90 border-white/90 hover:bg-white'
                            }`}
                          >
                            {selectedImages.has(image.id) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </button>
                        </div>

                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => downloadImage(image)}
                            className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                          >
                            <Download className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm">
                        {image.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 italic">
                        "{image.caption}"
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="truncate">by {image.photographer}</span>
                        <span className="ml-2 flex-shrink-0">{image.width}×{image.height}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading more indicator */}
              {loading && (
                <div className="break-inside-avoid">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 aspect-square flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Processing...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Load More */}
            {!loading && (
              <div className="text-center mt-12">
                <button
                  onClick={fetchImages}
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Load more images
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WaveCaptionGenerator;