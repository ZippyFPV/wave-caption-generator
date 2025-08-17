import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Stack,
  Alert,
  LinearProgress,
  Chip,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Emergency, 
  PlayArrow,
  Stop,
  Speed,
  Security,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';

const AutomationTab = ({
  automationProgress,
  selectedScale,
  setSelectedScale,
  confirmationDialog,
  setConfirmationDialog,
  handleStartAutomation,
  handleStopAutomation,
  AUTOMATION_SCALES,
  automationListings,
  showAutomationGallery,
  setShowAutomationGallery,
  automationSummary,
  showSummaryDialog,
  setShowSummaryDialog,
  StatusIndicator,
  tabStatuses,
  persistentMetrics
}) => (
  <Box>
    <Card sx={{ border: '2px solid #F44336', bgcolor: '#FFEBEE' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Emergency color="error" />
          <Typography variant="h6" color="error">
            AUTOMATION CONTROL CENTER
          </Typography>
          <StatusIndicator status={tabStatuses.automation} size="large" />
        </Stack>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>⚠️ AUTOMATED SYSTEM:</strong> This will automatically generate images, create Printify products, 
            and publish to your Shopify store. Monitor carefully and ensure your APIs are properly configured.
          </Typography>
        </Alert>

        {/* Automation Status */}
        {automationProgress && (
          <Card sx={{ mb: 3, bgcolor: automationProgress.isRunning ? '#E8F5E8' : '#FFF3E0' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  🚀 {selectedScale} Automation {automationProgress.isRunning ? 'Running' : 'Stopped'}
                </Typography>
                <Chip
                  label={automationProgress.isRunning ? 'ACTIVE' : 'INACTIVE'}
                  color={automationProgress.isRunning ? 'success' : 'default'}
                />
              </Stack>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Progress:</strong> {automationProgress.completed} completed, {automationProgress.errors} errors
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Current Step:</strong> {automationProgress.currentStep}
              </Typography>
              
              {automationProgress.isRunning && AUTOMATION_SCALES[selectedScale].count !== Infinity && (
                <LinearProgress 
                  variant="determinate" 
                  value={(automationProgress.completed / AUTOMATION_SCALES[selectedScale].count) * 100}
                  sx={{ mb: 1 }}
                />
              )}
              
              {automationProgress.estimatedCompletion && (
                <Typography variant="caption" color="text.secondary">
                  Estimated completion: {new Date(automationProgress.estimatedCompletion).toLocaleTimeString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Automation Controls */}
        <Stack spacing={3}>
          {/* Scale Selection */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚙️ Automation Configuration
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Automation Scale</InputLabel>
                <Select
                  value={selectedScale}
                  onChange={(e) => setSelectedScale(e.target.value)}
                  disabled={automationProgress?.isRunning}
                >
                  {Object.entries(AUTOMATION_SCALES).map(([key, scale]) => (
                    <MenuItem key={key} value={key}>
                      <Stack>
                        <Typography variant="body1">{scale.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {scale.description}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Paper sx={{ p: 2, bgcolor: '#F8F9FA' }}>
                <Typography variant="body2">
                  <strong>Selected:</strong> {AUTOMATION_SCALES[selectedScale]?.name} - {AUTOMATION_SCALES[selectedScale]?.description}
                </Typography>
              </Paper>
            </CardContent>
          </Card>

          {/* Control Buttons */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎮 Automation Controls
              </Typography>
              
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {!automationProgress?.isRunning ? (
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={() => setConfirmationDialog(true)}
                    sx={{ minWidth: 200 }}
                  >
                    START {selectedScale} AUTOMATION
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="warning"
                    size="large"
                    startIcon={<Stop />}
                    onClick={handleStopAutomation}
                    sx={{ minWidth: 200 }}
                  >
                    STOP AUTOMATION
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  onClick={() => window.open('http://localhost:3001/health', '_blank')}
                >
                  System Health Check
                </Button>
              </Stack>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {automationProgress?.isRunning 
                    ? "Automation is running. You can safely navigate between tabs - progress will continue."
                    : "Ready to start automation. Ensure your Pexels and Printify APIs are configured correctly."
                  }
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          {/* Live Automation Gallery Toggle */}
          {automationListings.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">
                    🏗️ Live Automation Gallery ({automationListings.length})
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showAutomationGallery}
                        onChange={(e) => setShowAutomationGallery(e.target.checked)}
                      />
                    }
                    label="Show Gallery"
                  />
                </Stack>
                
                {showAutomationGallery && (
                  <Grid container spacing={2}>
                    {automationListings.slice(-6).map((listing, index) => (
                      <Grid item xs={6} md={4} lg={2} key={listing.listingId || index}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent sx={{ p: 1 }}>
                            {listing.imageData && (
                              <img 
                                src={listing.imageData.processedImage.dataUrl}
                                alt={listing.imageData.caption}
                                style={{ 
                                  width: '100%', 
                                  height: 80, 
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  marginBottom: 4
                                }}
                              />
                            )}
                            <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem', mb: 0.5 }}>
                              {listing.productCopy?.title?.substring(0, 30) || 'Processing...'}
                            </Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              {listing.success ? (
                                <CheckCircle sx={{ color: '#4CAF50', fontSize: 12 }} />
                              ) : listing.error ? (
                                <Error sx={{ color: '#F44336', fontSize: 12 }} />
                              ) : (
                                <Warning sx={{ color: '#FF9800', fontSize: 12 }} />
                              )}
                              <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                                {listing.success ? 'Done' : listing.error ? 'Error' : 'Processing'}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          )}

          {/* Automation Statistics */}
          <Paper sx={{ p: 2, bgcolor: '#F5F5F5' }}>
            <Typography variant="subtitle2" gutterBottom>
              📊 Automation Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Session Progress:</strong> {automationProgress?.completed || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Session Errors:</strong> {automationProgress?.errors || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>All-Time Automation:</strong> {persistentMetrics.automation}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Success Rate:</strong> {persistentMetrics.successRate}%
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </CardContent>
    </Card>

    {/* Confirmation Dialog */}
    <Dialog open={confirmationDialog} onClose={() => setConfirmationDialog(false)}>
      <DialogTitle>🚨 Confirm Automation Start</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            You are about to start <strong>{AUTOMATION_SCALES[selectedScale]?.name}</strong> automation.
            This will automatically:
          </Typography>
        </Alert>
        <Typography variant="body2" component="div" sx={{ ml: 2 }}>
          • Generate wave images from Pexels<br/>
          • Create SEO-optimized product copy<br/>
          • Upload to Printify and create products<br/>
          • Publish to your Shopify store<br/>
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
          Are you sure you want to proceed?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmationDialog(false)}>
          Cancel
        </Button>
        <Button 
          color="error" 
          variant="contained"
          onClick={() => {
            handleStartAutomation();
            setConfirmationDialog(false);
          }}
        >
          START AUTOMATION
        </Button>
      </DialogActions>
    </Dialog>

    {/* Summary Dialog */}
    <Dialog 
      open={showSummaryDialog} 
      onClose={() => setShowSummaryDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>📊 Automation Complete</DialogTitle>
      <DialogContent>
        {automationSummary && (
          <Stack spacing={2}>
            <Typography variant="h6">Summary</Typography>
            <Typography variant="body2">
              <strong>Completed:</strong> {automationSummary.completed} listings
            </Typography>
            <Typography variant="body2">
              <strong>Errors:</strong> {automationSummary.errors}
            </Typography>
            <Typography variant="body2">
              <strong>Success Rate:</strong> {automationSummary.completed > 0 ? 
                Math.round((automationSummary.completed / (automationSummary.completed + automationSummary.errors)) * 100) : 0}%
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowSummaryDialog(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);

export default AutomationTab;