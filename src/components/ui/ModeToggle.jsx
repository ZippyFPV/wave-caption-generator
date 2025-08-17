import React from 'react';
import {
  Paper,
  Stack,
  Typography,
  FormControlLabel,
  Switch,
  Box
} from '@mui/material';

const ModeToggle = ({ batchMode, setBatchMode }) => (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 2, 
        bgcolor: batchMode ? '#FFF3E0' : '#E3F2FD',
        border: batchMode ? '2px solid #FF9800' : '2px solid #2196F3'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" sx={{ color: batchMode ? '#E65100' : '#1565C0' }}>
            {batchMode ? '⚡ Batch Mode' : '🎯 Single Mode'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {batchMode 
              ? 'Process multiple images quickly - use when confident'
              : 'Process one at a time - recommended for testing'
            }
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={batchMode}
              onChange={(event) => setBatchMode(event.target.checked)}
              color={batchMode ? 'warning' : 'primary'}
            />
          }
          label=""
        />
      </Stack>
    </Paper>
  );

  export default ModeToggle;
