import React, { useState } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Alert,
  LinearProgress
} from '@mui/material';
import { 
  PlayArrow, Download, PhotoLibrary, Add
} from '@mui/icons-material';

const SimpleWaveApp = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

  // Simple captions
  const CAPTIONS = [
    "Find your flow",
    "Ocean vibes only", 
    "Waves of possibility",
    "Deep blue dreams",
    "Ride the wave",
    "Ocean therapy"
  ];

  const addCaptionToImage = (imageUrl, caption) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx.drawImage(img, 0, 0);
          
          const fontSize = Math.max(img.width / 25, 28);
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const textMetrics = ctx.measureText(caption);
          const textWidth = textMetrics.width;
          const textHeight = fontSize;
          
          const padding = fontSize * 0.6;
          const rectWidth = textWidth + (padding * 2);
          const rectHeight = textHeight + (padding * 1.5);
          const x = canvas.width / 2;
          const y = canvas.height - (rectHeight * 1.5);
          
          // Background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(x - rectWidth/2, y - rectHeight/2, rectWidth, rectHeight);
          
          // Text
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(caption, x, y + fontSize * 0.1);
          
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        } catch (error) {
          console.error('Canvas error:', error);
          resolve(imageUrl);
        }
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
    setImages([]);

    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=ocean waves&per_page=10&page=1`,
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

      for (let i = 0; i < Math.min(data.photos.length, 10); i++) {
        const photo = data.photos[i];
        const randomCaption = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
        
        const processedImageUrl = await addCaptionToImage(photo.src.large, randomCaption);
        
        const newImage = {
          id: photo.id,
          original: photo.src.large,
          processed: processedImageUrl,
          caption: randomCaption,
          photographer: photo.photographer,
          width: photo.width,
          height: photo.height
        };

        newImages.push(newImage);
        setImages(prev => [...prev, newImage]);
      }

    } catch (err) {
      setError(err.message.includes('401') 
        ? 'Invalid API key. Please check your Pexels API key.'
        : err.message.includes('429')
        ? 'Rate limit exceeded. Please wait and try again.'
        : `Error: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (image) => {
    const link = document.createElement('a');
    link.download = `wave-art-${image.id}.jpg`;
    link.href = image.processed;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    images.forEach((image, index) => {
      setTimeout(() => downloadImage(image), index * 200);
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      p: 3
    }}>
      {/* Header */}
      <Box sx={{ maxWidth: '1200px', mx: 'auto', mb: 4 }}>
        <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                Wave Caption Generator
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Create beautiful ocean wave images with captions
              </Typography>
            </Box>
            
            <Box display="flex" gap={2}>
              {images.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={downloadAll}
                  sx={{ borderRadius: 2 }}
                >
                  Download All ({images.length})
                </Button>
              )}
              
              <Button
                variant="contained"
                startIcon={loading ? null : <PlayArrow />}
                onClick={fetchImages}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: 2,
                  px: 3
                }}
              >
                {loading ? 'Generating...' : 'Generate Images'}
              </Button>
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ color: '#059669', fontWeight: 700 }}>
                {images.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Images Generated
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ color: '#2563eb', fontWeight: 700 }}>
                {apiKey ? '✓' : '✗'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                API Key Status
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Error */}
      {error && (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', mb: 3 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', mb: 3 }}>
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Creating wave images... ({images.length}/10)
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(images.length / 10) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Card>
        </Box>
      )}

      {/* Empty State */}
      {images.length === 0 && !loading && (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', textAlign: 'center', py: 8 }}>
          <PhotoLibrary sx={{ fontSize: '4rem', color: '#94a3b8', mb: 3 }} />
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Ready to create stunning wave art?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Generate beautiful ocean wave images with inspirational captions
          </Typography>
          
          {!apiKey && (
            <Alert severity="warning" sx={{ mb: 4, maxWidth: 500, mx: 'auto', borderRadius: 2 }}>
              Add your Pexels API key to the .env file to get started
            </Alert>
          )}
          
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={fetchImages}
            disabled={!apiKey}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: 2,
              py: 1.5,
              px: 4
            }}
          >
            Create Your First Collection
          </Button>
        </Box>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 3
          }}>
            {images.map((image, index) => (
              <Card key={image.id} sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
              }}>
                <Box sx={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                  <img
                    src={image.processed}
                    alt={image.caption}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Wave Art #{index + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
                    "{image.caption}"
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      by {image.photographer}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => downloadImage(image)}
                      sx={{ borderRadius: 2 }}
                    >
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SimpleWaveApp;