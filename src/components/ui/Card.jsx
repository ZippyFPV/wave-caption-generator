import React from 'react';
import { Card as MuiCard, CardContent } from '@mui/material';
import { UI_CONSTANTS } from '../../config/constants.js';

const Card = ({ 
  children, 
  gradient = false, 
  bordered = false, 
  className = '',
  sx = {},
  ...props 
}) => {
  const cardStyles = {
    background: gradient 
      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(96, 165, 250, 0.1) 100%)'
      : UI_CONSTANTS.COLORS.CARD,
    backdropFilter: 'blur(20px)',
    border: bordered 
      ? `2px solid ${UI_CONSTANTS.COLORS.PRIMARY}40` 
      : '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: UI_CONSTANTS.LAYOUT.CARD_RADIUS,
    ...sx
  };

  return (
    <MuiCard sx={cardStyles} className={className} {...props}>
      <CardContent sx={{ p: UI_CONSTANTS.LAYOUT.SPACING.MD }}>
        {children}
      </CardContent>
    </MuiCard>
  );
};

export default Card;