import React from 'react';
import { Tooltip } from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Pause
} from '@mui/icons-material';

// Status indicators configuration
const STATUS_INDICATORS = {
  ready: { icon: CheckCircle, color: '#4CAF50', label: 'Ready' },
  processing: { icon: Warning, color: '#FF9800', label: 'Processing' },
  error: { icon: Error, color: '#F44336', label: 'Error' },
  inactive: { icon: Pause, color: '#9E9E9E', label: 'Not Started' },
  checking: { icon: Warning, color: '#FF9800', label: 'Checking' },
  connected: { icon: CheckCircle, color: '#4CAF50', label: 'Connected' }
};

/**
 * Reusable Status Indicator Component
 * 
 * Displays status icons with tooltips across the application
 * 
 * @param {string} status - Status type (ready, processing, error, inactive, checking, connected)
 * @param {string} size - Icon size ('small' or 'large')
 * @param {string} customLabel - Optional custom tooltip text
 * @returns {JSX.Element} Status indicator with icon and tooltip
 */
const StatusIndicator = ({ status, size = 'small', customLabel }) => {
  const statusConfig = STATUS_INDICATORS[status];
  
  if (!statusConfig) {
    console.warn(`Unknown status: ${status}`);
    return (
      <Tooltip title={customLabel || 'Unknown Status'}>
        <Warning sx={{ color: '#FF9800', fontSize: size === 'large' ? 24 : 16 }} />
      </Tooltip>
    );
  }
  
  const IconComponent = statusConfig.icon;
  const label = customLabel || statusConfig.label;
  
  return (
    <Tooltip title={label}>
      <IconComponent 
        sx={{ 
          color: statusConfig.color, 
          fontSize: size === 'large' ? 24 : 16,
          ml: 0.5 
        }} 
      />
    </Tooltip>
  );
};

export default StatusIndicator;
// Separate file for constants to follow React Fast Refresh best practices
// export { STATUS_INDICATORS };