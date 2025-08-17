import React from 'react';
import { Box, Typography } from '@mui/material';

const DebugApp = () => {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        🌊 Debug App Working!
      </Typography>
      <Typography variant="body1">
        If you can see this, Material-UI is working properly.
      </Typography>
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        Environment: {import.meta.env.MODE}
      </Typography>
    </Box>
  );
};

export default DebugApp;