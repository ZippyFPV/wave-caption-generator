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
  IconButton,
  Link
} from '@mui/material';
import { 
  Store, 
  CheckCircle, 
  Error, 
  Warning,
  OpenInNew,
  Delete,
  Refresh
} from '@mui/icons-material';

const ListingsTab = ({
  approvedImages,
  creatingListings,
  _setCreatingListings,  // TODO: implement loading state
  createdProducts,
  _setCreatedProducts,  // TODO: implement product management
  listingProgress,
  _setListingProgress,  // TODO: implement progress tracking
  createPrintifyListings,
  handleProductDelete,
  handleRefreshProducts,
  _StatusIndicator,  // TODO: implement status display
  tabStatuses,
  persistentMetrics
}) => (
  <Box>
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Store color="primary" />
          <Typography variant="h6">Create Printify Listings</Typography>
          {/* StatusIndicator TODO */}
        </Stack>

        {/* Status Summary */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Ready for Listings:</strong> {approvedImages.length} images | 
            <strong> Created Products:</strong> {createdProducts.length} | 
            <strong> All-Time Created:</strong> {persistentMetrics.total}
          </Typography>
        </Alert>

        {/* Main Actions */}
        <Stack spacing={3}>
          {/* Create Listings Section */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📦 Create New Listings
              </Typography>
              
              {approvedImages.length === 0 ? (
                <Alert severity="warning">
                  No approved images available. Review and approve images first in the Review tab.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  <Typography variant="body2">
                    Create Printify products for your {approvedImages.length} approved images.
                    Each image will become a professional poster listing.
                  </Typography>
                  
                  <Button
                    variant="contained"
                    size="large"
                    onClick={createPrintifyListings}
                    disabled={creatingListings || approvedImages.length === 0}
                    startIcon={<Store />}
                    sx={{ maxWidth: 300 }}
                  >
                    Create {approvedImages.length} Listings
                  </Button>
                  
                  {creatingListings && (
                    <Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(listingProgress / approvedImages.length) * 100} 
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Creating listing {listingProgress} of {approvedImages.length}...
                      </Typography>
                    </Box>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Created Products */}
          {createdProducts.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">
                    🏪 Created Products ({createdProducts.length})
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={handleRefreshProducts}
                  >
                    Refresh
                  </Button>
                </Stack>
                
                <Grid container spacing={2}>
                  {createdProducts.map((product, index) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id || index}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 2 }}>
                          {/* Product Image */}
                          {product.images && product.images[0] && (
                            <img 
                              src={product.images[0].src}
                              alt={product.title}
                              style={{ 
                                width: '100%', 
                                height: 120, 
                                objectFit: 'cover',
                                borderRadius: '4px',
                                marginBottom: 8
                              }}
                            />
                          )}
                          
                          {/* Product Info */}
                          <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                            {product.title}
                          </Typography>
                          
                          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                            <Chip
                              label={product.published ? 'Published' : 'Draft'}
                              size="small"
                              color={product.published ? 'success' : 'warning'}
                              sx={{ fontSize: '0.7rem' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              ID: {product.id}
                            </Typography>
                          </Stack>
                          
                          {/* Actions */}
                          <Stack direction="row" spacing={0.5} justifyContent="space-between">
                            <Stack direction="row" spacing={0.5}>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => window.open(`https://printify.com/app/products/${product.id}`, '_blank')}
                              >
                                <OpenInNew sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleProductDelete(product.id)}
                              >
                                <Delete sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Stack>
                            
                            {product.published ? (
                              <CheckCircle sx={{ color: '#4CAF50', fontSize: 16 }} />
                            ) : (
                              <Warning sx={{ color: '#FF9800', fontSize: 16 }} />
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Paper sx={{ p: 2, bgcolor: '#F5F5F5' }}>
            <Typography variant="subtitle2" gutterBottom>
              📊 Listing Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Session Created:</strong> {createdProducts.length}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>All-Time Total:</strong> {persistentMetrics.total}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Success Rate:</strong> {persistentMetrics.successRate}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Published:</strong> {persistentMetrics.published}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </CardContent>
    </Card>
  </Box>
);

export default ListingsTab;