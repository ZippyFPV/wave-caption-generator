import React, { useState } from 'react';
import { 
  Box, Typography, Button, TextField, Alert, 
  Card as MuiCard, CardContent, CircularProgress,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { Search, ContentCopy, CheckCircle } from '@mui/icons-material';

import Card from './ui/Card.jsx';
import { UI_CONSTANTS } from '../config/constants.js';
import { findMyShopId } from '../utils/getShopId.js';

const ShopIdFinder = () => {
  const [apiToken, setApiToken] = useState(import.meta.env.VITE_PRINTIFY_API_TOKEN || '');
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState(null);
  const [error, setError] = useState('');
  const [copiedShopId, setCopiedShopId] = useState('');

  const handleFindShops = async () => {
    if (!apiToken.trim()) {
      setError('Please enter your Printify API token');
      return;
    }

    setLoading(true);
    setError('');
    setShops(null);

    try {
      const shopsData = await findMyShopId(apiToken);
      setShops(shopsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyShopId = async (shopId) => {
    try {
      await navigator.clipboard.writeText(shopId.toString());
      setCopiedShopId(shopId);
      setTimeout(() => setCopiedShopId(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyEnvLine = async (shopId) => {
    const envLine = `VITE_PRINTIFY_SHOP_ID=${shopId}`;
    try {
      await navigator.clipboard.writeText(envLine);
      setCopiedShopId(`env-${shopId}`);
      setTimeout(() => setCopiedShopId(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Typography variant="h5" sx={{ 
        color: UI_CONSTANTS.COLORS.TEXT.PRIMARY,
        fontWeight: 'bold',
        mb: 3,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1
      }}>
        <Search /> Find Your Shop ID
      </Typography>

      {/* API Token Input */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Printify API Token"
          type="password"
          value={apiToken}
          onChange={(e) => setApiToken(e.target.value)}
          placeholder="Your Printify API token"
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
        
        {import.meta.env.VITE_PRINTIFY_API_TOKEN && (
          <Alert severity="info" sx={{ mt: 2, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            Using API token from your .env file
          </Alert>
        )}
      </Box>

      {/* Search Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={loading ? <CircularProgress size={20} /> : <Search />}
        onClick={handleFindShops}
        disabled={loading || !apiToken.trim()}
        sx={{
          background: `linear-gradient(45deg, ${UI_CONSTANTS.COLORS.SECONDARY}, ${UI_CONSTANTS.COLORS.PRIMARY})`,
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          mb: 3
        }}
      >
        {loading ? 'Finding Your Shops...' : 'Find My Shop ID'}
      </Button>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Shops Results */}
      {shops && shops.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ 
            color: UI_CONSTANTS.COLORS.TEXT.PRIMARY,
            fontWeight: 'bold',
            mb: 2
          }}>
            🎉 Found Your Connected Shops:
          </Typography>

          <TableContainer component={Paper} sx={{ 
            background: 'rgba(30, 41, 59, 0.9)',
            mb: 3
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, fontWeight: 'bold' }}>
                    Shop Name
                  </TableCell>
                  <TableCell sx={{ color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, fontWeight: 'bold' }}>
                    Platform
                  </TableCell>
                  <TableCell sx={{ color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, fontWeight: 'bold' }}>
                    Shop ID
                  </TableCell>
                  <TableCell sx={{ color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, fontWeight: 'bold' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: UI_CONSTANTS.COLORS.TEXT.PRIMARY, fontWeight: 'bold' }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shops.map((shop) => {
                  const isShopify = shop.sales_channel?.toLowerCase().includes('shopify') || 
                                   shop.title?.toLowerCase().includes('shopify');
                  const isConnected = !shop.disconnected_at;
                  
                  return (
                    <TableRow key={shop.id} sx={{ 
                      backgroundColor: isShopify ? 'rgba(22, 163, 74, 0.1)' : 'transparent'
                    }}>
                      <TableCell sx={{ color: UI_CONSTANTS.COLORS.TEXT.PRIMARY }}>
                        {shop.title}
                        {isShopify && (
                          <Chip 
                            label="SHOPIFY" 
                            size="small" 
                            sx={{ 
                              ml: 1,
                              background: 'rgba(22, 163, 74, 0.2)',
                              color: UI_CONSTANTS.COLORS.SUCCESS,
                              fontSize: '0.7rem'
                            }} 
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ color: UI_CONSTANTS.COLORS.TEXT.SECONDARY }}>
                        {shop.sales_channel}
                      </TableCell>
                      <TableCell sx={{ 
                        color: isShopify ? UI_CONSTANTS.COLORS.SUCCESS : UI_CONSTANTS.COLORS.TEXT.PRIMARY,
                        fontFamily: 'monospace',
                        fontWeight: 'bold'
                      }}>
                        {shop.id}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={isConnected ? 'Connected' : 'Disconnected'}
                          size="small"
                          sx={{ 
                            background: isConnected ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)',
                            color: isConnected ? UI_CONSTANTS.COLORS.SUCCESS : '#dc2626',
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            startIcon={copiedShopId === shop.id ? <CheckCircle /> : <ContentCopy />}
                            onClick={() => copyShopId(shop.id)}
                            sx={{ color: UI_CONSTANTS.COLORS.SECONDARY }}
                          >
                            {copiedShopId === shop.id ? 'Copied!' : 'Copy ID'}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={copiedShopId === `env-${shop.id}` ? <CheckCircle /> : <ContentCopy />}
                            onClick={() => copyEnvLine(shop.id)}
                            sx={{ 
                              background: UI_CONSTANTS.COLORS.SUCCESS,
                              fontSize: '0.8rem'
                            }}
                          >
                            {copiedShopId === `env-${shop.id}` ? 'Copied!' : 'Copy .env'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Instructions */}
          {shops.find(shop => shop.sales_channel?.toLowerCase().includes('shopify')) && (
            <Alert severity="success" sx={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                ✅ Found your Shopify shop!
              </Typography>
              <Typography variant="body2">
                1. Click "Copy .env" for your Shopify shop<br/>
                2. Add the line to your .env file<br/>
                3. Restart your dev server: <code>npm run dev</code><br/>
                4. Your automation is now ready to use! 🚀
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* No Shops Found */}
      {shops && shops.length === 0 && (
        <Alert severity="warning" sx={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            ⚠️ No shops found
          </Typography>
          <Typography variant="body2">
            You need to connect your Shopify store to Printify first:<br/>
            1. Go to printify.com → My Stores<br/>
            2. Click "Connect a new store"<br/>
            3. Select Shopify and follow the setup<br/>
            4. Come back here and search again
          </Typography>
        </Alert>
      )}
    </Card>
  );
};

export default ShopIdFinder;