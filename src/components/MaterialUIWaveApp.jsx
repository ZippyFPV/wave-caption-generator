import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Link,
  Box,
  Container,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ArrowBack,
  Close,
  Download,
  Add,
  PhotoLibrary,
  Assessment,
  TrendingUp,
  Refresh,
  PlayArrow,
  CheckCircle,
  Delete,
  DeleteSweep,
  Check,
  ExpandMore,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';

import { useImageProcessing } from '../hooks/useImageProcessing';
import { BUSINESS_METRICS } from '../config/constants.js';

const MaterialUIWaveApp = () => {
  const {
    processedImages,
    loading,
    error,
    apiKey,
    fetchImages,
    downloadAllImages,
    deleteImages,
    deleteDuplicates,
    CONTENT_THEMES
  } = useImageProcessing();

  const [generateDialog, setGenerateDialog] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [batchStartCount, setBatchStartCount] = useState(0);
  const [selectedImageForPreview, setSelectedImageForPreview] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(null); // 'batch', 'duplicates', or null
  const [analyticsDialog, setAnalyticsDialog] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [listingsDialog, setListingsDialog] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState('recent'); // 'recent', 'all', or null

  // Track recently added images - simpler approach
  useEffect(() => {
    if (processedImages.length > batchStartCount) {
      const newImagesInBatch = processedImages.slice(batchStartCount);
      setRecentlyAdded(newImagesInBatch);
    }
  }, [processedImages, batchStartCount]);

  // Keyboard navigation for galleries
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return; // Don't interfere with form inputs
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (expandedAccordion === 'all') {
            setExpandedAccordion('recent');
          } else if (expandedAccordion === 'recent' && recentlyAdded.length > 0) {
            // Stay on recent if it exists, otherwise go to all
            setExpandedAccordion('recent');
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (expandedAccordion === 'recent') {
            setExpandedAccordion('all');
          } else if (expandedAccordion === 'all') {
            // Stay on all if already there
            setExpandedAccordion('all');
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          // Collapse current accordion
          if (expandedAccordion) {
            setExpandedAccordion(null);
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          // Expand first available accordion
          if (!expandedAccordion) {
            if (recentlyAdded.length > 0) {
              setExpandedAccordion('recent');
            } else {
              setExpandedAccordion('all');
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedAccordion, recentlyAdded.length]);

  const handleGenerateImages = async (quantity) => {
    setGenerateDialog(false);
    // Mark the start of a new batch
    setBatchStartCount(processedImages.length);
    setRecentlyAdded([]); // Clear previous batch
    await fetchImages(true, quantity, selectedTheme);
  };

  const handleDeleteRecentBatch = () => {
    setDeleteConfirmDialog('batch');
  };

  const handleDeleteDuplicates = () => {
    setDeleteConfirmDialog('duplicates');
  };

  const [deleteStats, setDeleteStats] = useState(null);

  const confirmDelete = () => {
    if (deleteConfirmDialog === 'batch') {
      // Delete recently added images
      const deleteCount = recentlyAdded.length;
      const recentIds = recentlyAdded.map(img => img.id);
      deleteImages(recentIds);
      setRecentlyAdded([]);
      setBatchStartCount(processedImages.length - recentlyAdded.length);
      
      // Show success message
      setDeleteStats({
        type: 'batch',
        count: deleteCount,
        message: `Successfully deleted ${deleteCount} images from recent batch`
      });
    } else if (deleteConfirmDialog === 'duplicates') {
      // Calculate duplicates before deletion
      const uniqueImages = [];
      const seenCaptions = new Set();
      let duplicateCount = 0;
      
      processedImages.forEach(image => {
        const normalizedCaption = image.caption.toLowerCase().trim();
        if (!seenCaptions.has(normalizedCaption)) {
          seenCaptions.add(normalizedCaption);
          uniqueImages.push(image);
        } else {
          duplicateCount++;
        }
      });
      
      if (duplicateCount > 0) {
        // Delete duplicate images
        deleteDuplicates();
        // Update recently added to exclude deleted duplicates
        const remainingRecent = recentlyAdded.filter(recent => 
          uniqueImages.some(img => img.id === recent.id)
        );
        setRecentlyAdded(remainingRecent);
        
        setDeleteStats({
          type: 'duplicates',
          count: duplicateCount,
          message: `Successfully removed ${duplicateCount} duplicate images`
        });
      } else {
        setDeleteStats({
          type: 'duplicates',
          count: 0,
          message: 'No duplicate images found to delete'
        });
      }
    }
    setDeleteConfirmDialog(null);
  };

  const handleCreateListings = async (productTypes) => {
    setListingsDialog(false);
    
    try {
      // TODO: Integrate with PrintifyAutomation
      console.log('Creating listings for product types:', productTypes);
      console.log('Images to process:', processedImages.length);
      
      // Show success message
      setDeleteStats({
        type: 'listings',
        count: processedImages.length * productTypes.length,
        message: `Started creating ${processedImages.length * productTypes.length} listings. Check console for progress.`
      });
      
      // Clear image cache after successful listing creation
      // Uncomment when Printify integration is complete:
      // await clearImageCache();
      // setProcessedImages([]);
      // setRecentlyAdded([]);
      
    } catch (error) {
      setDeleteStats({
        type: 'error',
        count: 0,
        message: `Failed to create listings: ${error.message}`
      });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Material UI Header matching the reference design */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'primary.main',
          boxShadow: 'none'
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {/* Back Button */}
          <Button
            variant="outlined"
            size="small" 
            color="inherit"
            startIcon={<ArrowBack />}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Back to product page
          </Button>

          {/* Logo/Brand Area */}
          <Link
            href="/"
            underline="none"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'white'
            }}
          >
            <svg width="96" height="33" viewBox="0 0 96 33" fill="none">
              <path 
                d="M25.83 21.8a.83.83 0 0 0 .42-.72l.01-4.82a.83.83 0 0 1 .42-.72l2.62-1.5a.83.83 0 0 1 1.24.72v8.76a.83.83 0 0 1-.41.73l-9.87 5.66a.83.83 0 0 1-.83 0L11.7 25.5a.83.83 0 0 1-.42-.73v-4.42h.01l.01-.01v-.01l6.38-3.67V12.3a.83.83 0 0 0-1.25-.73l-4.74 2.74a.83.83 0 0 1-.83 0L6.1 11.57a.83.83 0 0 0-1.25.72v7.83a.83.83 0 0 1-1.25.73L.96 19.34a.83.83 0 0 1-.42-.73L.57 4.92a.83.83 0 0 1 1.25-.72l9.03 5.2a.83.83 0 0 0 .83 0l9.04-5.2a.83.83 0 0 1 1.25.72v13.7a.83.83 0 0 1-.42.72l-4.73 2.73a.83.83 0 0 0 0 1.44L19.43 25a.83.83 0 0 0 .83 0l5.57-3.2Z" 
                fill="#007FFF"
              />
              <path 
                d="M89.66 24.18c-1.6 0-2.9-.5-3.88-1.52a5.63 5.63 0 0 1-1.46-4.04c0-1.59.5-2.9 1.5-3.94a5.05 5.05 0 0 1 3.8-1.56c1.69 0 3.03.6 4.02 1.8a5.42 5.42 0 0 1 1.1 4.42h-7.58c.18 1.8 1 2.7 2.44 2.7 1.24 0 2.02-.55 2.36-1.66h2.76a4.78 4.78 0 0 1-1.78 2.82c-.88.65-1.98.98-3.28.98Z" 
                fill="#fff"
              />
            </svg>
          </Link>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Title */}
          <Typography 
            variant="h6" 
            component="h1"
            sx={{ 
              color: 'white',
              fontWeight: 600,
              textAlign: 'center',
              flex: 1
            }}
          >
            Preview WaveCommerce AI - Massive Caption Generator
          </Typography>

          {/* Action Buttons */}
          <Button
            variant="contained"
            color="secondary"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
            onClick={() => setGenerateDialog(true)}
          >
            Generate Now
          </Button>

          <Button
            variant="text"
            size="small"
            endIcon={<Close />}
            sx={{ 
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Remove frame
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content Area - much tighter spacing */}
      <Box sx={{ 
        minHeight: 'calc(100vh - 64px)',
        bgcolor: 'background.default',
        p: 0
      }}>
        <Container maxWidth="xl" sx={{ py: 1, px: 2 }}>
          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 1, py: 1 }}>
              {error}
            </Alert>
          )}

          {/* Stats Cards - Much tighter spacing */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center', py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                  <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    2B+
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Variations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center', py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    15
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Personas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center', py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                  <Typography variant="h5" color="warning.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {processedImages.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Generated
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center', py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                  <Typography variant="h5" color="error.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    100%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Unique
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Main Content Grid - Much tighter */}
          <Grid container spacing={2}>
            {/* Left Panel - Controls */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  Massive Variation System
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  Generate unlimited unique wave art variations with mathematical precision.
                  Combines 26 water elements × 120+ actions × 50+ emotional states × 18 personas.
                </Typography>

                {/* Theme Selection */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Content Theme
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip
                      label="All Themes"
                      size="small"
                      color={selectedTheme === null ? 'primary' : 'default'}
                      variant={selectedTheme === null ? 'filled' : 'outlined'}
                      onClick={() => setSelectedTheme(null)}
                      sx={{ fontSize: '0.7rem' }}
                    />
                    {Object.entries(CONTENT_THEMES || {}).map(([themeKey, theme]) => (
                      <Chip
                        key={themeKey}
                        label={theme.name}
                        size="small"
                        color={selectedTheme === themeKey ? 'primary' : 'default'}
                        variant={selectedTheme === themeKey ? 'filled' : 'outlined'}
                        onClick={() => setSelectedTheme(themeKey)}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                  {selectedTheme && CONTENT_THEMES && CONTENT_THEMES[selectedTheme] && (
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      display: 'block', 
                      mt: 0.5, 
                      fontSize: '0.65rem',
                      fontStyle: 'italic'
                    }}>
                      {CONTENT_THEMES[selectedTheme].description}
                    </Typography>
                  )}
                </Box>

                {!apiKey ? (
                  <Alert severity="warning" sx={{ mb: 1, py: 0.5, px: 1 }}>
                    <Typography variant="caption">
                      <strong>API Required:</strong> Add Pexels API key to .env
                    </Typography>
                  </Alert>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 1,
                    p: 0.5,
                    bgcolor: 'success.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'success.200'
                  }}>
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                      API Connected
                    </Typography>
                  </Box>
                )}

                {loading && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                      Generating {processedImages.length}/20 variations...
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(processedImages.length / 20) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setGenerateDialog(true)}
                    disabled={loading || !apiKey}
                    sx={{ flex: 1 }}
                  >
                    Generate Batch
                  </Button>
                  
                  {processedImages.length > 0 && (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={downloadAllImages}
                        sx={{ flex: 1 }}
                      >
                        Download All
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<TrendingUp />}
                        onClick={() => setListingsDialog(true)}
                        sx={{ flex: 1 }}
                      >
                        Create Listings
                      </Button>
                    </>
                  )}
                </Box>

                {/* Real Persona Distribution */}
                {processedImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.8rem' }}>
                      Persona Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(() => {
                        // Calculate real persona distribution from generated images
                        const personaCounts = {};
                        processedImages.forEach(image => {
                          if (image.metadata?.persona) {
                            const persona = image.metadata.persona;
                            personaCounts[persona] = (personaCounts[persona] || 0) + 1;
                          }
                        });
                        
                        return Object.entries(personaCounts)
                          .sort(([,a], [,b]) => b - a) // Sort by count descending
                          .map(([persona, count]) => (
                            <Chip 
                              key={persona}
                              label={`${persona.replace(/_/g, ' ').slice(0, 12)}... (${count})`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ));
                      })()}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Right Panel - Accordion Image Galleries */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 2, minHeight: 400 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Image Galleries ({processedImages.length} total)
                  </Typography>
                  
                  {processedImages.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Delete Duplicates">
                        <IconButton size="small" onClick={handleDeleteDuplicates}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                      {recentlyAdded.length > 0 && (
                        <Tooltip title="Delete Recent Batch">
                          <IconButton size="small" onClick={handleDeleteRecentBatch}>
                            <DeleteSweep />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View Analytics">
                        <IconButton size="small" onClick={() => setAnalyticsDialog(true)}>
                          <Assessment />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>

                {/* Keyboard Navigation Hint */}
                {processedImages.length > 0 && (
                  <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
                    <Typography variant="caption">
                      💡 Keyboard navigation: ← → to switch accordion galleries, ↑ ↓ to collapse/expand
                    </Typography>
                  </Alert>
                )}

                {/* Recently Added Accordion */}
                {recentlyAdded.length > 0 && (
                  <Accordion 
                    expanded={expandedAccordion === 'recent'} 
                    onChange={() => setExpandedAccordion(expandedAccordion === 'recent' ? null : 'recent')}
                    sx={{ mb: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{ 
                        bgcolor: 'primary.50',
                        '&:hover': { bgcolor: 'primary.100' },
                        minHeight: 48,
                        '& .MuiAccordionSummary-content': { alignItems: 'center' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <KeyboardArrowLeft sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600 }}>
                          Recently Added ({recentlyAdded.length}) {loading && '- Generating...'}
                        </Typography>
                        <KeyboardArrowRight sx={{ color: 'primary.main', fontSize: 20 }} />
                      </Box>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        startIcon={<Delete />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecentBatch();
                        }}
                        sx={{ py: 0.25, px: 1, mr: 1 }}
                      >
                        Delete Batch
                      </Button>
                    </AccordionSummary>
                    
                    <AccordionDetails sx={{ pt: 2 }}>
                    
                    {/* Horizontal scrolling container for side-by-side new images */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      pb: 1,
                      minHeight: 220, // Ensure container has height
                      '&::-webkit-scrollbar': {
                        height: 6,
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: 'grey.100',
                        borderRadius: 3,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'primary.main',
                        borderRadius: 3,
                      }
                    }}>
                      {recentlyAdded.map((image) => (
                        <Box 
                          key={`recent-${image.id}`} 
                          sx={{ 
                            flexShrink: 0, 
                            width: 180,
                            minWidth: 180,
                            maxWidth: 180
                          }}
                        >
                          <Card 
                            elevation={2}
                            sx={{ 
                              transition: 'all 0.2s',
                              border: '2px solid',
                              borderColor: 'primary.main',
                              cursor: 'pointer',
                              '&:hover': {
                                elevation: 4,
                                transform: 'translateY(-2px)'
                              }
                            }}
                            onClick={() => setSelectedImageForPreview(image)}
                          >
                            <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                              <img
                                src={image.processed}
                                alt={image.caption}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                              <Box sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'primary.main',
                                color: 'white',
                                borderRadius: 1,
                                px: 0.5,
                                py: 0.25
                              }}>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                  NEW
                                </Typography>
                              </Box>
                            </Box>
                            <CardContent sx={{ p: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ 
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.75rem'
                              }}>
                                {image.caption}
                              </Typography>
                              {image.metadata && (
                                <Typography variant="caption" color="primary.main" sx={{ 
                                  display: 'block',
                                  fontSize: '0.7rem'
                                }}>
                                  {image.metadata.persona?.replace(/_/g, ' ').slice(0, 12)}... • {image.metadata.estimatedConversion}%
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Box>
                      ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* All Images Section */}

                {processedImages.length === 0 && !loading ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 2
                  }}>
                    <PhotoLibrary sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No variations generated yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Click "Generate Batch" to create unique wave art variations
                    </Typography>
                    <Button 
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => setGenerateDialog(true)}
                      disabled={!apiKey}
                    >
                      Start Generating
                    </Button>
                  </Box>
                ) : (
                  <>
                    {/* All Images Accordion - Excluding recently added ones */}
                    {processedImages.length > recentlyAdded.length && (
                      <Accordion 
                        expanded={expandedAccordion === 'all'} 
                        onChange={() => setExpandedAccordion(expandedAccordion === 'all' ? null : 'all')}
                        sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore />}
                          sx={{ 
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            minHeight: 48,
                            '& .MuiAccordionSummary-content': { alignItems: 'center' }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <KeyboardArrowLeft sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              All Images ({processedImages.length - recentlyAdded.length})
                            </Typography>
                            <KeyboardArrowRight sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </Box>
                        </AccordionSummary>
                        
                        <AccordionDetails sx={{ pt: 2 }}>
                          <Grid container spacing={1}>
                            {processedImages
                              .filter(img => !recentlyAdded.some(recent => recent.id === img.id))
                              .map((image, index) => (
                              <Grid item xs={6} sm={4} md={3} key={image.id}>
                                <Card 
                                  elevation={1}
                                  sx={{ 
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      elevation: 3,
                                      transform: 'translateY(-1px)'
                                    }
                                  }}
                                  onClick={() => setSelectedImageForPreview(image)}
                                >
                                  <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                                    <img
                                      src={image.processed}
                                      alt={image.caption}
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                    <Box sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 4,
                                      bgcolor: 'rgba(0,0,0,0.6)',
                                      color: 'white',
                                      borderRadius: 1,
                                      px: 0.5,
                                      py: 0.25
                                    }}>
                                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                        #{index + recentlyAdded.length + 1}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <CardContent sx={{ p: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ 
                                      display: 'block',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      fontSize: '0.75rem'
                                    }}>
                                      {image.caption}
                                    </Typography>
                                    {image.metadata && (
                                      <Typography variant="caption" color="text.secondary" sx={{ 
                                        display: 'block',
                                        fontSize: '0.7rem'
                                      }}>
                                        {image.metadata.persona?.replace(/_/g, ' ').slice(0, 12)}...
                                      </Typography>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    )}
                    
                    {/* Live Loading placeholders - show real-time generation */}
                    {loading && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Generating new images...
                        </Typography>
                        <Grid container spacing={1}>
                          {Array.from({ length: 3 }).map((_, index) => (
                            <Grid item xs={6} sm={4} md={3} key={`loading-${index}`}>
                              <Card elevation={1} sx={{ border: '1px dashed', borderColor: 'primary.main' }}>
                                <Box sx={{ 
                                  paddingTop: '75%',
                                  bgcolor: 'grey.50',
                                  position: 'relative'
                                }}>
                                  <Box sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                  }}>
                                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                                      Creating...
                                    </Typography>
                                  </Box>
                                </Box>
                                <CardContent sx={{ p: 1 }}>
                                  <Box sx={{ height: 20, bgcolor: 'grey.100', borderRadius: 0.5, mb: 0.5 }} />
                                  <Box sx={{ height: 12, bgcolor: 'grey.100', borderRadius: 0.5, width: '70%' }} />
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Generation Dialog */}
      <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Generate Massive Variations
          {selectedTheme && CONTENT_THEMES && CONTENT_THEMES[selectedTheme] && (
            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 'normal' }}>
              Theme: {CONTENT_THEMES[selectedTheme].name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Choose quantity for your unique wave art collection. Each image is guaranteed to be mathematically unique.
            {selectedTheme && CONTENT_THEMES && CONTENT_THEMES[selectedTheme] && (
              <><br /><strong>Selected Theme:</strong> {CONTENT_THEMES[selectedTheme].description}</>
            )}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleGenerateImages(5)}
                sx={{ py: 2, flexDirection: 'column' }}
              >
                <Typography variant="h6">5</Typography>
                <Typography variant="caption">Quick Test</Typography>
              </Button>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleGenerateImages(20)}
                sx={{ py: 2, flexDirection: 'column' }}
              >
                <Typography variant="h6">20</Typography>
                <Typography variant="caption">Standard Batch</Typography>
              </Button>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleGenerateImages(100)}
                sx={{ py: 2, flexDirection: 'column' }}
              >
                <Typography variant="h6">100</Typography>
                <Typography variant="caption">Large Collection</Typography>
              </Button>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleGenerateImages(1000)}
                sx={{ py: 2, flexDirection: 'column' }}
              >
                <Typography variant="h6">1000</Typography>
                <Typography variant="caption">Mega Batch</Typography>
              </Button>
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Each variation is mathematically unique with persona targeting and SEO optimization.
              Larger batches take more time but provide better market coverage.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!deleteConfirmDialog} 
        onClose={() => setDeleteConfirmDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Delete color="error" />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          {deleteConfirmDialog === 'batch' && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to delete the recent batch of <strong>{recentlyAdded.length} images</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This will permanently remove these images from your collection. This action cannot be undone.
              </Typography>
            </Box>
          )}
          
          {deleteConfirmDialog === 'duplicates' && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to delete duplicate images?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This will scan all images and remove any with identical captions, keeping only the first occurrence. This action cannot be undone.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteConfirmDialog(null)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            sx={{ ml: 1 }}
          >
            {deleteConfirmDialog === 'batch' ? `Delete ${recentlyAdded.length} Images` : 'Delete Duplicates'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog 
        open={analyticsDialog} 
        onClose={() => setAnalyticsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment color="primary" />
          Collection Analytics
        </DialogTitle>
        <DialogContent>
          {(() => {
            // Calculate comprehensive analytics
            const totalImages = processedImages.length;
            const personaCounts = {};
            const seasonCounts = {};
            let totalConversion = 0;
            let captionLengthSum = 0;
            
            processedImages.forEach(image => {
              if (image.metadata?.persona) {
                personaCounts[image.metadata.persona] = (personaCounts[image.metadata.persona] || 0) + 1;
              }
              if (image.metadata?.season) {
                seasonCounts[image.metadata.season] = (seasonCounts[image.metadata.season] || 0) + 1;
              }
              if (image.metadata?.estimatedConversion) {
                totalConversion += image.metadata.estimatedConversion;
              }
              if (image.caption) {
                captionLengthSum += image.caption.length;
              }
            });
            
            const avgConversion = totalImages > 0 ? (totalConversion / totalImages).toFixed(1) : 0;
            const avgCaptionLength = totalImages > 0 ? Math.round(captionLengthSum / totalImages) : 0;
            
            return (
              <Grid container spacing={2}>
                {/* Overview Stats */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Overview</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main">{totalImages}</Typography>
                        <Typography variant="caption">Total Images</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">{avgConversion}%</Typography>
                        <Typography variant="caption">Avg Conversion</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">{Object.keys(personaCounts).length}</Typography>
                        <Typography variant="caption">Personas Used</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">{avgCaptionLength}</Typography>
                        <Typography variant="caption">Avg Caption Length</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
                
                {/* Persona Distribution */}
                <Grid item xs={6}>
                  <Typography variant="h6" gutterBottom>Persona Distribution</Typography>
                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {Object.entries(personaCounts)
                      .sort(([,a], [,b]) => b - a)
                      .map(([persona, count]) => (
                        <Box key={persona} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2">{persona.replace(/_/g, ' ')}</Typography>
                          <Chip size="small" label={count} color="primary" />
                        </Box>
                      ))}
                  </Box>
                </Grid>
                
                {/* Season Distribution */}
                <Grid item xs={6}>
                  <Typography variant="h6" gutterBottom>Season Distribution</Typography>
                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {Object.entries(seasonCounts)
                      .sort(([,a], [,b]) => b - a)
                      .map(([season, count]) => (
                        <Box key={season} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2">{season.charAt(0).toUpperCase() + season.slice(1)}</Typography>
                          <Chip size="small" label={count} color="secondary" />
                        </Box>
                      ))}
                  </Box>
                </Grid>
                
                {/* Recommendations */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Recommendations</Typography>
                  <Box sx={{ bgcolor: 'info.50', p: 2, borderRadius: 1 }}>
                    {totalImages === 0 && (
                      <Typography variant="body2">Generate some images to see analytics!</Typography>
                    )}
                    {totalImages > 0 && avgConversion < 10 && (
                      <Typography variant="body2">💡 Try focusing on WELLNESS_SEEKER and HOME_DECORATOR personas for higher conversion rates.</Typography>
                    )}
                    {totalImages > 0 && Object.keys(personaCounts).length < 5 && (
                      <Typography variant="body2">🎯 Consider generating more diverse persona content for broader market appeal.</Typography>
                    )}
                    {totalImages >= 20 && (
                      <Typography variant="body2">🚀 Great collection! You have enough variety for a strong product launch.</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog 
        open={!!selectedImageForPreview} 
        onClose={() => setSelectedImageForPreview(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'black',
            color: 'white'
          }
        }}
      >
        {selectedImageForPreview && (
          <>
            <DialogTitle sx={{ 
              bgcolor: 'rgba(0,0,0,0.9)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">
                Image Preview
              </Typography>
              <IconButton 
                onClick={() => setSelectedImageForPreview(null)}
                sx={{ color: 'white' }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                <img
                  src={selectedImageForPreview.processed}
                  alt={selectedImageForPreview.caption}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ 
              bgcolor: 'rgba(0,0,0,0.9)',
              color: 'white',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 1
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ color: 'white', mb: 0.5 }}>
                    {selectedImageForPreview.caption}
                  </Typography>
                  {selectedImageForPreview.metadata && (
                    <Typography variant="body2" sx={{ color: 'grey.400' }}>
                      Persona: {selectedImageForPreview.metadata.persona?.replace(/_/g, ' ')} • 
                      Conversion: {selectedImageForPreview.metadata.estimatedConversion}% • 
                      Size: {selectedImageForPreview.width}×{selectedImageForPreview.height}
                    </Typography>
                  )}
                  {selectedImageForPreview.title && (
                    <Typography variant="body2" sx={{ color: 'grey.300', mt: 0.5 }}>
                      Title: {selectedImageForPreview.title}
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = `${selectedImageForPreview.filename || 'wave-art'}.jpg`;
                      link.href = selectedImageForPreview.processed;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    sx={{ 
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Download
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    onClick={() => setSelectedImageForPreview(null)}
                    sx={{ 
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': { 
                        borderColor: 'grey.300',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Printify Listings Dialog */}
      <Dialog 
        open={listingsDialog} 
        onClose={() => setListingsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp color="success" />
          Create Printify Listings
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Create automated Printify products from your {processedImages.length} generated images.
            This will upload images and create listings with SEO-optimized titles and descriptions.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> After successful listing creation, processed images will be automatically 
              cleared from cache to optimize storage and performance.
            </Typography>
          </Alert>
          
          <Typography variant="h6" gutterBottom>Select Product Types:</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleCreateListings(['canvas'])}
                sx={{ py: 2, flexDirection: 'column' }}
              >
                <Typography variant="h6">Canvas</Typography>
                <Typography variant="caption">$12.34 profit/sale</Typography>
              </Button>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleCreateListings(['poster'])}
                sx={{ py: 2, flexDirection: 'column' }}
              >
                <Typography variant="h6">Poster</Typography>
                <Typography variant="caption">$8.50 profit/sale</Typography>
              </Button>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleCreateListings(['mug'])}
                sx={{ py: 2, flexDirection: 'column' }}
              >
                <Typography variant="h6">Mug</Typography>
                <Typography variant="caption">$6.75 profit/sale</Typography>
              </Button>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => handleCreateListings(['canvas', 'poster', 'mug'])}
                sx={{ py: 2, flexDirection: 'column' }}
              >
                <Typography variant="h6">All Types</Typography>
                <Typography variant="caption">Max profit</Typography>
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setListingsDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Success Message */}
      <Snackbar
        open={!!deleteStats}
        autoHideDuration={4000}
        onClose={() => setDeleteStats(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setDeleteStats(null)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {deleteStats?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MaterialUIWaveApp;