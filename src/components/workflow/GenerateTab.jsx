import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  LinearProgress,
  Typography,
  Stack,
  Alert
} from '@mui/material';
import { Waves, CheckCircle, Error, Edit } from '@mui/icons-material';
import ModeToggle from '../ui/ModeToggle';

const GenerateTab = ({
  batchMode,
  setBatchMode,
  _tabStatuses,
  fetchImages,
  loading,
  CONTENT_THEMES,
  error,
  imageStats,
  persistentMetrics,
  processedImages,
  handlePhraseApproval,
  handlePhraseEdit,
  approvedPhrases,
  rejectedPhrases,
  showPhraseHistory,
  setShowPhraseHistory,
  _StatusIndicator
}) => (
    <Box>
      <ModeToggle batchMode={batchMode} setBatchMode={setBatchMode} />
      
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Waves color="primary" />
            <Typography variant="h6">Wave Image Generation</Typography>
            {/* StatusIndicator TODO */}
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
                        onClick={() => setShowPhraseHistory(!showPhraseHistory)}
                      >
                        {showPhraseHistory ? 'Hide' : 'Show'} History
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

  export default GenerateTab;
