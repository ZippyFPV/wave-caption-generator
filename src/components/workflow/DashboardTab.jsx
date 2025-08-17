import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Stack,
  Button,
  Tooltip
} from '@mui/material';
import { Waves, Visibility, Store } from '@mui/icons-material';
import StatusIndicator from '../ui/StatusIndicator';

// StatusIndicator component is now imported from ui/StatusIndicator

const DashboardTab = ({ imageStats, persistentMetrics, systemStatus, loading, setCurrentTab }) => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ color: '#6B73FF', fontWeight: 'bold' }}>
      📊 Wave Commerce Dashboard
    </Typography>
    
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>📈 Performance Metrics</Typography>
            <Grid container spacing={2}>
              {/* Session Metrics */}
              <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E3F2FD' }}>
                  <Typography variant="h4" sx={{ color: '#1976D2', fontWeight: 'bold' }}>
                    {imageStats.totalGenerated}
                  </Typography>
                  <Typography variant="caption">Session Images</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF3E0' }}>
                  <Typography variant="h4" sx={{ color: '#F57C00', fontWeight: 'bold' }}>
                    {imageStats.created}
                  </Typography>
                  <Typography variant="caption">Session Created</Typography>
                </Paper>
              </Grid>
              
              {/* Persistent Metrics */}
              <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8F5E8' }}>
                  <Typography variant="h4" sx={{ color: '#388E3C', fontWeight: 'bold' }}>
                    {persistentMetrics.total}
                  </Typography>
                  <Typography variant="caption">Total Ever</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
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
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Manual Listings:</strong> {persistentMetrics.manual}</Typography>
                    <Typography variant="body2"><strong>Published:</strong> {persistentMetrics.published}</Typography>
                  </Grid>
                  <Grid item xs={6}>
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
      <Grid item xs={12} md={4}>
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
      <Grid item xs={12}>
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
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default DashboardTab;
