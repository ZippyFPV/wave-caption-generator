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
  Badge,
  Alert
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
  ZoomIn,
  RemoveCircle,
  OpenInNew,
  Assessment,
  ExpandMore,
  PlayArrow,
  Stop,
  Refresh
} from '@mui/icons-material';

import { useImageProcessing } from '../hooks/useImageProcessing';
import { automationService, AUTOMATION_SCALES } from '../services/fullAutomation.js';
import { listingTracker } from '../services/listingTracker.js';

// Tab configuration with status tracking
const WORKFLOW_TABS = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Assessment, 
    color: '#6B73FF' // Indigo
  },
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
  inactive: { icon: Pause, color: '#9E9E9E', label: 'Not Started' },
  checking: { icon: Warning, color: '#FF9800', label: 'Checking' },
  connected: { icon: CheckCircle, color: '#4CAF50', label: 'Connected' }
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
    dashboard: 'ready',
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
  
  // Phrase refinement state
  const [approvedPhrases, setApprovedPhrases] = useState([]);
  const [rejectedPhrases, setRejectedPhrases] = useState([]);
  const [showPhraseHistory, setShowPhraseHistory] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState(null);
  
  // Automation state
  const [automationProgress, setAutomationProgress] = useState(null);
  const [selectedScale, setSelectedScale] = useState('SINGLE');
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [automationListings, setAutomationListings] = useState([]);
  const [expandedImage, setExpandedImage] = useState(null);
  const [persistentMetrics, setPersistentMetrics] = useState(listingTracker.getMetrics());
  
  // Cross-tab sync for automation progress and metrics
  useEffect(() => {
    // Initialize from localStorage
    const savedProgress = localStorage.getItem('automation-progress');
    const savedListings = localStorage.getItem('automation-listings');
    const savedMetrics = localStorage.getItem('automation-metrics');
    
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        if (progress && progress.isRunning) {
          setAutomationProgress(progress);
        }
      } catch (e) {
        console.warn('Failed to parse saved automation progress:', e);
      }
    }
    
    if (savedListings) {
      try {
        const listings = JSON.parse(savedListings);
        setAutomationListings(listings);
      } catch (e) {
        console.warn('Failed to parse saved automation listings:', e);
      }
    }
    
    if (savedMetrics) {
      try {
        const metrics = JSON.parse(savedMetrics);
        setPersistentMetrics(metrics);
      } catch (e) {
        console.warn('Failed to parse saved automation metrics:', e);
      }
    }
    
    // Listen for storage changes from other tabs
    const handleStorageChange = (e) => {
      switch (e.key) {
        case 'automation-progress':
          if (e.newValue) {
            try {
              const progress = JSON.parse(e.newValue);
              console.log('📡 Cross-tab sync: Automation progress updated', progress);
              setAutomationProgress(progress);
            } catch (err) {
              console.warn('Failed to sync automation progress:', err);
            }
          } else {
            setAutomationProgress(null);
          }
          break;
          
        case 'automation-listings':
          if (e.newValue) {
            try {
              const listings = JSON.parse(e.newValue);
              console.log('📡 Cross-tab sync: Automation listings updated', listings.length, 'items');
              setAutomationListings(listings);
            } catch (err) {
              console.warn('Failed to sync automation listings:', err);
            }
          } else {
            setAutomationListings([]);
          }
          break;
          
        case 'automation-metrics':
          if (e.newValue) {
            try {
              const metrics = JSON.parse(e.newValue);
              console.log('📡 Cross-tab sync: Metrics updated', metrics);
              setPersistentMetrics(metrics);
            } catch (err) {
              console.warn('Failed to sync metrics:', err);
            }
          }
          break;
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Helper function to sync data across tabs
  const syncToOtherTabs = (key, data) => {
    try {
      if (data === null || data === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.warn(`Failed to sync ${key} to localStorage:`, e);
    }
  };
  
  // Sync automation progress changes
  useEffect(() => {
    syncToOtherTabs('automation-progress', automationProgress);
  }, [automationProgress]);
  
  // Sync automation listings changes
  useEffect(() => {
    syncToOtherTabs('automation-listings', automationListings);
  }, [automationListings]);
  
  // Sync metrics changes
  useEffect(() => {
    syncToOtherTabs('automation-metrics', persistentMetrics);
  }, [persistentMetrics]);
  
  // Real-time metrics polling and cross-tab sync
  useEffect(() => {
    const interval = setInterval(() => {
      const currentMetrics = listingTracker.getMetrics();
      
      // Only update if metrics have actually changed
      if (JSON.stringify(currentMetrics) !== JSON.stringify(persistentMetrics)) {
        console.log('📊 Metrics updated:', currentMetrics);
        setPersistentMetrics(currentMetrics);
      }
    }, 2000); // Poll every 2 seconds for real-time updates
    
    return () => clearInterval(interval);
  }, [persistentMetrics]);
  
  // Bulk delete state
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');
  
  // Error handling state
  const [errorDialog, setErrorDialog] = useState(null);
  const [errorHistory, setErrorHistory] = useState([]);
  
  // Automation summary state
  const [automationSummary, setAutomationSummary] = useState(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  
  // Automation gallery modal state
  const [showAutomationGallery, setShowAutomationGallery] = useState(false);
  
  // Listing creation state (moved up before useEffect)
  const [creatingListings, setCreatingListings] = useState(false);
  const [createdProducts, setCreatedProducts] = useState([]);
  const [listingProgress, setListingProgress] = useState(0);
  
  // Refresh metrics periodically and on component mount
  useEffect(() => {
    // Initial load
    setPersistentMetrics(listingTracker.getMetrics());
    
    const interval = setInterval(() => {
      setPersistentMetrics(listingTracker.getMetrics());
    }, 2000); // Every 2 seconds for more responsive updates
    
    return () => clearInterval(interval);
  }, []);
  
  // Also update metrics when automation listings change
  useEffect(() => {
    setPersistentMetrics(listingTracker.getMetrics());
  }, [automationListings, createdProducts]);

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

  // Phrase refinement handlers
  const handlePhraseApproval = (imageId, action) => {
    const image = processedImages.find(img => img.id === imageId);
    if (!image) return;
    
    const phraseData = {
      phrase: image.caption,
      imageId: imageId,
      theme: image.metadata?.theme,
      persona: image.metadata?.persona,
      timestamp: new Date().toISOString()
    };
    
    if (action === 'approve') {
      setApprovedPhrases(prev => [...prev.filter(p => p.imageId !== imageId), phraseData]);
      setRejectedPhrases(prev => prev.filter(p => p.imageId !== imageId));
    } else if (action === 'reject') {
      setRejectedPhrases(prev => [...prev.filter(p => p.imageId !== imageId), phraseData]);
      setApprovedPhrases(prev => prev.filter(p => p.imageId !== imageId));
    }
  };

  const handlePhraseEdit = (imageId) => {
    const image = processedImages.find(img => img.id === imageId);
    if (!image) return;
    
    setEditingPhrase({
      imageId: imageId,
      currentPhrase: image.caption,
      originalPhrase: image.caption
    });
  };

  // Status indicator component
  const StatusIndicator = ({ status, size = 'small' }) => {
    const statusConfig = STATUS_INDICATORS[status];
    
    // Safety check for missing status
    if (!statusConfig) {
      console.warn(`Unknown status: ${status}`);
      return <Warning sx={{ color: '#FF9800', fontSize: size === 'large' ? 24 : 16 }} />;
    }
    
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
      console.log(`📊 Current persistent metrics before manual creation:`, listingTracker.getMetrics());
      
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
        
        // Create product with optimal 8-variant strategy for maximum profit
        const optimalVariants = getOptimalVariantsForManual();
        const allVariantIds = optimalVariants.map(v => v.id);
        
        const productData = {
          title: humanTitle,
          description: humanDescription,
          blueprint_id: 97, // Satin Posters (210gsm)
          print_provider_id: 99, // Printify Choice
          variants: optimalVariants,
          print_areas: [{
            variant_ids: allVariantIds,
            placeholders: [{
              position: "front",
              images: [{
                id: uploadResult.id,
                x: 0.5, // Center horizontally
                y: 0.5, // Center vertically  
                scale: 1, // Full scale - our image matches Printify specs
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
        
        // Create listing record for persistent tracking
        const listingRecord = {
          listingId: `manual_${Date.now()}_${i}`,
          printifyId: product.id,
          productCopy: {
            title: humanTitle,
            description: humanDescription
          },
          imageData: {
            caption: image.caption,
            context: 'manual', // We don't have context from manual flow, so mark as manual
          },
          printifyProduct: product,
          success: true,
          published: product.published !== false,
          completedTime: Date.now(),
          source: 'manual'
        };
        
        // Record in persistent tracker
        listingTracker.recordListing(listingRecord);
        
        setCreatedProducts(prev => [...prev, {
          ...product,
          originalImage: image,
          printifyUrl: `https://printify.com/app/products/${product.id}`,
          source: 'manual'
        }]);
        
        // Update persistent metrics in real-time
        setPersistentMetrics(listingTracker.getMetrics());
        
        setListingProgress(((i + 1) / approvedImages.length) * 100);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`🎯 Successfully created ${approvedImages.length} Printify listings!`);
      console.log(`📊 Updated persistent metrics after manual creation:`, listingTracker.getMetrics());
      
      // Final metrics update
      setPersistentMetrics(listingTracker.getMetrics());
      
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

  // Dashboard Tab
  const DashboardTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ color: '#6B73FF', fontWeight: 'bold' }}>
        📊 Wave Commerce Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>📈 Performance Metrics</Typography>
              <Grid container spacing={2}>
                {/* Session Metrics */}
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E3F2FD' }}>
                    <Typography variant="h4" sx={{ color: '#1976D2', fontWeight: 'bold' }}>
                      {imageStats.totalGenerated}
                    </Typography>
                    <Typography variant="caption">Session Images</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF3E0' }}>
                    <Typography variant="h4" sx={{ color: '#F57C00', fontWeight: 'bold' }}>
                      {imageStats.created}
                    </Typography>
                    <Typography variant="caption">Session Created</Typography>
                  </Paper>
                </Grid>
                
                {/* Persistent Metrics */}
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8F5E8' }}>
                    <Typography variant="h4" sx={{ color: '#388E3C', fontWeight: 'bold' }}>
                      {persistentMetrics.total}
                    </Typography>
                    <Typography variant="caption">Total Ever</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#F3E5F5' }}>
                    <Typography variant="h4" sx={{ color: '#7B1FA2', fontWeight: 'bold' }}>
                      {persistentMetrics.automation}
                    </Typography>
                    <Typography variant="caption">Automation Ever</Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              {/* Detailed Breakdown */}
              <Card sx={{ mt: 2, bgcolor: '#FAFAFA' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    📊 Detailed Breakdown
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2"><strong>Manual Listings:</strong> {persistentMetrics.manual}</Typography>
                      <Typography variant="body2"><strong>Published:</strong> {persistentMetrics.published}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2"><strong>Success Rate:</strong> {persistentMetrics.successRate}%</Typography>
                      <Typography variant="body2"><strong>Session Approved:</strong> {imageStats.approved}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>🔧 System Status</Typography>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography>Pexels API</Typography>
                  <StatusIndicator status={systemStatus.pexelsApi} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography>Printify API</Typography>
                  <StatusIndicator status={systemStatus.printifyApi} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography>Server</Typography>
                  <StatusIndicator status={systemStatus.serverConnection} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>⚡ Quick Actions</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<Waves />}
                  onClick={() => setCurrentTab(1)}
                  disabled={loading}
                >
                  Generate Images
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => setCurrentTab(2)}
                  disabled={imageStats.currentActive === 0}
                >
                  Review Images ({imageStats.currentActive})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Store />}
                  onClick={() => setCurrentTab(3)}
                  disabled={imageStats.approved === 0}
                >
                  Create Listings ({imageStats.approved})
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => {
                    console.log('🔍 DEBUG - Current metrics state:');
                    console.log('persistentMetrics:', persistentMetrics);
                    console.log('listingTracker.getMetrics():', listingTracker.getMetrics());
                    console.log('listingTracker.getAllListings():', listingTracker.getAllListings());
                    console.log('automationListings:', automationListings.length);
                    console.log('createdProducts:', createdProducts.length);
                    setPersistentMetrics(listingTracker.getMetrics());
                  }}
                >
                  Debug Metrics
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
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
                <Grid size={{ xs: 6, md: 4 }} key={themeKey}>
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
              <strong>Session:</strong> Generated: {imageStats.totalGenerated}, Active: {imageStats.currentActive}, Approved: {imageStats.approved}, Created: {imageStats.created} | 
              <strong>All-Time:</strong> Total: {persistentMetrics.total}, Automation: {persistentMetrics.automation}, Manual: {persistentMetrics.manual} |
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
                    <Grid size={{ xs: 6, md: 4, lg: 2 }} key={`preview-${image.id}-${index}`}>
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
                          <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', mb: 0.5 }}>
                            "{image.caption}"
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handlePhraseApproval(image.id, 'approve')}
                              sx={{ p: 0.25 }}
                            >
                              <CheckCircle sx={{ fontSize: 12 }} />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handlePhraseApproval(image.id, 'reject')}
                              sx={{ p: 0.25 }}
                            >
                              <Error sx={{ fontSize: 12 }} />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handlePhraseEdit(image.id)}
                              sx={{ p: 0.25 }}
                            >
                              <Edit sx={{ fontSize: 12 }} />
                            </IconButton>
                          </Stack>
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
                
                {/* Phrase Quality Control Panel */}
                <Card sx={{ mt: 2, bgcolor: '#F8F9FA' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      🎯 Phrase Quality Control
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                      <Typography variant="caption">
                        ✅ Approved: <strong>{approvedPhrases.length}</strong>
                      </Typography>
                      <Typography variant="caption">
                        ❌ Rejected: <strong>{rejectedPhrases.length}</strong>
                      </Typography>
                      <Typography variant="caption">
                        📊 Success Rate: <strong>{processedImages.length > 0 ? Math.round((approvedPhrases.length / processedImages.length) * 100) : 0}%</strong>
                      </Typography>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => setShowPhraseHistory(!showPhraseHistory)}
                      >
                        {showPhraseHistory ? 'Hide' : 'View'} History
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
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
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`review-${image.id}-${index}`}>
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
                    <Grid size={{ xs: 12, md: 6 }} key={product.id}>
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
            <Typography variant="h6">Auto-Publishing to Shopify Store</Typography>
            <StatusIndicator status={tabStatuses.publish} size="large" />
          </Stack>

          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Auto-publishing is ACTIVE! Products automatically publish to Shopify when created.
          </Alert>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Publishing Status
              </Typography>
              <Stack spacing={2}>
                <Typography variant="body2">
                  <strong>Auto-publish enabled:</strong> ✅ Yes
                </Typography>
                <Typography variant="body2">
                  <strong>Target store:</strong> Shopify (configured in server)
                </Typography>
                <Typography variant="body2">
                  <strong>Products published:</strong> {createdProducts.filter(p => p.published !== false).length} / {createdProducts.length}
                </Typography>
                
                {createdProducts.length > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<Publish />}
                    onClick={() => window.open('https://printify.com/app/products', '_blank')}
                    sx={{ mt: 2 }}
                  >
                    View Live Products in Printify
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ mt: 2 }}>
            Products are automatically published to your Shopify store when created in the "Create Listings" tab. 
            Use the Big Red Button for full automation including auto-publishing.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );

  // Emergency/Automation Control Tab
  // Automation handlers
  const handleStartAutomation = async () => {
    try {
      setConfirmationDialog(false);
      setAutomationListings([]); // Clear previous listings
      
      const result = await automationService.startAutomation(
        selectedScale, 
        (progress) => {
          setAutomationProgress(progress);
        },
        (listing) => {
          // Update or add the listing to our state
          setAutomationListings(prev => {
            const existingIndex = prev.findIndex(l => l.listingId === listing.listingId);
            if (existingIndex >= 0) {
              // Update existing listing
              const updated = [...prev];
              updated[existingIndex] = listing;
              return updated;
            } else {
              // Add new listing
              return [...prev, listing];
            }
          });
          
          // If listing is completed successfully, add to main app state
          if (listing.success && listing.printifyProduct) {
            setCreatedProducts(prev => {
              // Check if already exists to avoid duplicates
              const exists = prev.find(p => p.id === listing.printifyProduct.id);
              if (!exists) {
                return [...prev, {
                  ...listing.printifyProduct,
                  originalImage: listing.imageData,
                  printifyUrl: listing.printifyUrl,
                  caption: listing.imageData?.caption || '',
                  title: listing.productCopy?.title || listing.printifyProduct.title,
                  context: listing.imageData?.context || 'unknown' // Include context for tracking
                }];
              }
              return prev;
            });
            
            // Update persistent metrics
            setPersistentMetrics(listingTracker.getMetrics());
          }
        }
      );
      
      console.log('✅ Automation completed:', result);
      
      // Clear cross-tab sync data on completion
      setTimeout(() => {
        localStorage.removeItem('automation-progress');
      }, 2000); // Delay to allow other tabs to see completion state
      
    } catch (error) {
      console.error('Automation failed:', error);
      alert(`Automation failed: ${error.message}`);
      
      // Clear cross-tab data on error
      localStorage.removeItem('automation-progress');
      localStorage.removeItem('automation-listings');
    }
  };

  const handleStopAutomation = () => {
    console.log('🛑 User requested automation stop...');
    automationService.stopAutomation();
    
    // Force stop after 10 seconds if it doesn't stop gracefully
    setTimeout(() => {
      if (automationService.getStatus().isRunning) {
        console.log('🚨 Force stopping automation...');
        // Reset automation state and sync across tabs
        setAutomationProgress(null);
        setAutomationListings([]);
        
        // Clear cross-tab sync data
        localStorage.removeItem('automation-progress');
        localStorage.removeItem('automation-listings');
      }
    }, 10000);
  };

  const handleRemoveListing = async (listing) => {
    if (!listing.printifyId) return;
    
    const confirmed = window.confirm(
      `Remove listing "${listing.productCopy?.title || listing.listingId}"?\n\nThis will delete the product from Printify and cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      // Delete from Printify
      const response = await fetch(`http://localhost:3001/api/printify/products/${listing.printifyId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove from automation listings
        setAutomationListings(prev => prev.filter(l => l.listingId !== listing.listingId));
        
        // Remove from created products
        setCreatedProducts(prev => prev.filter(p => p.id !== listing.printifyId));
        
        console.log('✅ Listing removed successfully');
      } else {
        throw new Error('Failed to delete from Printify');
      }
    } catch (error) {
      console.error('❌ Failed to remove listing:', error);
      setErrorHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        error: error.message,
        action: 'Remove listing',
        listingId: listing.listingId
      }]);
      alert(`Failed to remove listing: ${error.message}`);
    }
  };

  // Bulk delete all automation listings
  const handleBulkDeleteListings = async () => {
    if (confirmPhrase !== 'DELETE ALL LISTINGS') {
      alert('Please type "DELETE ALL LISTINGS" to confirm.');
      return;
    }
    
    setBulkDeleteLoading(true);
    
    try {
      // Get all Printify IDs from automation listings and created products
      const allProductIds = [
        ...automationListings.filter(l => l.printifyId).map(l => l.printifyId),
        ...createdProducts.map(p => p.id)
      ].filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates
      
      if (allProductIds.length === 0) {
        alert('No products to delete.');
        return;
      }
      
      console.log(`🗑️ Starting bulk delete of ${allProductIds.length} products...`);
      
      const response = await fetch('http://localhost:3001/api/printify/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: allProductIds,
          confirmPhrase: 'DELETE ALL LISTINGS'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Bulk delete failed: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('🏁 Bulk delete completed:', result);
      
      // Clear all listings from state
      setAutomationListings([]);
      setCreatedProducts([]);
      
      // Show success message
      alert(`Bulk delete completed:\n- Deleted: ${result.deleted}\n- Failed: ${result.failed}\n- Total requested: ${result.totalRequested}`);
      
      setBulkDeleteDialog(false);
      setConfirmPhrase('');
      
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
      setErrorHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        error: error.message,
        action: 'Bulk delete',
        productCount: allProductIds?.length || 0
      }]);
      alert(`Bulk delete failed: ${error.message}`);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // Enhanced automation with error handling
  const handleStartAutomationWithErrorHandling = async () => {
    try {
      setConfirmationDialog(false);
      setAutomationListings([]);
      setErrorHistory([]); // Clear previous errors
      
      // Open the large automation gallery modal for better UX
      setShowAutomationGallery(true);
      
      console.log('🌙 Starting overnight automation with enhanced error handling...');
      
      const result = await automationService.startAutomation(
        selectedScale, 
        (progress) => {
          setAutomationProgress(progress);
          
          // Log any errors for monitoring
          if (progress.errorMessage) {
            setErrorHistory(prev => [...prev, {
              timestamp: new Date().toISOString(),
              error: progress.errorMessage,
              action: 'Automation progress',
              step: progress.currentStep
            }]);
          }
        },
        (listing) => {
          // Update listings
          setAutomationListings(prev => {
            const existingIndex = prev.findIndex(l => l.listingId === listing.listingId);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = listing;
              return updated;
            } else {
              return [...prev, listing];
            }
          });
          
          // Track errors
          if (listing.error) {
            setErrorHistory(prev => [...prev, {
              timestamp: new Date().toISOString(),
              error: listing.error,
              action: 'Create listing',
              listingId: listing.listingId
            }]);
          }
          
          // Add to main app state if successful
          if (listing.success && listing.printifyProduct) {
            setCreatedProducts(prev => {
              const exists = prev.find(p => p.id === listing.printifyProduct.id);
              if (!exists) {
                return [...prev, {
                  ...listing.printifyProduct,
                  originalImage: listing.imageData,
                  printifyUrl: listing.printifyUrl,
                  caption: listing.imageData?.caption || '',
                  title: listing.productCopy?.title || listing.printifyProduct.title,
                  context: listing.imageData?.context || 'unknown'
                }];
              }
              return prev;
            });
            
            setPersistentMetrics(listingTracker.getMetrics());
          }
        }
      );
      
      console.log('✅ Automation completed:', result);
      
      // Generate comprehensive summary
      const summary = generateAutomationSummary(result);
      setAutomationSummary(summary);
      setShowSummaryDialog(true);
      
      // Keep gallery modal open to show final results
      // User can close it manually when they're done reviewing
      
      // Clear cross-tab sync data on completion
      setTimeout(() => {
        localStorage.removeItem('automation-progress');
      }, 2000); // Delay to allow other tabs to see completion state
      
      // Show completion notification
      if (errorHistory.length > 0) {
        setErrorDialog({
          title: 'Automation Completed with Errors',
          message: `Automation finished but encountered ${errorHistory.length} errors. Check the error log for details.`
        });
      }
      
    } catch (error) {
      console.error('Automation failed:', error);
      setErrorHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        error: error.message,
        action: 'Start automation',
        critical: true
      }]);
      setErrorDialog({
        title: 'Automation Failed',
        message: error.message
      });
      
      // Clear cross-tab data on error
      localStorage.removeItem('automation-progress');
      localStorage.removeItem('automation-listings');
    }
  };

  // Generate comprehensive automation summary
  const generateAutomationSummary = (result) => {
    const endTime = Date.now();
    const startTime = automationProgress?.startTime || endTime;
    const duration = endTime - startTime;
    
    // Calculate throughput metrics
    const avgTimePerListing = duration / Math.max(result.completed, 1);
    const successRate = result.completed / Math.max(result.completed + result.errors, 1) * 100;
    
    // Get category distribution
    const distribution = listingTracker.getCategoryDistribution();
    
    // Calculate realistic 3-day capacity
    const threeDayCapacity = calculate3DayCapacity(avgTimePerListing, successRate);
    
    // Get created product details for duplicate detection
    const createdProducts = automationListings
      .filter(l => l.success && l.printifyProduct)
      .map(l => ({
        id: l.printifyProduct.id,
        title: l.productCopy?.title,
        caption: l.imageData?.caption,
        context: l.imageData?.context,
        timestamp: l.completedTime || Date.now()
      }));
    
    return {
      // Performance metrics
      performance: {
        completed: result.completed,
        errors: result.errors,
        successRate: successRate.toFixed(1),
        duration: formatDuration(duration),
        avgTimePerListing: formatDuration(avgTimePerListing),
        startTime: new Date(startTime).toLocaleString(),
        endTime: new Date(endTime).toLocaleString()
      },
      
      // Category distribution
      distribution: {
        total: distribution.total,
        byContext: distribution.byContext,
        percentages: distribution.percentages,
        isBalanced: isDistributionBalanced(distribution)
      },
      
      // 3-day capacity projection
      threeDayCapacity,
      
      // Created products for duplicate detection
      createdProducts,
      
      // Error summary
      errors: {
        total: errorHistory.length,
        critical: errorHistory.filter(e => e.critical).length,
        byType: groupErrorsByType(errorHistory)
      },
      
      // Session metadata
      metadata: {
        scale: automationProgress?.scale,
        sessionId: `automation_${startTime}`,
        totalListingsEver: persistentMetrics.total,
        automationListingsEver: persistentMetrics.automation
      }
    };
  };

  // Calculate realistic 3-day automation capacity
  const calculate3DayCapacity = (avgTimePerListing, successRate) => {
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
    
    // Account for API rate limits (most restrictive is Printify at 600/minute)
    const printifyBottleneck = 60000; // 1 minute between requests to be safe
    const effectiveTimePerListing = Math.max(avgTimePerListing, printifyBottleneck);
    
    // Calculate theoretical maximum
    const theoreticalMax = Math.floor(threeDaysMs / effectiveTimePerListing);
    
    // Apply realistic constraints
    const constraints = {
      successRate: successRate / 100, // Account for failures
      downtime: 0.95, // 95% uptime (account for brief outages)
      rateLimit: 0.9, // 90% of rate limit to be conservative
      systemLoad: 0.85 // 85% efficiency under sustained load
    };
    
    const realisticMax = Math.floor(
      theoreticalMax * 
      constraints.successRate * 
      constraints.downtime * 
      constraints.rateLimit * 
      constraints.systemLoad
    );
    
    return {
      theoretical: theoreticalMax,
      realistic: realisticMax,
      conservative: Math.floor(realisticMax * 0.8), // 80% of realistic for safety
      constraints,
      breakdown: {
        avgTimePerListing: formatDuration(effectiveTimePerListing),
        listingsPerHour: Math.floor(3600000 / effectiveTimePerListing),
        listingsPerDay: Math.floor(86400000 / effectiveTimePerListing)
      }
    };
  };

  // Helper functions
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const isDistributionBalanced = (distribution) => {
    if (distribution.total < 6) return true;
    const counts = Object.values(distribution.byContext);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    return (max - min) <= Math.ceil(distribution.total / 6);
  };

  const groupErrorsByType = (errors) => {
    const groups = {};
    errors.forEach(error => {
      const type = error.action || 'Unknown';
      groups[type] = (groups[type] || 0) + 1;
    });
    return groups;
  };

  // Get optimal 8 variants for manual creation (same as automation)
  const getOptimalVariantsForManual = () => {
    const basePrice = 19.99; // Base price for manual listings
    const optimalSizes = [
      { id: 33742, size: "14″ x 11″", priceMultiplier: 1.0 },    // Most popular landscape
      { id: 33749, size: "11″ x 14″", priceMultiplier: 1.0 },    // Most popular portrait
      { id: 113155, size: "14″ x 14″", priceMultiplier: 1.1 },  // Square format
      { id: 33744, size: "20″ x 16″", priceMultiplier: 1.4 },   // Larger landscape
      { id: 33751, size: "16″ x 20″", priceMultiplier: 1.4 },   // Larger portrait
      { id: 33750, size: "12″ x 18″", priceMultiplier: 1.2 },   // Medium portrait
      { id: 33745, size: "24″ x 18″", priceMultiplier: 1.8 },   // Large landscape
      { id: 33752, size: "18″ x 24″", priceMultiplier: 1.8 }    // Large portrait
    ];

    return optimalSizes.map(variant => ({
      id: variant.id,
      price: Math.round(basePrice * variant.priceMultiplier * 100), // Convert to cents
      is_enabled: true
    }));
  };

  // Step status component
  const StepStatus = ({ status }) => {
    const getIcon = () => {
      switch (status) {
        case 'completed': return <CheckCircle color="success" />;
        case 'in_progress': return <PlayArrow color="primary" />;
        case 'error': return <Error color="error" />;
        case 'warning': return <Warning color="warning" />;
        default: return <Pause color="disabled" />;
      }
    };
    
    return getIcon();
  };

  const AutomationTab = () => {
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
              🚨 AUTOMATION CONTROL CENTER
            </Typography>
            <StatusIndicator status={tabStatuses.automation} size="large" />
          </Stack>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <strong>Full Pipeline Automation:</strong> Generate → Process → Upload → Publish complete listings automatically
          </Alert>

          {/* Scale Selection */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>⚙️ Automation Scale</Typography>
              <Stack direction="row" spacing={2} mb={2}>
                {Object.entries(AUTOMATION_SCALES).map(([key, scale]) => (
                  <Button
                    key={key}
                    variant={selectedScale === key ? 'contained' : 'outlined'}
                    color={selectedScale === key ? 'primary' : 'inherit'}
                    onClick={() => setSelectedScale(key)}
                    sx={{ flex: 1 }}
                  >
                    <Stack alignItems="center">
                      <Typography variant="subtitle2">{scale.name}</Typography>
                      <Typography variant="caption">{scale.description}</Typography>
                    </Stack>
                  </Button>
                ))}
              </Stack>
              
              {/* 3-Day Capacity Preview */}
              <Card sx={{ mt: 2, bgcolor: '#FFF8E1' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#F57C00' }}>🌙 3-Day Overnight Capacity Estimate</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2"><strong>🎯 Realistic:</strong> ~3,000-4,000 listings</Typography>
                      <Typography variant="caption" color="text.secondary">Accounts for API limits & downtime</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2"><strong>🛡️ Conservative:</strong> ~2,400-3,200 listings</Typography>
                      <Typography variant="caption" color="text.secondary">80% of realistic for safety buffer</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2"><strong>⚡ Theoretical Max:</strong> ~4,320 listings</Typography>
                      <Typography variant="caption" color="text.secondary">Perfect conditions (unrealistic)</Typography>
                    </Grid>
                  </Grid>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Based on:</strong> 60 sec/listing (API rate limits), 95% uptime, 85% efficiency, 90% success rate
                      <br /><strong>Rate:</strong> ~60/hour, ~1,440/day under sustained operation
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Big Red Button */}
          <Card sx={{ mb: 3, bgcolor: '#FFCDD2' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#D32F2F', fontWeight: 'bold', mb: 2 }}>
                🔴 BIG RED BUTTON
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Start complete automation: {AUTOMATION_SCALES[selectedScale].description}
              </Typography>
              
              {!(automationProgress?.isRunning || automationService.getStatus().isRunning) ? (
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={() => setConfirmationDialog(true)}
                  sx={{ 
                    fontSize: '1.2rem', 
                    py: 2, 
                    px: 4,
                    boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 12px rgba(244, 67, 54, 0.4)'
                    }
                  }}
                  startIcon={<Emergency sx={{ fontSize: 24 }} />}
                >
                  START AUTOMATION
                </Button>
              ) : (
                <Stack spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    color="warning"
                    size="large"
                    onClick={handleStopAutomation}
                    startIcon={<Stop />}
                  >
                    STOP AUTOMATION
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Will complete current listing then stop
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Progress Display */}
          {automationProgress && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">📊 Automation Progress</Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleStopAutomation}
                    startIcon={<Stop />}
                  >
                    Emergency Stop
                  </Button>
                </Stack>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2">
                      Current Step: <strong>{automationProgress.currentStep}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Completed: <strong>{automationProgress.completed}</strong> listings
                    </Typography>
                    <Typography variant="body2">
                      Errors: <strong>{automationProgress.errors}</strong>
                    </Typography>
                  </Box>
                  
                  {automationProgress.scale !== 'CONTINUOUS' && (
                    <Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(automationProgress.completed / AUTOMATION_SCALES[automationProgress.scale].count) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption">
                        {automationProgress.completed} / {AUTOMATION_SCALES[automationProgress.scale].count}
                      </Typography>
                    </Box>
                  )}
                  
                  {automationProgress.estimatedCompletion && (
                    <Typography variant="caption">
                      Estimated completion: {new Date(automationProgress.estimatedCompletion).toLocaleTimeString()}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Overnight Automation Controls */}
          <Card sx={{ mb: 3, bgcolor: '#F3E5F5' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#7B1FA2' }}>🌙 Overnight Automation Tools</Typography>
              <Stack direction="row" spacing={2} mb={2}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => setBulkDeleteDialog(true)}
                  disabled={automationListings.length === 0 && createdProducts.length === 0}
                >
                  Bulk Delete All Listings ({automationListings.filter(l => l.printifyId).length + createdProducts.length})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Warning />}
                  onClick={() => setErrorDialog({ title: 'Error History', showHistory: true })}
                  disabled={errorHistory.length === 0}
                >
                  View Error Log ({errorHistory.length})
                </Button>
              </Stack>
              <Alert severity="info">
                💡 <strong>Overnight Tips:</strong> Use bulk delete if automation creates problematic listings. Error log tracks all issues for debugging.
              </Alert>
            </CardContent>
          </Card>

          {/* System Performance */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>⚡ Performance Metrics</Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Manual Images: {processedImages.length}
                    </Typography>
                    <Typography variant="body2">
                      Automation Created: {persistentMetrics.automation}
                    </Typography>
                    <Typography variant="body2">
                      Total Listings: {persistentMetrics.total}
                    </Typography>
                    <Typography variant="body2">
                      Published: {persistentMetrics.published}
                    </Typography>
                    <Typography variant="body2">
                      Success Rate: {persistentMetrics.successRate}%
                    </Typography>
                    <Typography variant="body2">
                      Current Session: {automationListings.filter(l => l.success).length}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>🔧 System Status</Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Pexels API</Typography>
                      <StatusIndicator status={systemStatus.pexelsApi} />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Printify API</Typography>
                      <StatusIndicator status={systemStatus.printifyApi} />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Server</Typography>
                      <StatusIndicator status={systemStatus.serverConnection} />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Category Distribution */}
            {(automationListings.length > 0 || createdProducts.length > 0) && (
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>📊 Category Distribution (All Time)</Typography>
                    <Grid container spacing={2}>
                      {Object.keys(listingTracker.getCategoryDistribution().byContext).sort().map(context => {
                        const distribution = listingTracker.getCategoryDistribution();
                        const contextCount = distribution.byContext[context] || 0;
                        const percentage = distribution.percentages[context] || 0;
                        
                        return (
                          <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={context}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Typography variant="h6" color={contextCount === 0 ? 'text.disabled' : 'primary'}>
                                {contextCount}
                              </Typography>
                              <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                {context}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {percentage}%
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                    
                    {/* Balance Warning */}
                    {(() => {
                      const distribution = listingTracker.getCategoryDistribution();
                      const total = distribution.total;
                      if (total > 5) {
                        const contextCounts = Object.values(distribution.byContext);
                        const maxCount = Math.max(...contextCounts);
                        const minCount = Math.min(...contextCounts);
                        const isImbalanced = (maxCount - minCount) > Math.ceil(total / 40);
                        
                        return isImbalanced ? (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            Category distribution is imbalanced. Consider creating more listings for underrepresented categories.
                          </Alert>
                        ) : (
                          <Alert severity="success" sx={{ mt: 2 }}>
                            Good category balance! All contexts are well represented.
                          </Alert>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Real-time Listing Creation Cards */}
        {automationListings.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏗️ Live Listings Creation ({automationListings.length})
              </Typography>
              <Grid container spacing={2}>
                {automationListings.map((listing) => (
                  <Grid item xs={12} md={6} key={listing.listingId}>
                    <Card variant="outlined" sx={{ 
                      border: listing.success ? '2px solid #4CAF50' : listing.error ? '2px solid #F44336' : '1px solid #ddd'
                    }}>
                      <CardContent>
                        <Stack direction="row" spacing={2}>
                          {/* Image Preview */}
                          <Box sx={{ position: 'relative' }}>
                            {listing.imageData?.processedImage?.dataUrl ? (
                              <Box>
                                <img 
                                  src={listing.imageData.processedImage.dataUrl}
                                  alt={listing.imageData.caption || 'Wave art'}
                                  style={{ 
                                    width: 80, 
                                    height: 80, 
                                    objectFit: 'cover', 
                                    borderRadius: 8,
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => setExpandedImage(listing.imageData.processedImage.dataUrl)}
                                />
                                <IconButton
                                  size="small"
                                  sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.7)' }}
                                  onClick={() => setExpandedImage(listing.imageData.processedImage.dataUrl)}
                                >
                                  <ZoomIn sx={{ color: 'white', fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box 
                                sx={{ 
                                  width: 80, 
                                  height: 80, 
                                  bgcolor: '#f5f5f5', 
                                  borderRadius: 1, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center' 
                                }}
                              >
                                <Waves color="disabled" />
                              </Box>
                            )}
                          </Box>

                          {/* Listing Details */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {listing.productCopy?.title || listing.listingId}
                            </Typography>
                            
                            {listing.imageData?.caption && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                "{listing.imageData.caption}"
                              </Typography>
                            )}

                            {/* Product Description */}
                            {listing.productCopy?.description && (
                              <Box sx={{ mt: 1, p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                  Description:
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ mt: 0.5, maxHeight: 60, overflow: 'auto' }}>
                                  {listing.productCopy.description}
                                </Typography>
                              </Box>
                            )}

                            {/* Step Progress */}
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Tooltip title="Generate Image">
                                <Box><StepStatus status={listing.steps.generating_image} /></Box>
                              </Tooltip>
                              <Tooltip title="Create Copy">
                                <Box><StepStatus status={listing.steps.creating_copy} /></Box>
                              </Tooltip>
                              <Tooltip title="Create Product">
                                <Box><StepStatus status={listing.steps.creating_product} /></Box>
                              </Tooltip>
                              <Tooltip title="Publish to Shopify">
                                <Box><StepStatus status={listing.steps.publishing_shopify} /></Box>
                              </Tooltip>
                            </Stack>

                            {/* Actions */}
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              {listing.printifyUrl && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<OpenInNew />}
                                  onClick={() => window.open(listing.printifyUrl, '_blank')}
                                >
                                  View Product
                                </Button>
                              )}
                              
                              {listing.success && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<RemoveCircle />}
                                  onClick={() => handleRemoveListing(listing)}
                                >
                                  Remove
                                </Button>
                              )}
                            </Stack>

                            {/* Error Display */}
                            {listing.error && (
                              <Alert severity="error" sx={{ mt: 1 }}>
                                <Typography variant="caption">{listing.error}</Typography>
                              </Alert>
                            )}
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

        {/* Image Enlargement Dialog */}
        <Dialog 
          open={!!expandedImage} 
          onClose={() => setExpandedImage(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent sx={{ p: 0 }}>
            {expandedImage && (
              <img 
                src={expandedImage}
                alt="Enlarged wave art"
                style={{ width: '100%', height: 'auto' }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExpandedImage(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmationDialog} onClose={() => setConfirmationDialog(false)}>
          <DialogTitle sx={{ color: '#D32F2F' }}>
            ⚠️ Confirm Automation Start
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to start <strong>{AUTOMATION_SCALES[selectedScale].name}</strong> automation?
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              This will automatically:
              <br />• Generate wave images with captions
              <br />• Create SEO-optimized product listings
              <br />• Upload to Printify and publish to Shopify
              <br />• Respect all API rate limits
              <br />• Enhanced error handling for overnight operation
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmationDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleStartAutomationWithErrorHandling}
              startIcon={<Emergency />}
            >
              YES, START AUTOMATION
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Delete Dialog */}
        <Dialog open={bulkDeleteDialog} onClose={() => setBulkDeleteDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: '#D32F2F' }}>
            ⚠️ Bulk Delete All Listings
          </DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              <strong>DANGER:</strong> This will permanently delete ALL automation-created products from Printify.
            </Alert>
            <Typography gutterBottom>
              Products to delete:
              <br />• Automation listings: {automationListings.filter(l => l.printifyId).length}
              <br />• Created products: {createdProducts.length}
              <br />• Total: {automationListings.filter(l => l.printifyId).length + createdProducts.length}
            </Typography>
            <TextField
              fullWidth
              label='Type "DELETE ALL LISTINGS" to confirm'
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              sx={{ mt: 2 }}
              error={confirmPhrase !== '' && confirmPhrase !== 'DELETE ALL LISTINGS'}
              helperText={confirmPhrase !== '' && confirmPhrase !== 'DELETE ALL LISTINGS' ? 'Phrase must match exactly' : ''}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setBulkDeleteDialog(false); setConfirmPhrase(''); }}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleBulkDeleteListings}
              disabled={confirmPhrase !== 'DELETE ALL LISTINGS' || bulkDeleteLoading}
              startIcon={bulkDeleteLoading ? <Refresh /> : <Delete />}
            >
              {bulkDeleteLoading ? 'Deleting...' : 'DELETE ALL LISTINGS'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Dialog */}
        <Dialog open={!!errorDialog} onClose={() => setErrorDialog(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ color: errorDialog?.title?.includes('Failed') ? '#D32F2F' : '#1976D2' }}>
            {errorDialog?.title || 'Error'}
          </DialogTitle>
          <DialogContent>
            {errorDialog?.showHistory ? (
              <Box>
                <Typography gutterBottom>
                  Error history ({errorHistory.length} total errors):
                </Typography>
                <Stack spacing={1} sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {errorHistory.map((error, index) => (
                    <Paper key={index} sx={{ p: 2, bgcolor: error.critical ? '#FFEBEE' : '#F5F5F5' }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(error.timestamp).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {error.action}
                      </Typography>
                      <Typography variant="body2">
                        {error.error}
                      </Typography>
                      {error.listingId && (
                        <Typography variant="caption">
                          Listing: {error.listingId}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Box>
            ) : (
              <Typography>{errorDialog?.message}</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setErrorDialog(null)}>Close</Button>
            {errorDialog?.showHistory && (
              <Button
                variant="outlined"
                onClick={() => {
                  setErrorHistory([]);
                  setErrorDialog(null);
                }}
              >
                Clear History
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Automation Summary Dialog */}
        <Dialog open={showSummaryDialog} onClose={() => setShowSummaryDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ bgcolor: '#E8F5E8', color: '#2E7D32' }}>
            ✅ Automation Complete - Session Summary
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {automationSummary && (
              <Grid container spacing={3}>
                {/* Performance Overview */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">📊 Performance Metrics</Typography>
                      <Stack spacing={1}>
                        <Typography><strong>Completed:</strong> {automationSummary.performance.completed} listings</Typography>
                        <Typography><strong>Errors:</strong> {automationSummary.performance.errors}</Typography>
                        <Typography><strong>Success Rate:</strong> {automationSummary.performance.successRate}%</Typography>
                        <Typography><strong>Duration:</strong> {automationSummary.performance.duration}</Typography>
                        <Typography><strong>Avg per Listing:</strong> {automationSummary.performance.avgTimePerListing}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Session: {automationSummary.performance.startTime} → {automationSummary.performance.endTime}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 3-Day Capacity Projection */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ bgcolor: '#FFF3E0' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: '#F57C00' }}>🌙 3-Day Overnight Capacity</Typography>
                      <Stack spacing={1}>
                        <Typography><strong>🎯 Realistic Estimate:</strong> {automationSummary.threeDayCapacity.realistic} listings</Typography>
                        <Typography><strong>🛡️ Conservative Estimate:</strong> {automationSummary.threeDayCapacity.conservative} listings</Typography>
                        <Typography><strong>⚡ Theoretical Max:</strong> {automationSummary.threeDayCapacity.theoretical} listings</Typography>
                        <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: '#FFF8E1', borderRadius: 1 }}>
                          <strong>Rate:</strong> {automationSummary.threeDayCapacity.breakdown.listingsPerHour}/hour, 
                          {automationSummary.threeDayCapacity.breakdown.listingsPerDay}/day
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Accounts for API limits, downtime, and system efficiency
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Category Distribution */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="secondary">📈 Category Distribution</Typography>
                      <Grid container spacing={1}>
                        {Object.entries(automationSummary.distribution.byContext).map(([context, count]) => (
                          <Grid size={{ xs: 6 }} key={context}>
                            <Typography variant="body2">
                              <strong>{context}:</strong> {count} ({automationSummary.distribution.percentages[context]}%)
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                      <Alert severity={automationSummary.distribution.isBalanced ? 'success' : 'warning'} sx={{ mt: 1 }}>
                        Distribution is {automationSummary.distribution.isBalanced ? 'well balanced' : 'imbalanced'}
                      </Alert>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Duplicate Prevention Data */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">🔍 Duplicate Prevention</Typography>
                      <Typography variant="body2" gutterBottom>Created Products ({automationSummary.createdProducts.length}):</Typography>
                      <Box sx={{ maxHeight: 120, overflow: 'auto', bgcolor: '#F5F5F5', p: 1, borderRadius: 1 }}>
                        {automationSummary.createdProducts.map((product, index) => (
                          <Typography key={index} variant="caption" display="block">
                            ID: {product.id} | {product.context} | "{product.caption?.substring(0, 30)}..."
                          </Typography>
                        ))}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Use this data to detect duplicates before future runs
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Error Summary */}
                {automationSummary.errors.total > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Card sx={{ bgcolor: '#FFEBEE' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#C62828' }}>⚠️ Error Summary</Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography><strong>Total Errors:</strong> {automationSummary.errors.total}</Typography>
                            <Typography><strong>Critical Errors:</strong> {automationSummary.errors.critical}</Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2"><strong>By Type:</strong></Typography>
                            {Object.entries(automationSummary.errors.byType).map(([type, count]) => (
                              <Typography key={type} variant="caption" display="block">
                                {type}: {count}
                              </Typography>
                            ))}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Session Metadata */}
                <Grid size={{ xs: 12 }}>
                  <Card sx={{ bgcolor: '#F3E5F5' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: '#7B1FA2' }}>📋 Session Details</Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography><strong>Scale:</strong> {automationSummary.metadata.scale}</Typography>
                          <Typography><strong>Session ID:</strong> {automationSummary.metadata.sessionId}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography><strong>Total Listings Ever:</strong> {automationSummary.metadata.totalListingsEver}</Typography>
                          <Typography><strong>Automation Listings Ever:</strong> {automationSummary.metadata.automationListingsEver}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            This session added {automationSummary.performance.completed} listings to your permanent collection.
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                // Export summary as JSON for record keeping
                const dataStr = JSON.stringify(automationSummary, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `automation-summary-${Date.now()}.json`;
                link.click();
              }}
              startIcon={<Download />}
            >
              Export Summary
            </Button>
            <Button onClick={() => setShowSummaryDialog(false)} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (currentTab) {
      case 0: return <DashboardTab />;
      case 1: return <GenerateTab />;
      case 2: return <ReviewTab />;
      case 3: return <ListingsTab />;
      case 4: return <PublishTab />;
      case 5: return <AutomationTab />;
      default: return <DashboardTab />;
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

      {/* Cross-Tab Automation Status Banner */}
      {automationProgress?.isRunning && currentTab !== 5 && (
        <Alert 
          severity="info" 
          variant="filled"
          sx={{ 
            m: 2, 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: '#1976d2',
            '& .MuiAlert-icon': { fontSize: '1.5rem' }
          }}
          icon={<Emergency />}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={`${automationProgress.completed}/${AUTOMATION_SCALES[selectedScale].count === Infinity ? '∞' : AUTOMATION_SCALES[selectedScale].count}`}
                color="secondary"
                size="small"
              />
              <Button 
                color="inherit" 
                size="small"
                onClick={() => setCurrentTab(5)}
                sx={{ color: 'white', borderColor: 'white' }}
                variant="outlined"
              >
                View Gallery
              </Button>
              <Button 
                color="inherit" 
                size="small"
                onClick={handleStopAutomation}
                sx={{ color: 'white', borderColor: 'white' }}
                variant="outlined"
              >
                Stop
              </Button>
            </Box>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            🚀 {selectedScale} Automation Running - {automationProgress.currentStep} - {automationProgress.completed} completed, {automationProgress.errors} errors
          </Typography>
        </Alert>
      )}

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
                    bgcolor: index === 5 ? '#FFEBEE' : 'transparent', // Red background for emergency tab
                    '&.Mui-selected': {
                      bgcolor: index === 5 ? '#FFCDD2' : '#E3F2FD'
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

        {/* Large Automation Gallery Modal */}
        <Dialog
          open={showAutomationGallery}
          onClose={() => setShowAutomationGallery(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              height: '90vh',
              maxHeight: '90vh',
              bgcolor: 'background.default'
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Emergency sx={{ mr: 1 }} />
              <Typography variant="h6">
                {selectedScale} Automation Gallery
              </Typography>
              {automationProgress && (
                <Chip 
                  label={`${automationProgress.completed}/${AUTOMATION_SCALES[selectedScale].count === Infinity ? '∞' : AUTOMATION_SCALES[selectedScale].count}`}
                  color="secondary"
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {automationProgress?.isRunning && (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleStopAutomation}
                  startIcon={<Pause />}
                  sx={{ mr: 1 }}
                >
                  Stop
                </Button>
              )}
              <IconButton
                onClick={() => setShowAutomationGallery(false)}
                sx={{ color: 'white' }}
              >
                <Add sx={{ transform: 'rotate(45deg)' }} />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 3, overflow: 'auto' }}>
            {/* Automation Progress Bar */}
            {automationProgress && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {automationProgress.currentStep} - {automationProgress.completed} completed, {automationProgress.errors} errors
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={AUTOMATION_SCALES[selectedScale].count !== Infinity 
                    ? (automationProgress.completed / AUTOMATION_SCALES[selectedScale].count) * 100 
                    : 0
                  }
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            )}

            {/* Live Gallery Grid - Latest First */}
            <Grid container spacing={1.5}>
              {[...automationListings].reverse().map((listing, reversedIndex) => {
                const originalIndex = automationListings.length - 1 - reversedIndex;
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={listing.listingId || originalIndex}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: 280, // Fixed smaller height
                      border: listing.success ? '1px solid #4CAF50' : listing.error ? '1px solid #F44336' : '1px solid #FF9800',
                      position: 'relative',
                      overflow: 'visible',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        elevation: 4
                      }
                    }}
                  >
                    {/* Status Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        zIndex: 10
                      }}
                    >
                      <Badge
                        color={listing.success ? 'success' : listing.error ? 'error' : 'warning'}
                        variant="dot"
                        sx={{
                          '& .MuiBadge-dot': {
                            width: 16,
                            height: 16,
                            borderRadius: '50%'
                          }
                        }}
                      >
                        <Chip
                          label={`#${originalIndex + 1}`}
                          size="small"
                          color={listing.success ? 'success' : listing.error ? 'error' : 'warning'}
                        />
                      </Badge>
                    </Box>

                    <CardContent sx={{ p: 1.5 }}>
                      {/* Image Preview */}
                      {listing.imageData?.processedImage?.dataUrl && (
                        <Box
                          component="img"
                          src={listing.imageData.processedImage.dataUrl}
                          alt={listing.imageData?.caption || 'Generated image'}
                          sx={{
                            width: '100%',
                            height: 80, // Smaller image
                            objectFit: 'cover',
                            borderRadius: 1,
                            mb: 1
                          }}
                        />
                      )}

                      {/* Title */}
                      {listing.productCopy?.title && (
                        <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                          {listing.productCopy.title.substring(0, 35)}
                          {listing.productCopy.title.length > 35 && '...'}
                        </Typography>
                      )}

                      {/* Caption */}
                      {listing.imageData?.caption && (
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                          "{listing.imageData.caption.replace(/[\[\]]/g, '').substring(0, 30)}"
                          {listing.imageData.caption.replace(/[\[\]]/g, '').length > 30 && '...'}
                        </Typography>
                      )}

                      {/* Context & Progress */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 0.5 }}>
                        <Chip 
                          label={listing.imageData?.context || 'unknown'} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                        {listing.printifyId && (
                          <Chip 
                            label={listing.printifyId} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.6rem', height: 18 }}
                          />
                        )}
                      </Box>

                      {/* Step Progress */}
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {Object.entries(listing.steps || {}).map(([step, status]) => (
                            <Box
                              key={step}
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: 
                                  status === 'completed' ? '#4CAF50' :
                                  status === 'in_progress' ? '#FF9800' :
                                  status === 'error' ? '#F44336' : '#E0E0E0'
                              }}
                              title={`${step}: ${status}`}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Action Buttons */}
                      {listing.printifyUrl && (
                        <Button
                          size="small"
                          variant="outlined"
                          href={listing.printifyUrl}
                          target="_blank"
                          sx={{ mt: 1, width: '100%', fontSize: '0.7rem', py: 0.5 }}
                        >
                          View
                        </Button>
                      )}

                      {/* Error Display */}
                      {listing.error && (
                        <Alert severity="error" sx={{ mt: 0.5, py: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                            {listing.error.substring(0, 50)}
                            {listing.error.length > 50 && '...'}
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                );
              })}

              {/* Empty State */}
              {automationListings.length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 300,
                      textAlign: 'center'
                    }}
                  >
                    <Emergency sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      Automation Starting...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your listings will appear here as they're created
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default WorkflowWaveApp;