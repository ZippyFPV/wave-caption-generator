import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  CheckCircle, 
  Error, 
  Edit, 
  ZoomIn, 
  Delete,
  Visibility,
  ExpandMore
} from '@mui/icons-material';

const ReviewTab = ({
  batchMode,
  setBatchMode,
  selectedImages,
  setSelectedImages,
  approvedImages,
  _setApprovedImages,  // TODO: implement approval management
  deletedImages,
  _setDeletedImages,  // TODO: implement deletion management
  processedImages,
  handleBatchApproval,
  handleImageApproval,
  handleImageEdit,
  handleImageDelete,
  expandedImage,
  setExpandedImage,
  _editDialog,  // TODO: implement edit dialog
  _setEditDialog,  // TODO: implement edit dialog
  _StatusIndicator,  // TODO: implement status display
  _tabStatuses
}) => (
  <Box>
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Visibility color="primary" />
          <Typography variant="h6">Review & Approve Images</Typography>
          {/* StatusIndicator TODO */}
        </Stack>

        {/* Batch Controls */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <FormControlLabel
            control={
              <Switch
                checked={batchMode}
                onChange={(e) => setBatchMode(e.target.checked)}
              />
            }
            label="Batch Selection Mode"
          />
          
          {batchMode && selectedImages.length > 0 && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleBatchApproval('approve')}
              >
                Approve {selectedImages.length}
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleBatchApproval('reject')}
              >
                Reject {selectedImages.length}
              </Button>
            </Stack>
          )}
        </Stack>

        {/* Status Summary */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Images:</strong> {processedImages.length} Generated, {approvedImages.length} Approved, {deletedImages.length} Rejected
            {batchMode && selectedImages.length > 0 && (
              <span> | <strong>{selectedImages.length} Selected</strong></span>
            )}
          </Typography>
        </Alert>

        {/* Image Grid */}
        {processedImages.length === 0 ? (
          <Alert severity="warning">
            No images to review. Generate images first in the Generate tab.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {processedImages
              .filter(img => !deletedImages.includes(img.id))
              .map((image) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      position: 'relative',
                      border: selectedImages.includes(image.id) ? '2px solid #2196F3' : '1px solid #E0E0E0',
                      cursor: batchMode ? 'pointer' : 'default'
                    }}
                    onClick={() => {
                      if (batchMode) {
                        setSelectedImages(prev => 
                          prev.includes(image.id) 
                            ? prev.filter(id => id !== image.id)
                            : [...prev, image.id]
                        );
                      }
                    }}
                  >
                    {/* Status Indicator */}
                    <Chip
                      label={
                        approvedImages.includes(image.id) ? 'Approved' :
                        selectedImages.includes(image.id) ? 'Selected' : 'Pending'
                      }
                      size="small"
                      color={
                        approvedImages.includes(image.id) ? 'success' :
                        selectedImages.includes(image.id) ? 'primary' : 'default'
                      }
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        left: 8, 
                        zIndex: 1,
                        fontSize: '10px'
                      }}
                    />

                    {/* Image */}
                    <Box sx={{ position: 'relative' }}>
                      <img 
                        src={image.processed} 
                        alt={image.caption}
                        style={{ 
                          width: '100%', 
                          height: 200, 
                          objectFit: 'cover' 
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedImage(image);
                        }}
                      >
                        <ZoomIn sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>

                    {/* Image Details */}
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>
                        "{image.caption}"
                      </Typography>
                      
                      <Stack direction="row" spacing={1} justifyContent="space-between">
                        <Stack direction="row" spacing={0.5}>
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageApproval(image.id, 'approve');
                            }}
                          >
                            <CheckCircle sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageDelete(image.id);
                            }}
                          >
                            <Delete sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageEdit(image);
                            }}
                          >
                            <Edit sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Stack>
                        
                        <Chip
                          label={image.metadata?.persona?.replace('_', ' ') || 'General'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </CardContent>
    </Card>

    {/* Expanded Image Dialog */}
    <Dialog 
      open={!!expandedImage} 
      onClose={() => setExpandedImage(null)}
      maxWidth="md"
      fullWidth
    >
      {expandedImage && (
        <>
          <DialogTitle>
            Image Preview
          </DialogTitle>
          <DialogContent>
            <img 
              src={expandedImage.processed} 
              alt={expandedImage.caption}
              style={{ width: '100%', height: 'auto' }}
            />
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>Caption:</strong> "{expandedImage.caption}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Persona:</strong> {expandedImage.metadata?.persona?.replace('_', ' ') || 'General'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExpandedImage(null)}>Close</Button>
            <Button 
              color="success" 
              onClick={() => {
                handleImageApproval(expandedImage.id, 'approve');
                setExpandedImage(null);
              }}
            >
              Approve
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  </Box>
);

export default ReviewTab;