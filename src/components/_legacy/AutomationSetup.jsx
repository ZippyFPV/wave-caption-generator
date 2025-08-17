import React, { useState } from 'react';
import { 
  Box, Typography, Button, TextField, Alert, Grid, 
  FormGroup, FormControlLabel, Checkbox, LinearProgress,
  Card as MuiCard, CardContent, Divider, IconButton, Chip
} from '@mui/material';
import { 
  RocketLaunch, Settings, CheckCircle, Warning,
  AutoAwesome, TrendingUp, Store, Launch, Assessment,
  Pause, PlayArrow, Stop
} from '@mui/icons-material';

import Card from './ui/Card.jsx';
import { UI_CONSTANTS } from '../config/constants.js';
import { formatCurrency } from '../services/businessIntelligence.js';
import PrintifyAutomation from '../services/printifyAutomation.js';

// Component to display automation results
const AutomationResults = ({ results, createdProducts }) => (
  <Box>
    <Typography variant="h4" sx={{ 
      color: UI_CONSTANTS.COLORS.SUCCESS,
      fontWeight: 'bold',
      textAlign: 'center',
      mb: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1
    }}>
      <CheckCircle /> Automation Complete!
    </Typography>

    {/* Summary Stats */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={3}>
        <Card sx={{ p: 2, textAlign: 'center', background: 'rgba(22, 163, 74, 0.1)' }}>
          <Typography variant="h3" sx={{ color: UI_CONSTANTS.COLORS.SUCCESS, fontWeight: 'bold' }}>
            {results.filter(r => r.success).length}
          </Typography>
          <Typography variant="body2">Products Created</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card sx={{ p: 2, textAlign: 'center', background: 'rgba(59, 130, 246, 0.1)' }}>
          <Typography variant="h3" sx={{ color: UI_CONSTANTS.COLORS.PRIMARY, fontWeight: 'bold' }}>
            {results.filter(r => r.published).length}
          </Typography>
          <Typography variant="body2">Published to Shopify</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card sx={{ p: 2, textAlign: 'center', background: 'rgba(245, 158, 11, 0.1)' }}>
          <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
            {results.filter(r => !r.success).length}
          </Typography>
          <Typography variant="body2">Failed</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card sx={{ p: 2, textAlign: 'center', background: 'rgba(139, 92, 246, 0.1)' }}>
          <Typography variant="h3" sx={{ color: '#8b5cf6', fontWeight: 'bold' }}>
            ${Math.round(results.filter(r => r.success).reduce((sum, r) => sum + (r.profit || 0), 0))}
          </Typography>
          <Typography variant="body2">Est. Monthly Profit</Typography>
        </Card>
      </Grid>
    </Grid>

    {/* Created Products List */}
    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
      📦 Created Products ({results.filter(r => r.success).length})
    </Typography>
    
    <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
      {results.filter(r => r.success).map((product, index) => (
        <Card key={index} sx={{ mb: 2, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {product.title?.slice(0, 60)}...
              </Typography>
              <Box display="flex" gap={2} mb={1}>
                <Chip size="small" label={product.productType} sx={{ background: UI_CONSTANTS.COLORS.PRIMARY, color: 'white' }} />
                <Chip size="small" label={`$${product.profit?.toFixed(2)}/month`} sx={{ background: UI_CONSTANTS.COLORS.SUCCESS, color: 'white' }} />
                <Chip size="small" label={product.status} sx={{ background: product.published ? UI_CONSTANTS.COLORS.SUCCESS : '#f59e0b', color: 'white' }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Product ID: {product.productId} • Created: {product.timestamp}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              {product.printifyUrl && (
                <IconButton 
                  size="small" 
                  onClick={() => window.open(product.printifyUrl, '_blank')}
                  sx={{ color: UI_CONSTANTS.COLORS.PRIMARY }}
                >
                  <Launch />
                </IconButton>
              )}
              {product.url && (
                <IconButton 
                  size="small" 
                  onClick={() => window.open(product.url, '_blank')}
                  sx={{ color: UI_CONSTANTS.COLORS.SUCCESS }}
                >
                  <Store />
                </IconButton>
              )}
            </Box>
          </Box>
        </Card>
      ))}
    </Box>

    {/* Action Buttons */}
    <Box display="flex" gap={2} mt={3}>
      <Button 
        variant="contained" 
        startIcon={<Store />}
        onClick={() => window.open('https://printify.com/app/products', '_blank')}
        sx={{ background: UI_CONSTANTS.COLORS.PRIMARY }}
      >
        View in Printify
      </Button>
      <Button 
        variant="outlined" 
        startIcon={<Assessment />}
        onClick={() => window.location.reload()}
      >
        Run Another Batch
      </Button>
    </Box>
  </Box>
);

const AutomationSetup = ({ processedImages, onAutomationComplete }) => {
  const [apiToken, setApiToken] = useState(import.meta.env.VITE_PRINTIFY_API_TOKEN || '');
  const [shopId, setShopId] = useState(import.meta.env.VITE_PRINTIFY_SHOP_ID || '');
  const [selectedProducts, setSelectedProducts] = useState({
    canvas: true,
    poster: true,
    mug: true,
    tshirt: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressDetails, setProgressDetails] = useState('');
  const [results, setResults] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [createdProducts, setCreatedProducts] = useState([]);
  const [currentStep, setCurrentStep] = useState('');
  const [stepProgress, setStepProgress] = useState(0);
  const [realTimeLog, setRealTimeLog] = useState([]);
  const [automationInstance, setAutomationInstance] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canPause, setCanPause] = useState(false);

  const productOptions = [
    { 
      id: 'canvas', 
      name: 'Canvas Prints', 
      profit: '$20-40', 
      volume: 'Medium',
      description: 'Premium wall art with highest margins'
    },
    { 
      id: 'poster', 
      name: 'Premium Posters', 
      profit: '$10-25', 
      volume: 'High',
      description: 'Affordable entry point, good volume'
    },
    { 
      id: 'mug', 
      name: 'Ceramic Mugs', 
      profit: '$8-15', 
      volume: 'Very High',
      description: 'Daily use item, repeat customers'
    },
    { 
      id: 'tshirt', 
      name: 'T-Shirts', 
      profit: '$6-12', 
      volume: 'High',
      description: 'Popular apparel, broad appeal'
    }
  ];

  const handleProductToggle = (productId) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const validateSetup = () => {
    const finalApiToken = apiToken || import.meta.env.VITE_PRINTIFY_API_TOKEN;
    const finalShopId = shopId || import.meta.env.VITE_PRINTIFY_SHOP_ID;
    
    if (!finalApiToken?.trim()) {
      alert('Please add VITE_PRINTIFY_API_TOKEN to your .env file and restart the server');
      return false;
    }
    if (!finalShopId?.trim()) {
      alert('Please add VITE_PRINTIFY_SHOP_ID to your .env file and restart the server');
      return false;
    }
    const hasSelectedProducts = Object.values(selectedProducts).some(selected => selected);
    if (!hasSelectedProducts) {
      alert('Please select at least one product type');
      return false;
    }
    if (processedImages.length === 0) {
      alert('Please generate wave images first');
      return false;
    }
    return true;
  };

  const startAutomation = async () => {
    if (!validateSetup()) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressStatus('Initializing...');
    setProgressDetails('');
    
    try {
      const finalApiToken = apiToken || import.meta.env.VITE_PRINTIFY_API_TOKEN;
      const finalShopId = shopId || import.meta.env.VITE_PRINTIFY_SHOP_ID;
      
      const automation = new PrintifyAutomation(finalApiToken, finalShopId);
      setAutomationInstance(automation);
      const selectedProductTypes = Object.keys(selectedProducts).filter(
        key => selectedProducts[key]
      );

      // Enhanced progress callback to update UI in real-time
      const onProgressUpdate = (progressData) => {
        setProgress(progressData.percentage);
        setProgressStatus(progressData.status);
        setProgressDetails(progressData.details);
        setCurrentStep(progressData.status);
        setStepProgress(progressData.step || 0);
        setIsPaused(progressData.isPaused || false);
        setCanPause(progressData.canPause || false);
        
        // Add to real-time log
        const logEntry = {
          timestamp: new Date().toLocaleTimeString(),
          status: progressData.status,
          details: progressData.details,
          percentage: progressData.percentage
        };
        setRealTimeLog(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
        
        // Track created products
        if (progressData.productCreated) {
          setCreatedProducts(prev => [...prev, progressData.productCreated]);
        }
      };

      // Process all images with selected product types
      const automationResults = await automation.processBatchImages(
        processedImages, 
        selectedProductTypes,
        onProgressUpdate
      );

      setResults(automationResults);
      setSetupComplete(true);
      
      if (onAutomationComplete) {
        onAutomationComplete(automationResults);
      }

    } catch (error) {
      console.error('Automation failed:', error);
      setProgressStatus('Error occurred');
      setProgressDetails(error.message);
      alert(`Automation failed: ${error.message}`);
    } finally {
      // Keep processing state until user sees results
      if (!setupComplete) {
        setIsProcessing(false);
      }
    }
  };

  const calculateEstimatedRevenue = () => {
    const selectedCount = Object.values(selectedProducts).filter(Boolean).length;
    const revenuePerProduct = 25; // Average monthly revenue per product
    return processedImages.length * selectedCount * revenuePerProduct;
  };

  const handlePauseResume = () => {
    if (automationInstance) {
      if (isPaused) {
        automationInstance.resume();
        setIsPaused(false);
      } else {
        automationInstance.pause();
        setIsPaused(true);
      }
    }
  };

  const handleStopAutomation = () => {
    if (automationInstance) {
      automationInstance.stop();
      setIsProcessing(false);
      setProgress(0);
      setProgressStatus('Stopped by user');
    }
  };

  if (setupComplete && results) {
    return <AutomationResults results={results} createdProducts={createdProducts} />;
  }

  return (
    <Box>
      {/* Setup Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ 
          color: UI_CONSTANTS.COLORS.TEXT.PRIMARY,
          fontWeight: 'bold',
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}>
          <AutoAwesome /> Automated Product Creation
        </Typography>
        <Typography variant="body2" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
          Automatically create and publish {processedImages.length} wave art products
        </Typography>
      </Box>

      {/* API Configuration */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" sx={{ 
          color: UI_CONSTANTS.COLORS.TEXT.PRIMARY,
          fontWeight: 'bold',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Settings /> Quick Setup (One-Time Only)
        </Typography>
        
        {/* Only show API inputs if not set in .env */}
        {(!import.meta.env.VITE_PRINTIFY_API_TOKEN || !import.meta.env.VITE_PRINTIFY_SHOP_ID) && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Printify API Token"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Get from printify.com → Account → API"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: UI_CONSTANTS.COLORS.SECONDARY }
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Shop ID"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              placeholder="Find in Printify → My Stores"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: UI_CONSTANTS.COLORS.SECONDARY }
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-input': { color: 'white' }
              }}
            />
          </Grid>
        </Grid>
        )}

        {(import.meta.env.VITE_PRINTIFY_API_TOKEN && import.meta.env.VITE_PRINTIFY_SHOP_ID) ? (
          <Alert severity="success" sx={{ mt: 2, backgroundColor: 'rgba(22, 163, 74, 0.1)' }}>
            <strong>✅ Ready for Real Automation:</strong> API credentials loaded. This will create actual products in your Printify account and publish to Shopify.
            <br/>
            <small>Make sure your backend server is running on port 3001</small>
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mt: 2, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <strong>⚠️ Setup Required:</strong> Add your credentials to .env file:
            <br/>
            <code style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '4px' }}>
              VITE_PRINTIFY_API_TOKEN=your_token_here<br/>
              VITE_PRINTIFY_SHOP_ID=your_shop_id_here
            </code>
            <br/>
            Then restart your dev server with <strong>npm run dev</strong>
          </Alert>
        )}
      </Card>

      {/* Product Selection */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" sx={{ 
          color: UI_CONSTANTS.COLORS.TEXT.PRIMARY,
          fontWeight: 'bold',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Store /> Select Products to Create ({processedImages.length} images each)
        </Typography>

        <Grid container spacing={2}>
          {productOptions.map((product) => (
            <Grid item xs={12} sm={6} key={product.id}>
              <MuiCard sx={{ 
                background: selectedProducts[product.id] 
                  ? 'rgba(22, 163, 74, 0.15)' 
                  : 'rgba(51, 65, 85, 0.5)',
                border: selectedProducts[product.id]
                  ? `2px solid ${UI_CONSTANTS.COLORS.SUCCESS}`
                  : '1px solid rgba(148, 163, 184, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleProductToggle(product.id)}
              >
                <CardContent sx={{ p: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedProducts[product.id]}
                        onChange={() => handleProductToggle(product.id)}
                        sx={{ color: UI_CONSTANTS.COLORS.SUCCESS }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ 
                          color: UI_CONSTANTS.COLORS.TEXT.PRIMARY,
                          fontWeight: 'bold'
                        }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: UI_CONSTANTS.COLORS.TEXT.SECONDARY,
                          display: 'block'
                        }}>
                          {product.description}
                        </Typography>
                        <Box display="flex" gap={2} mt={1}>
                          <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.SUCCESS }}>
                            Profit: {product.profit}
                          </Typography>
                          <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.SECONDARY }}>
                            Volume: {product.volume}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </CardContent>
              </MuiCard>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* Revenue Projection */}
      <Card sx={{ mb: 3, p: 3, background: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.3)' }}>
        <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
          <Typography variant="h6" sx={{ 
            color: UI_CONSTANTS.COLORS.TEXT.PRIMARY,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <TrendingUp /> Automation Results Preview
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="body1" sx={{ color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, mb: 1 }}>
              <strong>Products to Create:</strong> {processedImages.length * Object.values(selectedProducts).filter(Boolean).length} total products
            </Typography>
            <Typography variant="body1" sx={{ color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, mb: 1 }}>
              <strong>Estimated Time:</strong> {Math.round((processedImages.length * Object.values(selectedProducts).filter(Boolean).length) / 10)} minutes
            </Typography>
            <Typography variant="body1" sx={{ color: UI_CONSTANTS.COLORS.TEXT.PRIMARY }}>
              <strong>Auto-Generated:</strong> SEO titles, descriptions, pricing, tags, and publishing
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                color: UI_CONSTANTS.COLORS.SUCCESS,
                fontWeight: 'bold'
              }}>
                {formatCurrency(calculateEstimatedRevenue())}
              </Typography>
              <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
                Estimated Monthly Revenue
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <Card sx={{ mb: 3, p: 3, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <Typography variant="h6" sx={{ 
            color: UI_CONSTANTS.COLORS.TEXT.PRIMARY,
            fontWeight: 'bold',
            mb: 1
          }}>
            🚀 {progressStatus} ({progress}%)
          </Typography>
          
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 10,
              borderRadius: 5,
              mb: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': { 
                background: `linear-gradient(45deg, ${UI_CONSTANTS.COLORS.SUCCESS}, ${UI_CONSTANTS.COLORS.PRIMARY})`,
                borderRadius: 5
              }
            }}
          />
          
          <Typography variant="body1" sx={{ 
            color: UI_CONSTANTS.COLORS.TEXT.PRIMARY,
            fontWeight: '500',
            mb: 1
          }}>
            {progressDetails}
          </Typography>
          
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY, flex: 1 }}>
              {progress < 20 ? '🔄 Uploading wave art images to Printify servers...' :
               progress < 60 ? '⚙️ Creating products with SEO-optimized titles and descriptions...' :
               progress < 90 ? '💰 Setting premium pricing and publishing to Shopify...' :
               '✨ Finalizing SEO settings and inventory management...'}
            </Typography>
            
            {/* Pause/Resume/Stop Controls */}
            {canPause && (
              <Box display="flex" gap={1} ml={2}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handlePauseResume}
                  startIcon={isPaused ? <PlayArrow /> : <Pause />}
                  sx={{ fontSize: '0.7rem', py: 0.5, px: 1 }}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleStopAutomation}
                  startIcon={<Stop />}
                  color="error"
                  sx={{ fontSize: '0.7rem', py: 0.5, px: 1 }}
                >
                  Stop
                </Button>
              </Box>
            )}
          </Box>

          {/* Real-time Activity Log */}
          {realTimeLog.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                📋 Real-time Activity Log
              </Typography>
              <Box sx={{ 
                maxHeight: '150px', 
                overflow: 'auto', 
                background: 'rgba(0,0,0,0.1)', 
                borderRadius: 1, 
                p: 1 
              }}>
                {realTimeLog.map((log, index) => (
                  <Typography key={index} variant="caption" sx={{ 
                    display: 'block', 
                    mb: 0.5,
                    color: UI_CONSTANTS.COLORS.TEXT.SECONDARY,
                    fontFamily: 'monospace'
                  }}>
                    [{log.timestamp}] {log.status}: {log.details}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {/* Created Products Counter */}
          {createdProducts.length > 0 && (
            <Box sx={{ mt: 2, p: 2, background: 'rgba(22, 163, 74, 0.1)', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: UI_CONSTANTS.COLORS.SUCCESS }}>
                ✅ {createdProducts.length} Products Created Successfully
              </Typography>
              <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
                Latest: {createdProducts[createdProducts.length - 1]?.title?.slice(0, 40)}...
              </Typography>
            </Box>
          )}
        </Card>
      )}

      {/* Start Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<RocketLaunch />}
        onClick={startAutomation}
        disabled={isProcessing || processedImages.length === 0}
        sx={{
          background: `linear-gradient(45deg, ${UI_CONSTANTS.COLORS.SUCCESS}, ${UI_CONSTANTS.COLORS.PRIMARY})`,
          py: 2,
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}
      >
        {isProcessing ? 'Creating Products...' : `🚀 Auto-Create ${processedImages.length * Object.values(selectedProducts).filter(Boolean).length} Products`}
      </Button>
    </Box>
  );
};


export default AutomationSetup;