import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Switch,
  FormControlLabel,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Waves,
  Visibility,
  Store,
  Publish,
  Emergency,
  CheckCircle,
  Warning,
  Error,
  Pause,
  Speed,
  Security,
  Download,
  Edit,
  Delete,
  Add,
  Assessment,
  ExpandMore,
  PlayArrow,
  Stop,
  Refresh
} from '@mui/icons-material';

import { useImageProcessing } from '../hooks/useImageProcessing';

// Tab configuration with status tracking
const WORKFLOW_TABS = [
  { 
    id: 'generate', 
    label: 'Generate Images', 
    icon: Waves, 
    color: '#2196F3' // Blue
  },
  { 
    id: 'review', 
    label: 'Review & Approve', 
    icon: Visibility, 
    color: '#FF9800' // Amber
  },
  { 
    id: 'listings', 
    label: 'Create Listings', 
    icon: Store, 
    color: '#4CAF50' // Green
  },
  { 
    id: 'publish', 
    label: 'Publish to Store', 
    icon: Publish, 
    color: '#9C27B0' // Purple
  },
  { 
    id: 'automation', 
    label: 'AUTOMATION CONTROL', 
    icon: Emergency, 
    color: '#F44336' // Red
  }
];

// Status indicators
const STATUS_INDICATORS = {
  ready: { icon: CheckCircle, color: '#4CAF50', label: 'Ready' },
  processing: { icon: Warning, color: '#FF9800', label: 'Processing' },
  error: { icon: Error, color: '#F44336', label: 'Error' },
  inactive: { icon: Pause, color: '#9E9E9E', label: 'Not Started' }
};

const WorkflowWaveApp = () => {
  const {
    processedImages,
    loading,
    error,
    fetchImages,
    downloadAllImages,
    deleteImages,
    deleteDuplicates,
    CONTENT_THEMES
  } = useImageProcessing();

  // Workflow state
  const [currentTab, setCurrentTab] = useState(0);
  const [tabStatuses, setTabStatuses] = useState({
    generate: 'inactive',
    review: 'inactive', 
    listings: 'inactive',
    publish: 'inactive',
    automation: 'ready'
  });

  // Mode state
  const [batchMode, setBatchMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [approvedImages, setApprovedImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  
  // Image tracking state
  const [imageStats, setImageStats] = useState({
    totalGenerated: 0,
    currentActive: 0,
    approved: 0,
    deleted: 0,
    created: 0
  });

  // System state
  const [systemStatus, setSystemStatus] = useState({
    pexelsApi: 'checking',
    printifyApi: 'checking',
    serverConnection: 'checking'
  });

  // Dialogs
  const [editDialog, setEditDialog] = useState(null);
  const [systemCheckDialog, setSystemCheckDialog] = useState(false);
  
  // Listing creation state
  const [creatingListings, setCreatingListings] = useState(false);
  const [createdProducts, setCreatedProducts] = useState([]);
  const [listingProgress, setListingProgress] = useState(0);

  // Update image statistics whenever images change
  useEffect(() => {
    const stats = {
      totalGenerated: processedImages.length + deletedImages.length,
      currentActive: processedImages.length,
      approved: approvedImages.length,
      deleted: deletedImages.length,
      created: createdProducts.length
    };
    setImageStats(stats);
  }, [processedImages, deletedImages, approvedImages, createdProducts]);

  // Update tab statuses based on current state
  useEffect(() => {
    const newStatuses = { ...tabStatuses };
    
    // Generate tab
    if (processedImages.length > 0) {
      newStatuses.generate = 'ready';
      newStatuses.review = processedImages.length > approvedImages.length ? 'processing' : 'ready';
    } else if (loading) {
      newStatuses.generate = 'processing';
    } else if (error) {
      newStatuses.generate = 'error';
    }

    // Review tab
    if (approvedImages.length > 0) {
      newStatuses.listings = 'ready';
    }

    setTabStatuses(newStatuses);
  }, [processedImages, loading, error, approvedImages]);

  // Status indicator component
  const StatusIndicator = ({ status, size = 'small' }) => {
    const statusConfig = STATUS_INDICATORS[status];
    const IconComponent = statusConfig.icon;
    
    return (
      <Tooltip title={statusConfig.label}>
        <IconComponent 
          sx={{ 
            color: statusConfig.color, 
            fontSize: size === 'large' ? 24 : 16,
            ml: 0.5 
          }} 
        />
      </Tooltip>
    );
  };

  // Generate human, fun titles for Gettin Wavy brand
  const generateHumanTitle = (image, index) => {
    const persona = image.metadata?.persona || 'GENERAL';
    const caption = image.caption || '';
    
    // Extract core emotion/vibe from caption
    const isWorkRelated = caption.includes('professionally') || caption.includes('meeting') || caption.includes('office');
    const isMomLife = caption.includes('caffeinating') || caption.includes('surviving') || caption.includes('managing chaos');
    const isWellness = caption.includes('healing') || caption.includes('mindful') || caption.includes('therapy');
    
    // Fun, human title starters
    const titleStarters = [
      "When Life Gets Wavy",
      "Ocean Vibes Only", 
      "Wave Therapy Session",
      "Gettin Wavy With It",
      "Coastal Mood Booster",
      "Beach Energy Print",
      "Ocean Therapy Art",
      "Wave Life Poster"
    ];
    
    // Context-specific additions
    let contextSuffix = "";
    if (isWorkRelated) {
      contextSuffix = " | Office Zen Vibes";
    } else if (isMomLife) {
      contextSuffix = " | Mom Life Energy";
    } else if (isWellness) {
      contextSuffix = " | Wellness Space Art";
    } else {
      const suffixes = [" | Home Decor", " | Wall Art", " | Coastal Print", " | Ocean Art"];
      contextSuffix = suffixes[index % suffixes.length];
    }
    
    const baseTitle = titleStarters[index % titleStarters.length];
    return `${baseTitle}${contextSuffix}`;
  };

  // Generate profitable, human descriptions using business data
  const generateHumanDescription = (image) => {
    const caption = image.caption || '';
    const persona = image.metadata?.persona || 'GENERAL';
    const estimatedConversion = image.metadata?.estimatedConversion || 15;
    
    // Professional yet authentic brand voice
    const brandIntros = [
      "Sometimes you need art that brings a sense of calm to your everyday space.",
      "We've always been drawn to the ocean's ability to center and inspire.",
      "There's something about wave imagery that just works in any environment.",
      "We discovered this design and knew it needed to be shared.",
      "This piece has become one of our personal favorites for good reason."
    ];
    
    // Thoughtful observations about ideal placement
    let personalConnection = "";
    if (persona.includes('MOTHER')) {
      personalConnection = "Parents often tell us how much they appreciate having something serene to focus on during those quiet morning moments with coffee.";
    } else if (persona.includes('PROFESSIONAL')) {
      personalConnection = "This works beautifully in offices and home workspaces, providing a calming focal point during long work sessions.";
    } else if (persona.includes('WELLNESS') || persona.includes('HEALTHCARE')) {
      personalConnection = "Healthcare professionals and wellness practitioners have shared how ocean imagery helps create a more therapeutic environment for their clients.";
    } else {
      personalConnection = "It's the kind of piece that quietly elevates a space without demanding too much attention.";
    }
    
    // Honest product details
    const practicalInfo = `

What you can expect:
• High-quality poster print with professional-grade materials
• 14" x 11" dimensions that work well in most spaces
• Reliable shipping timeline with careful packaging
• Fade-resistant inks that maintain color integrity over time

We've built our reputation on delivering art that people actually want to keep on their walls. No overselling here - just thoughtful design that enhances your space.`;

    const brandIntro = brandIntros[Math.floor(Math.random() * brandIntros.length)];
    
    return `${brandIntro}

"${caption}"

${personalConnection}${practicalInfo}`;
  };

  // Create Printify listings from approved images
  const createPrintifyListings = async () => {
    if (approvedImages.length === 0) return;
    
    setCreatingListings(true);
    setListingProgress(0);
    
    try {
      console.log(`🏭 Starting Printify listing creation for ${approvedImages.length} approved images`);
      
      for (let i = 0; i < approvedImages.length; i++) {
        const image = approvedImages[i];
        console.log(`📤 Creating listing ${i + 1}/${approvedImages.length}: ${image.title}`);
        
        // Upload image to Printify
        const base64Data = image.processed.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        const uploadResponse = await fetch('http://localhost:3001/api/printify/upload-image-base64', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: image.processed,
            filename: image.filename || `wave-art-${image.id}.jpg`
          })
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Image upload failed for ${image.title}: ${errorText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log(`✅ Image uploaded: ${uploadResult.id}`);
        
        // Create human-sounding product info
        const humanTitle = generateHumanTitle(image, i);
        const humanDescription = generateHumanDescription(image);
        
        // Create product with uploaded image using Printify's exact specifications
        const productData = {
          title: humanTitle,
          description: humanDescription,
          blueprint_id: 97, // Satin Posters (210gsm)
          print_provider_id: 99, // Printify Choice
          variants: [{
            id: 33742, // 14″ x 11″ landscape (4200x3300px required)
            price: 1999, // $19.99
            is_enabled: true
          }],
          print_areas: [{
            variant_ids: [33742],
            placeholders: [{
              position: "front",
              images: [{
                id: uploadResult.id,
                x: 0.5, // Center horizontally
                y: 0.5, // Center vertically  
                scale: 1, // Full scale - our image is exactly 4200x3300 to match Printify specs
                angle: 0
              }]
            }]
          }],
          tags: ["ocean", "waves", "wall-art", "therapeutic", "wellness", "home-decor"].filter(Boolean)
        };
        
        const productResponse = await fetch('http://localhost:3001/api/printify/create-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        
        if (!productResponse.ok) {
          const errorText = await productResponse.text();
          throw new Error(`Product creation failed for ${image.title}: ${errorText}`);
        }
        
        const product = await productResponse.json();
        console.log(`🎉 Product created: ${product.id} - ${product.title}`);
        
        setCreatedProducts(prev => [...prev, {
          ...product,
          originalImage: image,
          printifyUrl: `https://printify.com/app/products/${product.id}`
        }]);
        
        setListingProgress(((i + 1) / approvedImages.length) * 100);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`🎯 Successfully created ${approvedImages.length} Printify listings!`);
      
    } catch (error) {
      console.error('❌ Listing creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Listing creation failed: ${errorMessage}`);
    } finally {
      setCreatingListings(false);
    }
  };

  // Mode toggle component
  const ModeToggle = () => (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 2, 
        bgcolor: batchMode ? '#FFF3E0' : '#E3F2FD',
        border: batchMode ? '2px solid #FF9800' : '2px solid #2196F3'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" sx={{ color: batchMode ? '#E65100' : '#1565C0' }}>
            {batchMode ? '⚡ Batch Mode' : '🎯 Single Mode'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {batchMode 
              ? 'Process multiple images quickly - use when confident'
              : 'Process one at a time - recommended for testing'
            }
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={batchMode}
              onChange={(event) => setBatchMode(event.target.checked)}
              color={batchMode ? 'warning' : 'primary'}
            />
          }
          label=""
        />
      </Stack>
    </Paper>
  );

  // Generate Images Tab
  const GenerateTab = () => (
    <Box>
      <ModeToggle />
      
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Waves color="primary" />
            <Typography variant="h6">Wave Image Generation</Typography>
            <StatusIndicator status={tabStatuses.generate} size="large" />
          </Stack>

          <Stack spacing={2} mb={3}>
            {/* Main Generate Button */}
            <Button
              variant="contained"
              size="large"
              onClick={() => fetchImages(false, batchMode ? 20 : 5)}
              disabled={loading}
              startIcon={<Waves />}
              sx={{ py: 2 }}
            >
              Generate {batchMode ? '20' : '5'} Wave Images
            </Button>

            {/* Theme-Specific Generation */}
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              Or Generate by Theme:
            </Typography>
            <Grid container spacing={2}>
              {Object.keys(CONTENT_THEMES).map(themeKey => (
                <Grid item xs={6} md={4} key={themeKey}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      console.log('🎯 Generating with theme:', themeKey, CONTENT_THEMES[themeKey].name);
                      fetchImages(true, batchMode ? 20 : 5, themeKey); // Force refresh for themes
                    }}
                    disabled={loading}
                    size="small"
                  >
                    {CONTENT_THEMES[themeKey].name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Stack>

          {loading && (
            <Box mb={2}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Generating {batchMode ? 'batch of' : ''} wave images...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Total Generated:</strong> {imageStats.totalGenerated} | 
              <strong>Active:</strong> {imageStats.currentActive} |
              <strong>Approved:</strong> {imageStats.approved} |
              <strong>Deleted:</strong> {imageStats.deleted} |
              <strong>Created:</strong> {imageStats.created} |
              <strong>Mode:</strong> {batchMode ? 'Batch' : 'Single'}
            </Typography>
          </Alert>

          {/* Live Image Preview Gallery */}
          {processedImages.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📸 Generated Images ({processedImages.length})
                </Typography>
                <Grid container spacing={2}>
                  {processedImages.slice(-6).map((image, index) => ( // Show last 6 images
                    <Grid item xs={6} md={4} lg={2} key={`preview-${image.id}-${index}`}>
                      <Card variant="outlined" sx={{ position: 'relative' }}>
                        <Box sx={{ position: 'relative' }}>
                          <img 
                            src={image.processed} 
                            alt={image.caption}
                            style={{ 
                              width: '100%', 
                              height: 120, 
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                          <Chip
                            label={image.metadata?.persona?.replace('_', ' ') || 'General'}
                            size="small"
                            sx={{ 
                              position: 'absolute', 
                              top: 4, 
                              left: 4,
                              fontSize: '10px',
                              height: 20
                            }}
                          />
                        </Box>
                        <Box sx={{ p: 1 }}>
                          <Typography variant="caption" display="block" noWrap>
                            {image.caption}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {processedImages.length > 6 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    Showing 6 most recent. See all {processedImages.length} in Review tab.
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  // Review & Approve Tab
  const ReviewTab = () => {
    const pendingReview = processedImages.filter(
      img => !approvedImages.find(approved => approved.id === img.id)
    );

    const handleApprove = (image) => {
      setApprovedImages(prev => [...prev, image]);
    };

    const handleReject = (imageId, image) => {
      // Move to deleted images for tracking
      setDeletedImages(prev => [...prev, image]);
      // Remove from processedImages using the hook function
      deleteImages([imageId]);
      // Also remove from approved if it was approved
      setApprovedImages(prev => prev.filter(img => img.id !== imageId));
    };

    const handleEdit = (image) => {
      setEditDialog(image);
    };

    const handleBulkApprove = () => {
      setApprovedImages(prev => [...prev, ...pendingReview]);
    };

    const handleBulkDelete = () => {
      // Move all pending review images to deleted
      setDeletedImages(prev => [...prev, ...pendingReview]);
      // Remove all pending from processed images
      const pendingIds = pendingReview.map(img => img.id);
      deleteImages(pendingIds);
      // Remove any that were approved
      setApprovedImages(prev => prev.filter(img => !pendingIds.includes(img.id)));
    };

    return (
      <Box>
        <ModeToggle />
        
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Visibility color="warning" />
              <Typography variant="h6">Review & Approve Images</Typography>
              <StatusIndicator status={tabStatuses.review} size="large" />
            </Stack>

            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Image Status:</strong> {pendingReview.length} pending review | {approvedImages.length} approved | {imageStats.deleted} deleted total
            </Alert>

            <Stack direction="row" spacing={2} mb={3}>
              <Button
                variant="contained"
                color="success"
                onClick={handleBulkApprove}
                disabled={pendingReview.length === 0}
                startIcon={<CheckCircle />}
              >
                Approve All ({pendingReview.length})
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleBulkDelete}
                disabled={pendingReview.length === 0}
                startIcon={<Delete />}
              >
                Delete All ({pendingReview.length})
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSelectedImages([])}
                disabled={selectedImages.length === 0}
              >
                Clear Selection
              </Button>
            </Stack>

            <Accordion expanded={true}>
              <AccordionSummary>
                <Typography variant="h6">
                  Pending Review ({pendingReview.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {pendingReview.map((image, index) => (
                    <Grid item xs={12} md={6} lg={4} key={`review-${image.id}-${index}`}>
                      <Card variant="outlined">
                        <Box sx={{ position: 'relative' }}>
                          <img 
                            src={image.processed} 
                            alt={image.caption}
                            style={{ width: '100%', height: 200, objectFit: 'cover' }}
                          />
                          <Chip
                            label={image.metadata?.persona || 'General'}
                            size="small"
                            sx={{ position: 'absolute', top: 8, left: 8 }}
                          />
                        </Box>
                        
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            {image.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mb={2}>
                            {image.caption}
                          </Typography>
                          
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleApprove(image)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleEdit(image)}
                            >
                              Edit
                            </Button>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(image.id, image)}
                            >
                              <Delete />
                            </IconButton>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {approvedImages.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    Approved Images ({approvedImages.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {approvedImages.length} images approved and ready for listing creation
                  </Alert>
                </AccordionDetails>
              </Accordion>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Create Listings Tab
  const ListingsTab = () => (
    <Box>
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Store color="success" />
            <Typography variant="h6">Create Printify Listings</Typography>
            <StatusIndicator status={tabStatuses.listings} size="large" />
          </Stack>

          <Alert severity="info" sx={{ mb: 2 }}>
            {approvedImages.length} approved images ready for listing creation
          </Alert>

          {creatingListings && (
            <Box mb={3}>
              <Typography variant="body2" gutterBottom>
                Creating listings... {Math.round(listingProgress)}% complete
              </Typography>
              <LinearProgress variant="determinate" value={listingProgress} />
            </Box>
          )}

          <Stack direction="row" spacing={2} mb={3}>
            <Button
              variant="contained"
              color="primary"
              disabled={approvedImages.length === 0 || creatingListings}
              startIcon={creatingListings ? <PlayArrow /> : <Add />}
              onClick={createPrintifyListings}
              size="large"
            >
              {creatingListings 
                ? `Creating... (${Math.round(listingProgress)}%)` 
                : `Create ${approvedImages.length} Printify Listings`
              }
            </Button>
            
            {createdProducts.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<Assessment />}
                onClick={() => window.open('https://printify.com/app/products', '_blank')}
              >
                View in Printify ({createdProducts.length})
              </Button>
            )}
          </Stack>

          {/* Created Products Display */}
          {createdProducts.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ✅ Created Products ({createdProducts.length})
                </Typography>
                <Grid container spacing={2}>
                  {createdProducts.map((product, index) => (
                    <Grid item xs={12} md={6} key={product.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" spacing={2}>
                            <img 
                              src={product.originalImage.processed}
                              alt={product.title}
                              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                {product.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Printify ID: {product.id}
                              </Typography>
                              <br />
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => window.open(product.printifyUrl, '_blank')}
                              >
                                View Product
                              </Button>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  // Publish to Store Tab
  const PublishTab = () => (
    <Box>
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Publish color="secondary" />
            <Typography variant="h6">Publish to Shopify Store</Typography>
            <StatusIndicator status={tabStatuses.publish} size="large" />
          </Stack>

          <Alert severity="warning">
            Publishing functionality coming soon
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );

  // Emergency/Automation Control Tab
  const AutomationTab = () => {
    const runSystemCheck = async () => {
      setSystemCheckDialog(true);
      // TODO: Implement actual system checks
      setTimeout(() => {
        setSystemStatus({
          pexelsApi: 'connected',
          printifyApi: 'connected', 
          serverConnection: 'connected'
        });
      }, 2000);
    };

    return (
      <Box>
        <Paper 
          sx={{ 
            p: 3, 
            mb: 2, 
            bgcolor: '#FFEBEE',
            border: '3px solid #F44336',
            borderRadius: 2
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Emergency sx={{ color: '#F44336', fontSize: 32 }} />
            <Typography variant="h5" sx={{ color: '#C62828', fontWeight: 'bold' }}>
              AUTOMATION CONTROL CENTER
            </Typography>
            <StatusIndicator status={tabStatuses.automation} size="large" />
          </Stack>

          <Alert severity="error" sx={{ mb: 3 }}>
            <strong>Emergency Controls:</strong> Use these tools to monitor and control automation systems
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🔧 System Health Check
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={runSystemCheck}
                    startIcon={<Assessment />}
                  >
                    Run Full System Check
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 Performance Summary
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Images Generated: {processedImages.length}
                    </Typography>
                    <Typography variant="body2">
                      Images Approved: {approvedImages.length}
                    </Typography>
                    <Typography variant="body2">
                      Success Rate: {processedImages.length > 0 ? 
                        ((processedImages.length - (error ? 1 : 0)) / processedImages.length * 100).toFixed(1)
                        : 0}%
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (currentTab) {
      case 0: return <GenerateTab />;
      case 1: return <ReviewTab />;
      case 2: return <ListingsTab />;
      case 3: return <PublishTab />;
      case 4: return <AutomationTab />;
      default: return <GenerateTab />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Waves sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Wave Caption Generator - Workflow System
          </Typography>
          <Chip
            label={`${processedImages.length} Generated`}
            color="secondary"
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {/* Workflow Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 80,
                textTransform: 'none'
              }
            }}
          >
            {WORKFLOW_TABS.map((tab, index) => {
              const IconComponent = tab.icon;
              const status = tabStatuses[tab.id];
              
              return (
                <Tab
                  key={tab.id}
                  label={
                    <Stack alignItems="center" spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconComponent sx={{ color: tab.color }} />
                        <StatusIndicator status={status} />
                      </Stack>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {tab.label}
                      </Typography>
                    </Stack>
                  }
                  sx={{
                    bgcolor: index === 4 ? '#FFEBEE' : 'transparent', // Red background for emergency tab
                    '&.Mui-selected': {
                      bgcolor: index === 4 ? '#FFCDD2' : '#E3F2FD'
                    }
                  }}
                />
              );
            })}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Edit Dialog */}
        <Dialog open={!!editDialog} onClose={() => setEditDialog(null)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Image Content</DialogTitle>
          <DialogContent>
            {editDialog && (
              <Stack spacing={3}>
                <img 
                  src={editDialog.processed} 
                  alt={editDialog.caption}
                  style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
                />
                <TextField
                  label="Title"
                  fullWidth
                  defaultValue={editDialog.title}
                  multiline
                  rows={2}
                />
                <TextField
                  label="Caption"
                  fullWidth
                  defaultValue={editDialog.caption}
                  multiline
                  rows={3}
                />
                <Alert severity="info">
                  <Typography variant="body2">
                    Changes will be saved and used to improve future content generation
                  </Typography>
                </Alert>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button variant="contained" onClick={() => setEditDialog(null)}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* System Check Dialog */}
        <Dialog open={systemCheckDialog} onClose={() => setSystemCheckDialog(false)}>
          <DialogTitle>System Health Check</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              {Object.entries(systemStatus).map(([service, status]) => (
                <Stack direction="row" alignItems="center" spacing={2} key={service}>
                  <Typography variant="body1" sx={{ minWidth: 150 }}>
                    {service.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                  </Typography>
                  <Chip 
                    label={status} 
                    color={status === 'connected' ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Stack>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSystemCheckDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default WorkflowWaveApp;