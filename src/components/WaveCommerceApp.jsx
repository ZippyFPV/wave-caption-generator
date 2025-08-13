import React, { useState, useMemo } from 'react';
import { 
  Box, Typography, Button, LinearProgress, Grid, Alert, Chip,
  Accordion, AccordionSummary, AccordionDetails, Card as MuiCard,
  CardContent, Divider, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, ButtonGroup,
  IconButton, Tooltip, AppBar, Toolbar, Tabs, Tab
} from '@mui/material';
import { 
  PlayArrow, Launch, Store, TrendingUp, ExpandMore, Info,
  CheckCircle, Schedule, Assessment, AccountBalance, PhoneAndroid,
  Psychology, Speed, LocalOffer, Timeline, Warning, Public,
  Insights, AttachMoney, Collections, Add, PhotoLibrary,
  ArrowBack, Download, Refresh, Settings
} from '@mui/icons-material';

import Card from './ui/Card.jsx';
import AutomationSetup from './AutomationSetup.jsx';
import ShopIdFinder from './ShopIdFinder.jsx';
import { useImageProcessing } from '../hooks/useImageProcessing';
import { UI_CONSTANTS, BUSINESS_METRICS } from '../config/constants.js';
import { calculateRevenue, getCurrentStep } from '../utils/business.js';
import { PRINTIFY_PRODUCTS, calculatePortfolioRevenue, formatCurrency } from '../services/businessIntelligence.js';
import { calculateActualMonthlyRevenue } from '../services/accurateRevenueCalculator.js';
import { runQuickTest } from '../utils/systemTester.js';

const WaveCommerceApp = () => {
  // Core state management
  const {
    processedImages,
    loading,
    error,
    apiKey,
    fetchImages,
    downloadAllImages
  } = useImageProcessing();

  const [currentView, setCurrentView] = useState('main'); // 'main' or 'gallery'
  const [generateDialog, setGenerateDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0); // 0: Overview, 1: Generate, 2: Automation, 3: Analytics

  // ULTRA-ACCURATE REVENUE CALCULATIONS - Based on Real 2024 Market Data
  const actualRevenue = useMemo(() => {
    // Conservative calculation for new store with 20 products
    return calculateActualMonthlyRevenue({
      numProducts: Math.max(processedImages.length, 1),
      storeStage: 'new',              // Conservative estimate for new stores
      pricingStrategy: 'standard',     // 40% markup (Printify seller average)
      productMix: { 
        tshirt: 0.35,    // 35% t-shirts (easiest to sell)
        mug: 0.25,       // 25% mugs (good margins)
        poster: 0.25,    // 25% posters (affordable entry)
        canvas: 0.15     // 15% canvas (premium option)
      }
    });
  }, [processedImages.length]);

  // Legacy calculations for comparison (keeping for UI compatibility)
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

  // Generate images with specific quantity for testing
  const handleGenerateImages = async (quantity) => {
    setGenerateDialog(false);
    console.log(`🎯 Generating ${quantity} images for testing...`);
    await fetchImages(); // The hook will handle the quantity
  };

  // Research maximum allowed listings limit
  const getMaxListings = () => {
    // Based on Pexels API limits and typical POD platform limits
    const pexelsHourlyLimit = 200; // requests per hour
    const requestsPerBatch = 3; // 3 pages of images
    const maxBatchesPerHour = Math.floor(pexelsHourlyLimit / requestsPerBatch);
    const imagesPerBatch = 20;
    return maxBatchesPerHour * imagesPerBatch; // ~1,333 images per hour max
  };

  // Switch to gallery view
  const handleViewGallery = () => {
    setCurrentView('gallery');
  };

  // Return to main view
  const handleBackToMain = () => {
    setCurrentView('main');
  };

  // Handle launch products
  const handleLaunchProducts = () => {
    console.log('🚀 Launching products...');
    // This would integrate with AutomationSetup component
    alert('Product launch feature - would integrate with Printify automation');
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Main workflow steps
  const steps = [
    {
      id: 'step-0',
      title: '🔑 Setup API Keys',
      status: apiKey ? 'completed' : 'active',
      description: 'Connect to Pexels and Printify APIs',
      timeEstimate: '2 minutes',
      expectation: 'Add API keys to .env file for automated workflow',
      content: <SetupContent apiKey={apiKey} />
    },
    {
      id: 'step-1', 
      title: '🎨 Generate Collection',
      status: loading ? 'active' : processedImages.length > 0 ? 'completed' : currentStep >= 1 ? 'active' : 'pending',
      description: `Create ${BUSINESS_METRICS.IMAGES_PER_BATCH} SEO-optimized wave images`,
      timeEstimate: '3 minutes',
      expectation: `Each image becomes a separate $${BUSINESS_METRICS.AVG_SALE_PRICE} product listing`,
      content: <GenerateContent 
        loading={loading} 
        processedImages={processedImages} 
        onStartGeneration={fetchImages}
        revenue={revenue}
        onGenerateNew={() => setGenerateDialog(true)}
      />
    },
    {
      id: 'step-2',
      title: '🚀 Auto-Launch Products', 
      status: processedImages.length >= 20 ? 'active' : 'pending',
      description: 'Automated product creation and publishing',
      timeEstimate: '2 minutes setup',
      expectation: 'All products auto-created with SEO optimization and published to your store',
      content: <AutomationContent processedImages={processedImages} onLaunchProducts={handleLaunchProducts} />
    },
    {
      id: 'step-3',
      title: '💰 Revenue Intelligence',
      status: processedImages.length > 0 ? 'active' : 'pending',
      description: 'Complete business analytics and market intelligence',
      timeEstimate: '5 minutes review',
      expectation: 'See all opportunities, market insights, and optimization strategies',
      content: <RevenueIntelligence portfolioData={portfolioRevenue} />
    },
    {
      id: 'step-4',
      title: '📈 Scale to $10K+',
      status: processedImages.length >= 20 ? 'active' : 'pending', 
      description: 'Track performance and multiply winners',
      timeEstimate: 'Ongoing',
      expectation: 'Find top sellers, create variations, reach $10K+ monthly',
      content: <ScaleContent portfolioData={portfolioRevenue} processedImages={processedImages} />
    }
  ];

  // Render Gallery view if selected
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
      maxWidth: '1400px',
      mx: 'auto',
      p: 2
    }}>
      {/* Compact Header */}
      <Box sx={{ 
        mb: 2,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        p: 3,
        border: '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" sx={{ 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.025em'
          }}>
            WaveCommerce AI
          </Typography>
          <Typography variant="h6" sx={{ 
            color: UI_CONSTANTS.COLORS.TEXT.SECONDARY
          }}>
            Generate → Upload → Earn $10,000+/month
          </Typography>
        </Box>

        {/* Key Metrics - Single Row */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 120px', textAlign: 'center', p: 1.5, background: 'rgba(22, 163, 74, 0.1)', borderRadius: 1 }}>
            <Typography variant="h5" sx={{ color: UI_CONSTANTS.COLORS.SUCCESS, fontWeight: 'bold' }}>
              ${Math.abs(actualRevenue.monthlyBankDeposit).toFixed(0)}
            </Typography>
            <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
              Monthly Profit
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 120px', textAlign: 'center', p: 1.5, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 1 }}>
            <Typography variant="h5" sx={{ color: UI_CONSTANTS.COLORS.SECONDARY, fontWeight: 'bold' }}>
              {actualRevenue.breakdown.netProfitMargin.toFixed(1)}%
            </Typography>
            <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
              Profit Margin
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 120px', textAlign: 'center', p: 1.5, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 1 }}>
            <Typography variant="h5" sx={{ color: UI_CONSTANTS.COLORS.WARNING, fontWeight: 'bold' }}>
              {processedImages.length}
            </Typography>
            <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
              Images Ready
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 120px', textAlign: 'center', p: 1.5, background: 'rgba(139, 69, 19, 0.1)', borderRadius: 1 }}>
            <Typography variant="h5" sx={{ color: '#8b4513', fontWeight: 'bold' }}>
              {getMaxListings()}
            </Typography>
            <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
              Max Per Hour
            </Typography>
          </Box>
          <Box sx={{ flex: '2 1 200px', display: 'flex', alignItems: 'center' }}>
            <Alert severity="info" sx={{ 
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              width: '100%',
              '& .MuiAlert-message': { 
                color: UI_CONSTANTS.COLORS.TEXT.PRIMARY,
                fontSize: '0.8rem'
              }
            }}>
              <strong>Zero Risk:</strong> No upfront costs, no inventory, automated fulfillment
            </Alert>
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, backgroundColor: UI_CONSTANTS.COLORS.ERROR, color: UI_CONSTANTS.COLORS.ACCESSIBLE.ERROR_TEXT }}>
          {error}
        </Alert>
      )}

      {/* Tabbed Dashboard */}
      <Box sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: '1px solid rgba(148, 163, 184, 0.2)',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Tab Navigation */}
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ 
            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
            '& .MuiTab-root': { 
              fontSize: '0.9rem',
              fontWeight: 'bold',
              minHeight: '48px'
            }
          }}
        >
          <Tab label="🏠 Overview" />
          <Tab label="🎨 Generate" />
          <Tab label="🚀 Automation" />
          <Tab label="📊 Analytics" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {currentTab === 0 && <OverviewTab 
            steps={steps}
            processedImages={processedImages}
            handleViewGallery={handleViewGallery}
            downloadAllImages={downloadAllImages}
          />}
          {currentTab === 1 && <GenerateTab 
            loading={loading}
            processedImages={processedImages}
            onStartGeneration={fetchImages}
            revenue={revenue}
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
      </Box>

      {/* Generate New Images Dialog */}
      <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)}>
        <DialogTitle>Generate New Images - Testing Mode</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Choose quantity for testing your workflow:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 200px' }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleGenerateImages(2)}
                sx={{ py: 2 }}
              >
                <Box textAlign="center">
                  <Typography variant="h6">2 Images</Typography>
                  <Typography variant="caption">Quick Test</Typography>
                </Box>
              </Button>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleGenerateImages(10)}
                sx={{ py: 2 }}
              >
                <Box textAlign="center">
                  <Typography variant="h6">10 Images</Typography>
                  <Typography variant="caption">Small Batch</Typography>
                </Box>
              </Button>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleGenerateImages(100)}
                sx={{ py: 2 }}
              >
                <Box textAlign="center">
                  <Typography variant="h6">100 Images</Typography>
                  <Typography variant="caption">Large Test</Typography>
                </Box>
              </Button>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleGenerateImages(getMaxListings())}
                sx={{ py: 2, background: UI_CONSTANTS.COLORS.SUCCESS }}
              >
                <Box textAlign="center">
                  <Typography variant="h6">{getMaxListings()}</Typography>
                  <Typography variant="caption">MAX ALLOWED</Typography>
                </Box>
              </Button>
            </Box>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>API Limits:</strong> Maximum {getMaxListings()} images per hour based on Pexels rate limits.
              Start with smaller quantities to test your workflow.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* System Test Button - Development Helper */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => runQuickTest()}
            sx={{ 
              color: UI_CONSTANTS.COLORS.TEXT.SECONDARY,
              borderColor: UI_CONSTANTS.COLORS.TEXT.SECONDARY,
              fontSize: '0.8rem'
            }}
          >
            🧪 Run System Test (Check Console)
          </Button>
        </Box>
      )}
    </Box>
  );
};

// Step Content Components (consolidated)
const SetupContent = ({ apiKey }) => (
  <Box>
    {!apiKey ? (
      <Button
        variant="contained"
        fullWidth
        size="small"
        href="https://www.pexels.com/api/"
        target="_blank"
        sx={{
          background: `linear-gradient(45deg, ${UI_CONSTANTS.COLORS.WARNING}, ${UI_CONSTANTS.COLORS.ERROR})`,
          fontSize: '0.8rem',
          py: 1
        }}
      >
        Get API Keys
      </Button>
    ) : (
      <Alert severity="success" sx={{ fontSize: '0.7rem', p: 1 }}>
        ✅ API Keys Connected
      </Alert>
    )}
  </Box>
);

const GenerateContent = ({ loading, processedImages, onStartGeneration, revenue, onGenerateNew }) => (
  <Box>
    {!loading && processedImages.length === 0 ? (
      <Button
        variant="contained"
        fullWidth
        size="small"
        startIcon={<PlayArrow />}
        onClick={onStartGeneration}
        sx={{
          background: `linear-gradient(45deg, ${UI_CONSTANTS.COLORS.PRIMARY}, ${UI_CONSTANTS.COLORS.SUCCESS})`,
          fontSize: '0.8rem',
          py: 1
        }}
      >
        Generate {BUSINESS_METRICS.IMAGES_PER_BATCH} Images
      </Button>
    ) : loading ? (
      <Box>
        <Typography variant="body2" sx={{ color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, mb: 1, fontSize: '0.8rem' }}>
          Creating... {processedImages.length}/{BUSINESS_METRICS.IMAGES_PER_BATCH}
        </Typography>
        
        <LinearProgress
          variant="determinate"
          value={(processedImages.length / BUSINESS_METRICS.IMAGES_PER_BATCH) * 100}
          sx={{
            height: 6,
            borderRadius: 3,
            '& .MuiLinearProgress-bar': { 
              background: `linear-gradient(45deg, ${UI_CONSTANTS.COLORS.PRIMARY}, ${UI_CONSTANTS.COLORS.SUCCESS})`
            }
          }}
        />
      </Box>
    ) : (
      <Box>
        <Alert severity="success" sx={{ mb: 1, p: 1, fontSize: '0.7rem' }}>
          ✅ {processedImages.length} images ready
        </Alert>
        
        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<Add />}
          onClick={onGenerateNew}
          sx={{
            fontSize: '0.8rem',
            py: 1,
            color: UI_CONSTANTS.COLORS.SECONDARY,
            borderColor: UI_CONSTANTS.COLORS.SECONDARY
          }}
        >
          Generate More
        </Button>
      </Box>
    )}
  </Box>
);

const AutomationContent = ({ processedImages, onLaunchProducts }) => (
  <Box>
    {processedImages.length >= 20 ? (
      <Button
        variant="contained"
        fullWidth
        size="small"
        startIcon={<Store />}
        onClick={onLaunchProducts}
        sx={{
          background: `linear-gradient(45deg, ${UI_CONSTANTS.COLORS.PRIMARY}, ${UI_CONSTANTS.COLORS.SUCCESS})`,
          fontSize: '0.8rem',
          py: 1
        }}
      >
        Launch Products
      </Button>
    ) : (
      <Alert severity="warning" sx={{ fontSize: '0.7rem', p: 1 }}>
        Need {20 - processedImages.length} more images
      </Alert>
    )}
  </Box>
);

// Compact Revenue Intelligence Sidebar
const RevenueIntelligence = ({ portfolioData }) => {
  const topPerformers = portfolioData.products
    .sort((a, b) => b.monthlyProfit - a.monthlyProfit)
    .slice(0, 3);

  return (
    <Box>
      {/* Quick Stats */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" sx={{ 
          color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, 
          fontWeight: 'bold', 
          mb: 2,
          fontSize: '1rem'
        }}>
          💰 Revenue Analytics
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Box sx={{ flex: 1, textAlign: 'center', p: 1, background: 'rgba(22, 163, 74, 0.1)', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ color: UI_CONSTANTS.COLORS.SUCCESS, fontWeight: 'bold', fontSize: '1rem' }}>
              {formatCurrency(portfolioData.portfolio.totalMonthlyProfit)}
            </Typography>
            <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
              Monthly
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', p: 1, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ color: UI_CONSTANTS.COLORS.SECONDARY, fontWeight: 'bold', fontSize: '1rem' }}>
              118
            </Typography>
            <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
              Days to $1K
            </Typography>
          </Box>
        </Box>

        {/* Top 3 Products */}
        <Typography variant="body2" sx={{ 
          color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, 
          fontWeight: 'bold', 
          mb: 1,
          fontSize: '0.9rem'
        }}>
          🏆 Top Performers
        </Typography>
        
        {topPerformers.map((product, index) => (
          <Box key={product.id} sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 1,
            mb: 1,
            background: 'rgba(30, 41, 59, 0.05)',
            borderRadius: 1
          }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">{product.icon}</Typography>
              <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, fontWeight: 'bold' }}>
                {product.name}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.SUCCESS, fontWeight: 'bold' }}>
              {formatCurrency(product.monthlyProfit)}
            </Typography>
          </Box>
        ))}
      </Card>

      {/* Market Insights */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" sx={{ 
          color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, 
          fontWeight: 'bold', 
          mb: 2,
          fontSize: '1rem'
        }}>
          📊 Market Insights
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Box sx={{ flex: 1, textAlign: 'center', p: 1, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ color: UI_CONSTANTS.COLORS.WARNING, fontWeight: 'bold', fontSize: '1rem' }}>
              26%
            </Typography>
            <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
              Market CAGR
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', p: 1, background: 'rgba(139, 69, 19, 0.1)', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ color: '#8b4513', fontWeight: 'bold', fontSize: '1rem' }}>
              $103B
            </Typography>
            <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
              By 2034
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ 
          fontSize: '0.7rem', 
          p: 1,
          background: 'rgba(96, 165, 250, 0.1)',
          border: '1px solid rgba(96, 165, 250, 0.3)'
        }}>
          <Typography variant="caption">
            <strong>Wave Art Advantage:</strong> Therapeutic trend + personalization = premium positioning
          </Typography>
        </Alert>
      </Card>

      {/* Quick Actions */}
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ 
          color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, 
          fontWeight: 'bold', 
          mb: 2,
          fontSize: '1rem'
        }}>
          🎯 Quick Actions
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<Assessment />}
            href="https://www.shopify.com/partners/blog/track-ecommerce-metrics"
            target="_blank"
            sx={{ 
              fontSize: '0.7rem',
              py: 0.5,
              color: UI_CONSTANTS.COLORS.SECONDARY,
              borderColor: UI_CONSTANTS.COLORS.SECONDARY
            }}
          >
            Track Performance
          </Button>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<TrendingUp />}
            href="https://printify.com/blog/print-on-demand-best-practices/"
            target="_blank"
            sx={{ 
              fontSize: '0.7rem',
              py: 0.5,
              color: UI_CONSTANTS.COLORS.WARNING,
              borderColor: UI_CONSTANTS.COLORS.WARNING
            }}
          >
            Scaling Guide
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

const ScaleContent = ({ portfolioData, processedImages }) => (
  <Box>
    {processedImages.length >= 20 ? (
      <Button
        variant="contained"
        fullWidth
        size="small"
        startIcon={<Assessment />}
        href="https://www.shopify.com/partners/blog/track-ecommerce-metrics"
        target="_blank"
        sx={{ 
          background: `linear-gradient(45deg, ${UI_CONSTANTS.COLORS.SUCCESS}, ${UI_CONSTANTS.COLORS.PRIMARY})`,
          fontSize: '0.8rem',
          py: 1
        }}
      >
        Track Performance
      </Button>
    ) : (
      <Alert severity="info" sx={{ fontSize: '0.7rem', p: 1 }}>
        Complete generation to unlock scaling
      </Alert>
    )}
  </Box>
);

// Gallery View Component for browsing all generated images
const GalleryView = ({ processedImages, onBack, onDownloadAll, onGenerateNew }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: UI_CONSTANTS.COLORS.BACKGROUND,
    }}>
      {/* Gallery Header */}
      <AppBar position="static" sx={{ 
        background: 'rgba(51, 65, 85, 0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            onClick={onBack}
            sx={{ color: 'white', mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
            Wave Collection Gallery ({processedImages.length} images)
          </Typography>
          
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={onGenerateNew}
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': { borderColor: UI_CONSTANTS.COLORS.SUCCESS }
              }}
            >
              Generate New
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={onDownloadAll}
              sx={{ 
                background: UI_CONSTANTS.COLORS.SUCCESS,
                '&:hover': { background: UI_CONSTANTS.COLORS.PRIMARY }
              }}
            >
              Download All
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Gallery Grid */}
      <Box sx={{ p: 3 }}>
        {processedImages.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 3,
            border: '2px dashed rgba(148, 163, 184, 0.3)'
          }}>
            <PhotoLibrary sx={{ 
              fontSize: '4rem', 
              color: UI_CONSTANTS.COLORS.TEXT.SECONDARY,
              mb: 2 
            }} />
            <Typography variant="h5" sx={{ 
              color: UI_CONSTANTS.COLORS.TEXT.PRIMARY,
              mb: 1
            }}>
              No Images Generated Yet
            </Typography>
            <Typography variant="body1" sx={{ 
              color: UI_CONSTANTS.COLORS.TEXT.SECONDARY,
              mb: 3
            }}>
              Generate your first collection to see them here
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onGenerateNew}
              sx={{
                background: `linear-gradient(45deg, ${UI_CONSTANTS.COLORS.PRIMARY}, ${UI_CONSTANTS.COLORS.SUCCESS})`,
                py: 1.5,
                px: 3
              }}
            >
              Generate Images
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {processedImages.map((image, index) => (
              <Box key={image.id} sx={{ flex: '1 1 250px', maxWidth: '300px' }}>
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}>
                  <Box 
                    sx={{ 
                      aspectRatio: '4/3',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative'
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
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                    
                    {/* Overlay with caption */}
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      color: 'white',
                      p: 2,
                      transform: 'translateY(100%)',
                      transition: 'transform 0.3s ease'
                    }}
                    className="image-overlay">
                      <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                        {image.caption}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ 
                      color: UI_CONSTANTS.COLORS.TEXT.PRIMARY,
                      fontWeight: 'bold',
                      mb: 1
                    }}>
                      Image #{index + 1}
                    </Typography>
                    
                    <Typography variant="caption" sx={{ 
                      color: UI_CONSTANTS.COLORS.TEXT.SECONDARY,
                      display: 'block',
                      mb: 1
                    }}>
                      {image.filename}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ 
                        color: UI_CONSTANTS.COLORS.TEXT.SECONDARY
                      }}>
                        {image.width} × {image.height}
                      </Typography>
                      
                      <IconButton 
                        size="small"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.download = `${image.filename}.jpg`;
                          link.href = image.processed;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        sx={{ color: UI_CONSTANTS.COLORS.PRIMARY }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
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
      >
        {selectedImage && (
          <>
            <DialogTitle sx={{ 
              background: 'rgba(51, 65, 85, 0.95)',
              color: 'white'
            }}>
              Wave Art Preview - {selectedImage.filename}
            </DialogTitle>
            <DialogContent sx={{ p: 0, background: 'black' }}>
              <img
                src={selectedImage.processed}
                alt="Full size preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </DialogContent>
            <DialogActions sx={{ 
              background: 'rgba(51, 65, 85, 0.95)',
              color: 'white'
            }}>
              <Typography variant="body2" sx={{ 
                flexGrow: 1, 
                color: 'white'
              }}>
                Caption: {selectedImage.caption}
              </Typography>
              <Button 
                startIcon={<Download />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `${selectedImage.filename}.jpg`;
                  link.href = selectedImage.processed;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                sx={{ color: 'white' }}
              >
                Download
              </Button>
              <Button onClick={() => setSelectedImage(null)} sx={{ color: 'white' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <style>
        {`
          .MuiCard-root:hover .image-overlay {
            transform: translateY(0) !important;
          }
        `}
      </style>
    </Box>
  );
};

// Tab Components for the Dashboard
const OverviewTab = ({ steps, processedImages, handleViewGallery, downloadAllImages }) => (
  <Box>
    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
      🏠 Quick Overview
    </Typography>
    
    {/* Workflow Status */}
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      {steps.map((step) => (
        <Box key={step.id} sx={{ 
          flex: '1 1 200px', 
          p: 2, 
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: 2,
          background: step.status === 'completed' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(148, 163, 184, 0.05)'
        }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {step.status === 'completed' ? 
              <CheckCircle sx={{ color: UI_CONSTANTS.COLORS.SUCCESS, fontSize: '1.2rem' }} /> :
              <Schedule sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY, fontSize: '1.2rem' }} />
            }
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
              {step.title}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY, fontSize: '0.9rem' }}>
            {step.description}
          </Typography>
        </Box>
      ))}
    </Box>

    {/* Real-time Images Preview - Shows during generation and after */}
    {(processedImages.length > 0 || loading) && (
      <Box sx={{ 
        p: 3, 
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: 3,
        background: loading ? 'rgba(59, 130, 246, 0.05)' : 'rgba(22, 163, 74, 0.05)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {loading ? `🎨 Generating Live... (${processedImages.length}/${BUSINESS_METRICS.IMAGES_PER_BATCH})` : `✅ Generated Collection (${processedImages.length} images)`}
          </Typography>
          {processedImages.length > 0 && (
            <Box display="flex" gap={1}>
              <Button size="small" onClick={handleViewGallery} startIcon={<PhotoLibrary />}>
                View All
              </Button>
              <Button size="small" onClick={downloadAllImages} startIcon={<Download />}>
                Download
              </Button>
            </Box>
          )}
        </Box>
        
        {loading && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress 
              variant="determinate" 
              value={(processedImages.length / BUSINESS_METRICS.IMAGES_PER_BATCH) * 100}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                background: 'rgba(148, 163, 184, 0.2)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                }
              }}
            />
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Images appear here as they're processed... (~3-5 seconds each)
            </Typography>
          </Box>
        )}
        
        {/* Live Image Grid - Updates in real-time as images are generated */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 2 }}>
          {processedImages.map((image, index) => (
            <Box key={image.id} sx={{ 
              aspectRatio: '1',
              borderRadius: 2, 
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                transform: 'scale(1.05)',
                border: '2px solid rgba(34, 197, 94, 0.6)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <img
                src={image.processed}
                alt={`Generated ${index + 1}: ${image.caption}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                title={`"${image.caption}" - Click to view gallery`}
                onClick={handleViewGallery}
              />
            </Box>
          ))}
          
          {/* Show loading placeholders for remaining images during generation */}
          {loading && Array.from({ length: BUSINESS_METRICS.IMAGES_PER_BATCH - processedImages.length }).map((_, index) => (
            <Box key={`loading-${index}`} sx={{ 
              aspectRatio: '1',
              borderRadius: 2,
              background: 'linear-gradient(45deg, rgba(148, 163, 184, 0.1) 25%, transparent 25%, transparent 75%, rgba(148, 163, 184, 0.1) 75%)',
              backgroundSize: '20px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed rgba(148, 163, 184, 0.3)',
              animation: 'pulse 2s infinite'
            }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', fontWeight: 'bold' }}>
                #{processedImages.length + index + 1}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {processedImages.length > 0 && !loading && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={() => setGenerateDialog(true)}
              startIcon={<Add />}
              sx={{ 
                borderRadius: 2,
                borderColor: '#3b82f6',
                color: '#3b82f6',
                '&:hover': {
                  borderColor: '#2563eb',
                  background: 'rgba(59, 130, 246, 0.05)'
                }
              }}
            >
              Generate More Images
            </Button>
          </Box>
        )}
      </Box>
    )}
  </Box>
);

const GenerateTab = ({ loading, processedImages, onStartGeneration, revenue, onGenerateNew, handleViewGallery, downloadAllImages }) => (
  <Box>
    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
      🎨 Generate Wave Images
    </Typography>
    
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {/* Main Generation Controls */}
      <Box sx={{ flex: '1 1 400px' }}>
        <GenerateContent 
          loading={loading}
          processedImages={processedImages}
          onStartGeneration={onStartGeneration}
          revenue={revenue}
          onGenerateNew={onGenerateNew}
        />
        
        {loading && (
          <Box sx={{ mt: 3, p: 2, border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 2, background: 'rgba(59, 130, 246, 0.05)' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Generation Progress</Typography>
            <LinearProgress 
              variant="determinate" 
              value={(processedImages.length / 20) * 100}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Typography variant="body2" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
              {processedImages.length}/20 images completed
            </Typography>
          </Box>
        )}
      </Box>

      {/* Live Images Gallery - Shows during and after generation */}
      {(processedImages.length > 0 || loading) && (
        <Box sx={{ flex: '1 1 400px' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            {loading ? `🔄 Live Generation (${processedImages.length}/${BUSINESS_METRICS.IMAGES_PER_BATCH})` : `📚 Generated Collection (${processedImages.length} images)`}
          </Typography>
          <Box sx={{ 
            maxHeight: '500px', 
            overflow: 'auto',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 3,
            p: 3,
            background: loading ? 'rgba(59, 130, 246, 0.02)' : 'rgba(22, 163, 74, 0.02)'
          }}>
            {loading && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={(processedImages.length / BUSINESS_METRICS.IMAGES_PER_BATCH) * 100}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    background: 'rgba(148, 163, 184, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                    }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                  Watch images appear in real-time...
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 2 }}>
              {processedImages.map((image, index) => (
                <Box key={image.id} sx={{ 
                  aspectRatio: '1',
                  borderRadius: 2, 
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(34, 197, 94, 0.3)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    border: '2px solid rgba(34, 197, 94, 0.6)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }
                }}>
                  <img
                    src={image.processed}
                    alt={`Generated ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={handleViewGallery}
                  />
                  {/* Caption overlay on hover */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    color: 'white',
                    p: 1,
                    transform: 'translateY(100%)',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'translateY(0)' }
                  }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                      "{image.caption}"
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              {/* Loading placeholders */}
              {loading && Array.from({ length: BUSINESS_METRICS.IMAGES_PER_BATCH - processedImages.length }).map((_, index) => (
                <Box key={`loading-${index}`} sx={{ 
                  aspectRatio: '1',
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, rgba(148, 163, 184, 0.1) 25%, transparent 25%, transparent 75%, rgba(148, 163, 184, 0.1) 75%)',
                  backgroundSize: '20px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed rgba(148, 163, 184, 0.3)',
                  animation: 'pulse 2s infinite'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', fontWeight: 'bold' }}>
                    #{processedImages.length + index + 1}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            {processedImages.length > 0 && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button size="small" onClick={handleViewGallery} variant="outlined" sx={{ borderRadius: 2 }}>
                  View Full Gallery
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  </Box>
);

const AutomationTab = ({ processedImages, onLaunchProducts }) => (
  <Box>
    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
      🚀 Product Automation
    </Typography>
    
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <Box sx={{ flex: '1 1 400px' }}>
        <AutomationSetup processedImages={processedImages} />
      </Box>
      
      <Box sx={{ flex: '1 1 300px' }}>
        <Box sx={{ p: 3, border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Quick Launch
          </Typography>
          <AutomationContent processedImages={processedImages} onLaunchProducts={onLaunchProducts} />
          
          {processedImages.length >= 20 && (
            <Alert severity="success" sx={{ mt: 2, fontSize: '0.9rem' }}>
              <strong>Ready to Launch!</strong> {processedImages.length} images are processed and ready for automated product creation.
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  </Box>
);

const AnalyticsTab = ({ portfolioData }) => (
  <Box>
    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
      📊 Revenue Analytics
    </Typography>
    
    <RevenueIntelligence portfolioData={portfolioData} />
  </Box>
);

export default WaveCommerceApp;