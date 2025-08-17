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
  Chip,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  Publish, 
  CheckCircle, 
  Error, 
  Warning,
  OpenInNew,
  Delete,
  RemoveCircle
} from '@mui/icons-material';

const PublishTab = ({
  createdProducts,
  handleBulkPublish,
  handleProductPublish,
  handleProductDelete,
  bulkDeleteDialog,
  setBulkDeleteDialog,
  bulkDeleteLoading,
  _setBulkDeleteLoading,  // TODO: implement bulk delete UI
  confirmPhrase,
  setConfirmPhrase,
  handleBulkDelete,
  _StatusIndicator,  // TODO: implement status display
  tabStatuses,
  persistentMetrics
}) => (
  <Box>
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Publish color="primary" />
          <Typography variant="h6">Publish to Shopify Store</Typography>
          <StatusIndicator status={tabStatuses.publish} size="large" />
        </Stack>

        {/* Status Summary */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Created Products:</strong> {createdProducts.length} | 
            <strong> Published:</strong> {createdProducts.filter(p => p.published).length} | 
            <strong> Draft:</strong> {createdProducts.filter(p => !p.published).length}
          </Typography>
        </Alert>

        {/* Main Actions */}
        <Stack spacing={3}>
          {/* Bulk Operations */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚡ Bulk Operations
              </Typography>
              
              {createdProducts.length === 0 ? (
                <Alert severity="warning">
                  No products available. Create listings first in the Listings tab.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Button
                      variant="contained"
                      startIcon={<Publish />}
                      onClick={handleBulkPublish}
                      disabled={createdProducts.filter(p => !p.published).length === 0}
                    >
                      Publish All Drafts ({createdProducts.filter(p => !p.published).length})
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RemoveCircle />}
                      onClick={() => setBulkDeleteDialog(true)}
                      disabled={createdProducts.length === 0}
                    >
                      Bulk Delete All
                    </Button>
                  </Stack>
                  
                  <Paper sx={{ p: 2, bgcolor: '#FFF3E0' }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Note:</strong> Publishing will make your products live on your Shopify store. 
                      Make sure to review all products before publishing.
                    </Typography>
                  </Paper>
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Product Management */}
          {createdProducts.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏪 Product Management ({createdProducts.length})
                </Typography>
                
                <Grid container spacing={2}>
                  {createdProducts.map((product, index) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id || index}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          border: product.published ? '2px solid #4CAF50' : '1px solid #E0E0E0'
                        }}
                      >
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
                          
                          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
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
                          
                          {/* Individual Actions */}
                          <Stack spacing={1}>
                            {!product.published && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<Publish />}
                                onClick={() => handleProductPublish(product.id)}
                                fullWidth
                              >
                                Publish Now
                              </Button>
                            )}
                            
                            <Stack direction="row" spacing={0.5} justifyContent="center">
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
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Publishing Statistics */}
          <Paper sx={{ p: 2, bgcolor: '#F5F5F5' }}>
            <Typography variant="subtitle2" gutterBottom>
              📊 Publishing Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Session Published:</strong> {createdProducts.filter(p => p.published).length}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>All-Time Published:</strong> {persistentMetrics.published}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Success Rate:</strong> {persistentMetrics.successRate}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Total Revenue Potential:</strong> $${(createdProducts.length * 19.99).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </CardContent>
    </Card>

    {/* Bulk Delete Confirmation Dialog */}
    <Dialog open={bulkDeleteDialog} onClose={() => setBulkDeleteDialog(false)}>
      <DialogTitle>⚠️ Confirm Bulk Delete</DialogTitle>
      <DialogContent>
        <Alert severity="error" sx={{ mb: 2 }}>
          This will permanently delete ALL {createdProducts.length} products from Printify. This action cannot be undone.
        </Alert>
        <Typography variant="body2" sx={{ mb: 2 }}>
          To confirm, please type <strong>"DELETE ALL LISTINGS"</strong> below:
        </Typography>
        <TextField
          fullWidth
          value={confirmPhrase}
          onChange={(e) => setConfirmPhrase(e.target.value)}
          placeholder="DELETE ALL LISTINGS"
          disabled={bulkDeleteLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => {
            setBulkDeleteDialog(false);
            setConfirmPhrase('');
          }}
          disabled={bulkDeleteLoading}
        >
          Cancel
        </Button>
        <Button 
          color="error"
          onClick={handleBulkDelete}
          disabled={confirmPhrase !== 'DELETE ALL LISTINGS' || bulkDeleteLoading}
        >
          {bulkDeleteLoading ? 'Deleting...' : 'Delete All'}
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);

export default PublishTab;