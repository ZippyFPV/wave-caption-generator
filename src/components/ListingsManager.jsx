import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, IconButton, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Alert, LinearProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Switch, Grid, Divider
} from '@mui/material';
import {
  Launch, Store, Delete, Refresh, Pause, PlayArrow, Stop,
  CheckCircle, Error, Warning, Info, Visibility, Edit, ContentCopy
} from '@mui/icons-material';

import { UI_CONSTANTS } from '../config/constants.js';
import { formatCurrency } from '../services/businessIntelligence.js';

const ListingsManager = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateCheck, setDuplicateCheck] = useState(true);
  const [pauseAutomation, setPauseAutomation] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  // Load existing listings from localStorage or API
  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      // Try to load from localStorage first
      const savedListings = localStorage.getItem('wave_listings');
      if (savedListings) {
        setListings(JSON.parse(savedListings));
      }
      
      // TODO: Add API call to fetch real Printify listings
      // const response = await fetch('/api/printify/products');
      // const apiListings = await response.json();
      // setListings(apiListings);
      
    } catch (err) {
      setError('Failed to load listings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshListings = () => {
    loadListings();
  };

  const handleDuplicateCheck = (event) => {
    setDuplicateCheck(event.target.checked);
    localStorage.setItem('duplicate_check_enabled', event.target.checked.toString());
  };

  const handlePauseAutomation = (event) => {
    setPauseAutomation(event.target.checked);
    localStorage.setItem('automation_paused', event.target.checked.toString());
  };

  const deleteListing = async (listingId) => {
    try {
      // Remove from local state
      const updatedListings = listings.filter(listing => listing.id !== listingId);
      setListings(updatedListings);
      localStorage.setItem('wave_listings', JSON.stringify(updatedListings));
      
      // TODO: Add API call to delete from Printify
      // await fetch(`/api/printify/products/${listingId}`, { method: 'DELETE' });
      
      setConfirmDialog(false);
    } catch (err) {
      setError('Failed to delete listing: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return UI_CONSTANTS.COLORS.SUCCESS;
      case 'draft': return UI_CONSTANTS.COLORS.WARNING;
      case 'failed': return UI_CONSTANTS.COLORS.ERROR;
      default: return UI_CONSTANTS.COLORS.TEXT.SECONDARY;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle />;
      case 'draft': return <Warning />;
      case 'failed': return <Error />;
      default: return <Info />;
    }
  };

  // Mock data for demonstration (remove when API is connected)
  const mockListings = [
    {
      id: '689c3246a85dd9b3d50e83e4',
      title: 'Ocean Wave Wall Art - Modern Coastal Print for Home & Office',
      status: 'published',
      productType: 'Premium Poster',
      price: '$19.99',
      profit: '$12.34',
      created: '2025-08-12T23:36:00Z',
      printifyUrl: 'https://printify.com/app/products/689c3246a85dd9b3d50e83e4',
      shopifyUrl: 'https://your-shop.myshopify.com/products/ocean-wave-wall-art',
      views: 23,
      sales: 0
    },
    {
      id: '689c324972ab96b9e90e6026',
      title: 'Wave Photography Print - Therapy & Mindfulness - Gallery Quality',
      status: 'published',
      productType: 'Premium Poster',
      price: '$19.99',
      profit: '$12.34',
      created: '2025-08-12T23:36:05Z',
      printifyUrl: 'https://printify.com/app/products/689c324972ab96b9e90e6026',
      shopifyUrl: 'https://your-shop.myshopify.com/products/wave-photography-print',
      views: 15,
      sales: 1
    }
  ];

  // Use mock data if no real listings (for demo)
  const displayListings = listings.length > 0 ? listings : mockListings;

  return (
    <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Controls - Compact */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: UI_CONSTANTS.COLORS.TEXT.PRIMARY }}>
                📋 Product Listings ({displayListings.length})
              </Typography>
              <IconButton onClick={refreshListings} size="small">
                <Refresh />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2} justifyContent="flex-end">
              <FormControlLabel
                control={<Switch checked={duplicateCheck} onChange={handleDuplicateCheck} size="small" />}
                label="Prevent Duplicates"
                sx={{ fontSize: '0.8rem' }}
              />
              <FormControlLabel
                control={<Switch checked={pauseAutomation} onChange={handlePauseAutomation} size="small" />}
                label="Pause Automation"
                sx={{ fontSize: '0.8rem' }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Status Alerts - Compact */}
        {error && (
          <Alert severity="error" sx={{ mt: 1, fontSize: '0.8rem', py: 0.5 }}>
            {error}
          </Alert>
        )}
        {pauseAutomation && (
          <Alert severity="warning" sx={{ mt: 1, fontSize: '0.8rem', py: 0.5 }}>
            <Pause sx={{ fontSize: '1rem', mr: 1 }} />
            Automation is paused. New products won't be created automatically.
          </Alert>
        )}
      </Box>

      {/* Listings Table - Scrollable */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {loading ? (
          <LinearProgress />
        ) : (
          <TableContainer component={Paper} sx={{ height: '100%', overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Price/Profit</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Performance</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayListings.map((listing) => (
                  <TableRow key={listing.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                          {listing.title.slice(0, 45)}...
                        </Typography>
                        <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY, fontSize: '0.7rem' }}>
                          ID: {listing.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(listing.status)}
                        label={listing.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(listing.status),
                          color: 'white',
                          fontSize: '0.7rem',
                          height: '24px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {listing.productType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {listing.price}
                        </Typography>
                        <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.SUCCESS, fontSize: '0.7rem' }}>
                          +{listing.profit}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                          {listing.views} views
                        </Typography>
                        <br />
                        <Typography variant="caption" sx={{ color: UI_CONSTANTS.COLORS.SUCCESS, fontSize: '0.7rem' }}>
                          {listing.sales} sales
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="View in Printify">
                          <IconButton
                            size="small"
                            onClick={() => window.open(listing.printifyUrl, '_blank')}
                          >
                            <Launch sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                        {listing.shopifyUrl && (
                          <Tooltip title="View in Shopify">
                            <IconButton
                              size="small"
                              onClick={() => window.open(listing.shopifyUrl, '_blank')}
                            >
                              <Store sx={{ fontSize: '1rem' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedListing(listing);
                              setConfirmDialog(true);
                            }}
                            sx={{ color: UI_CONSTANTS.COLORS.ERROR }}
                          >
                            <Delete sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Delete Product Listing</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedListing?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={() => deleteListing(selectedListing?.id)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListingsManager;