import React, { useState, useMemo } from 'react';
import { 
  Box, Typography, Button, LinearProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, AppBar, Toolbar, Tabs, Tab, Card, CardContent
} from '@mui/material';
import { 
  PlayArrow, CheckCircle, Schedule, Add, PhotoLibrary,
  ArrowBack, Download, Refresh, Assessment, TrendingUp,
  Store, Star
} from '@mui/icons-material';

import { useImageProcessing } from '../hooks/useImageProcessing';
import { UI_CONSTANTS, BUSINESS_METRICS } from '../config/constants.js';
import { calculateRevenue, getCurrentStep } from '../utils/business.js';
import { calculatePortfolioRevenue, formatCurrency } from '../services/businessIntelligence.js';
import { calculateActualMonthlyRevenue } from '../services/accurateRevenueCalculator.js';
import AutomationSetup from './AutomationSetup.jsx';

const RefinedWaveApp = () => {
  const {
    processedImages,
    loading,
    error,
    apiKey,
    fetchImages,
    downloadAllImages
  } = useImageProcessing();

  const [currentView, setCurrentView] = useState('main');
  const [generateDialog, setGenerateDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Revenue calculations
  const actualRevenue = useMemo(() => {
    return calculateActualMonthlyRevenue({
      numProducts: Math.max(processedImages.length, 1),
      storeStage: 'new',
      pricingStrategy: 'standard',
      productMix: { 
        tshirt: 0.35, mug: 0.25, poster: 0.25, canvas: 0.15
      }
    });
  }, [processedImages.length]);

  const revenue = useMemo(() => 
    calculateRevenue(processedImages.length),
    [processedImages.length]
  );

  const portfolioRevenue = useMemo(() => 
    calculatePortfolioRevenue(processedImages.length),
    [processedImages.length]
  );

  const currentStep = useMemo(() => 
    getCurrentStep(apiKey, loading, processedImages.length),
    [apiKey, loading, processedImages.length]
  );

  const handleGenerateImages = async (quantity) => {
    setGenerateDialog(false);
    await fetchImages();
  };

  const getMaxListings = () => {
    const pexelsHourlyLimit = 200;
    const requestsPerBatch = 3;
    const maxBatchesPerHour = Math.floor(pexelsHourlyLimit / requestsPerBatch);
    const imagesPerBatch = 20;
    return maxBatchesPerHour * imagesPerBatch;
  };

  const handleViewGallery = () => setCurrentView('gallery');
  const handleBackToMain = () => setCurrentView('main');
  const handleLaunchProducts = () => {
    alert('Product launch feature - would integrate with Printify automation');
  };
  const handleTabChange = (event, newValue) => setCurrentTab(newValue);

  // Render Gallery view
  if (currentView === 'gallery') {
    return <GalleryView 
      processedImages={processedImages}
      onBack={handleBackToMain}
      onDownloadAll={downloadAllImages}
      onGenerateNew={() => setGenerateDialog(true)}
    />;
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Professional Header */}
      <Box sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <Box sx={{ maxWidth: '1400px', mx: 'auto', p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Star sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.025em'
                }}>
                  WaveCommerce AI
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: '#64748b',
                  fontWeight: 500
                }}>
                  Generate → Upload → Earn $10,000+/month
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Enhanced Metrics Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              border: '1px solid #86efac',
              borderRadius: 3,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h4" sx={{ 
                  color: '#059669', 
                  fontWeight: 800,
                  mb: 1
                }}>
                  ${Math.abs(actualRevenue.monthlyBankDeposit).toFixed(0)}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#064e3b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Monthly Profit
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ 
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #93c5fd',
              borderRadius: 3,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h4" sx={{ 
                  color: '#2563eb', 
                  fontWeight: 800,
                  mb: 1
                }}>
                  {actualRevenue.breakdown.netProfitMargin.toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#1e3a8a',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Profit Margin
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ 
              background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
              border: '1px solid #fcd34d',
              borderRadius: 3,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h4" sx={{ 
                  color: '#d97706', 
                  fontWeight: 800,
                  mb: 1
                }}>
                  {processedImages.length}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#92400e',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Images Ready
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ 
              background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              border: '1px solid #c4b5fd',
              borderRadius: 3,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h4" sx={{ 
                  color: '#7c3aed', 
                  fontWeight: 800,
                  mb: 1
                }}>
                  {getMaxListings()}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#581c87',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Max Per Hour
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 3, pt: 2 }}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Enhanced Tabbed Dashboard */}
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 3, py: 3 }}>
        <Card sx={{ 
          borderRadius: 4,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.5)'
        }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ 
              borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
              '& .MuiTab-root': { 
                fontSize: '1rem',
                fontWeight: 600,
                minHeight: '64px',
                textTransform: 'none',
                letterSpacing: '-0.025em'
              },
              '& .Mui-selected': {
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
              }
            }}
          >
            <Tab label="🏠 Overview" />
            <Tab label="🎨 Generate" />
            <Tab label="🚀 Automation" />
            <Tab label="📊 Analytics" />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {currentTab === 0 && <OverviewTab 
              processedImages={processedImages}
              handleViewGallery={handleViewGallery}
              downloadAllImages={downloadAllImages}
              apiKey={apiKey}
              loading={loading}
              fetchImages={fetchImages}
            />}
            {currentTab === 1 && <GenerateTab 
              loading={loading}
              processedImages={processedImages}
              onStartGeneration={fetchImages}
              onGenerateNew={() => setGenerateDialog(true)}
              handleViewGallery={handleViewGallery}
              downloadAllImages={downloadAllImages}
            />}
            {currentTab === 2 && <AutomationTab 
              processedImages={processedImages}
              onLaunchProducts={handleLaunchProducts}
            />}
            {currentTab === 3 && <AnalyticsTab portfolioData={portfolioRevenue} />}
          </Box>
        </Card>
      </Box>

      {/* Generate Dialog */}
      <Dialog 
        open={generateDialog} 
        onClose={() => setGenerateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Generate New Images
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, color: '#64748b' }}>
            Choose quantity for your workflow:
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            {[
              { count: 2, label: 'Quick Test' },
              { count: 10, label: 'Small Batch' },
              { count: 100, label: 'Large Test' },
              { count: getMaxListings(), label: 'MAX ALLOWED' }
            ].map((option) => (
              <Button
                key={option.count}
                variant="outlined"
                onClick={() => handleGenerateImages(option.count)}
                sx={{ 
                  py: 3, 
                  borderRadius: 3,
                  textTransform: 'none',
                  ...(option.label === 'MAX ALLOWED' && {
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: 'white',
                    border: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                    }
                  })
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {option.count}
                  </Typography>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {option.label}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setGenerateDialog(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Tab Components
const OverviewTab = ({ processedImages, handleViewGallery, downloadAllImages, apiKey, loading, fetchImages }) => (
  <Box>
    <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: '#1e293b' }}>
      🏠 Dashboard Overview
    </Typography>
    
    {/* Quick Actions */}
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3, mb: 4 }}>
      <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          🎨 Image Generation
        </Typography>
        {!loading && processedImages.length === 0 ? (
          <Button
            variant="contained"
            fullWidth
            startIcon={<PlayArrow />}
            onClick={fetchImages}
            disabled={!apiKey}
            sx={{
              py: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Generate {BUSINESS_METRICS.IMAGES_PER_BATCH} Images
          </Button>
        ) : loading ? (
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Creating... {processedImages.length}/{BUSINESS_METRICS.IMAGES_PER_BATCH}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(processedImages.length / BUSINESS_METRICS.IMAGES_PER_BATCH) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        ) : (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            ✅ {processedImages.length} images ready
          </Alert>
        )}
      </Card>

      <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          📚 Your Collection
        </Typography>
        {processedImages.length > 0 ? (
          <Box>
            <Box display="flex" gap={1} mb={2}>
              <Button size="small" onClick={handleViewGallery} startIcon={<PhotoLibrary />}>
                View Gallery
              </Button>
              <Button size="small" onClick={downloadAllImages} startIcon={<Download />}>
                Download All
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {processedImages.slice(0, 6).map((image, index) => (
                <Box key={image.id} sx={{ width: 60, height: 60, borderRadius: 2, overflow: 'hidden' }}>
                  <img
                    src={image.processed}
                    alt={`Generated ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
              {processedImages.length > 6 && (
                <Box sx={{ 
                  width: 60, height: 60, borderRadius: 2, 
                  background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    +{processedImages.length - 6}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No images generated yet
          </Typography>
        )}
      </Card>
    </Box>
  </Box>
);

const GenerateTab = ({ loading, processedImages, onStartGeneration, onGenerateNew, handleViewGallery, downloadAllImages }) => (
  <Box>
    <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: '#1e293b' }}>
      🎨 Generate Wave Images
    </Typography>
    
    <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 4 }}>
      <Box>
        {!loading && processedImages.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Ready to create?</Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={onStartGeneration}
              sx={{
                py: 2,
                px: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Generate Collection
            </Button>
          </Card>
        ) : loading ? (
          <Card sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Generating...</Typography>
            <LinearProgress
              variant="determinate"
              value={(processedImages.length / 20) * 100}
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {processedImages.length}/20 images completed
            </Typography>
          </Card>
        ) : (
          <Card sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Collection Ready!</Typography>
            <Box display="flex" gap={2} mb={3}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={onGenerateNew}
                sx={{ borderRadius: 2 }}
              >
                Generate More
              </Button>
              <Button
                variant="outlined"
                startIcon={<PhotoLibrary />}
                onClick={handleViewGallery}
                sx={{ borderRadius: 2 }}
              >
                View Gallery
              </Button>
            </Box>
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              {processedImages.length} images ready for download
            </Alert>
          </Card>
        )}
      </Box>

      {processedImages.length > 0 && (
        <Card sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Recent Images</Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
            gap: 1,
            maxHeight: 300,
            overflow: 'auto'
          }}>
            {processedImages.slice(0, 12).map((image, index) => (
              <Box key={image.id} sx={{ aspectRatio: '1', borderRadius: 2, overflow: 'hidden' }}>
                <img
                  src={image.processed}
                  alt={`Generated ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={handleViewGallery}
                />
              </Box>
            ))}
          </Box>
        </Card>
      )}
    </Box>
  </Box>
);

const AutomationTab = ({ processedImages, onLaunchProducts }) => (
  <Box>
    <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: '#1e293b' }}>
      🚀 Product Automation
    </Typography>
    <AutomationSetup processedImages={processedImages} />
  </Box>
);

const AnalyticsTab = ({ portfolioData }) => (
  <Box>
    <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: '#1e293b' }}>
      📊 Revenue Analytics
    </Typography>
    
    <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(3, 1fr)' }, gap: 3 }}>
      <Card sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Monthly Revenue</Typography>
        <Typography variant="h4" sx={{ color: '#059669', fontWeight: 700 }}>
          {formatCurrency(portfolioData.portfolio.totalMonthlyProfit)}
        </Typography>
      </Card>
      
      <Card sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Growth Rate</Typography>
        <Typography variant="h4" sx={{ color: '#d97706', fontWeight: 700 }}>
          26%
        </Typography>
        <Typography variant="body2" color="text.secondary">CAGR</Typography>
      </Card>
      
      <Card sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Market Size</Typography>
        <Typography variant="h4" sx={{ color: '#7c3aed', fontWeight: 700 }}>
          $103B
        </Typography>
        <Typography variant="body2" color="text.secondary">By 2034</Typography>
      </Card>
    </Box>
  </Box>
);

// Gallery View Component
const GalleryView = ({ processedImages, onBack, onDownloadAll, onGenerateNew }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc' }}>
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
        boxShadow: 'none'
      }}>
        <Toolbar>
          <IconButton edge="start" onClick={onBack} sx={{ color: 'white', mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Gallery ({processedImages.length} images)
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={onGenerateNew}
              sx={{ color: 'white', borderColor: 'white', borderRadius: 2 }}
            >
              Generate New
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={onDownloadAll}
              sx={{ 
                background: '#059669',
                borderRadius: 2,
                '&:hover': { background: '#047857' }
              }}
            >
              Download All
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        {processedImages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PhotoLibrary sx={{ fontSize: '4rem', color: '#94a3b8', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 3, color: '#1e293b' }}>
              No Images Generated Yet
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onGenerateNew}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: 3,
                py: 1.5,
                px: 4,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Generate Images
            </Button>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 3
          }}>
            {processedImages.map((image, index) => (
              <Card key={image.id} sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
              }}>
                <Box 
                  sx={{ 
                    aspectRatio: `${image.width}/${image.height}`,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.processed}
                    alt={`Wave art ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </Box>
                
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Image #{index + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontStyle: 'italic' }}>
                    "{image.caption}"
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {image.width} × {image.height}
                    </Typography>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.download = `${image.filename || 'wave-art'}.jpg`;
                        link.href = image.processed;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      sx={{ color: '#3b82f6' }}
                    >
                      <Download fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Image Detail Modal */}
      <Dialog 
        open={!!selectedImage} 
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedImage && (
          <>
            <DialogTitle sx={{ background: '#1e293b', color: 'white', fontWeight: 600 }}>
              {selectedImage.filename || 'Wave Art Preview'}
            </DialogTitle>
            <DialogContent sx={{ p: 0, background: 'black' }}>
              <img
                src={selectedImage.processed}
                alt="Full size preview"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </DialogContent>
            <DialogActions sx={{ background: '#1e293b', color: 'white', p: 3 }}>
              <Typography variant="body2" sx={{ flexGrow: 1, color: 'white' }}>
                "{selectedImage.caption}"
              </Typography>
              <Button 
                startIcon={<Download />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `${selectedImage.filename || 'wave-art'}.jpg`;
                  link.href = selectedImage.processed;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                sx={{ color: 'white', borderRadius: 2 }}
              >
                Download
              </Button>
              <Button onClick={() => setSelectedImage(null)} sx={{ color: 'white', borderRadius: 2 }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default RefinedWaveApp;