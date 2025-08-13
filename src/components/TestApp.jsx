import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Star } from '@mui/icons-material';

const TestApp = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test App Working!
      </Typography>
      <Button 
        variant="contained" 
        startIcon={<Star />}
        sx={{ mb: 2 }}
      >
        Test Button
      </Button>
      <Typography variant="body1">
        If you can see this, the basic setup is working.
      </Typography>
    </Box>
  );
};

export default TestApp;