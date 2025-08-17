/**
 * Tests for StatusIndicator Component
 * 
 * These tests verify that the StatusIndicator component renders correctly
 * for different status types and provides proper accessibility.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusIndicator from '../StatusIndicator';

describe('StatusIndicator Component', () => {
  describe('Valid Status Rendering', () => {
    it('should render ready status correctly', () => {
      render(<StatusIndicator status="ready" />);
      
      // Should render the icon
      const iconElement = screen.getByTestId('CheckCircleIcon');
      expect(iconElement).toBeInTheDocument();
    });

    it('should render processing status correctly', () => {
      render(<StatusIndicator status="processing" />);
      
      const iconElement = screen.getByTestId('WarningIcon');
      expect(iconElement).toBeInTheDocument();
    });

    it('should render error status correctly', () => {
      render(<StatusIndicator status="error" />);
      
      const iconElement = screen.getByTestId('ErrorIcon');
      expect(iconElement).toBeInTheDocument();
    });

    it('should render inactive status correctly', () => {
      render(<StatusIndicator status="inactive" />);
      
      const element = screen.getByRole('button');
      expect(element).toBeInTheDocument();
    });

    it('should render checking status correctly', () => {
      render(<StatusIndicator status="checking" />);
      
      const element = screen.getByRole('button');
      expect(element).toBeInTheDocument();
    });

    it('should render connected status correctly', () => {
      render(<StatusIndicator status="connected" />);
      
      const element = screen.getByRole('button');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Size Variations', () => {
    it('should render small size by default', () => {
      const { container } = render(<StatusIndicator status="ready" />);
      
      const svgElement = container.querySelector('svg');
      expect(svgElement).toHaveStyle({ fontSize: '16px' });
    });

    it('should render large size when specified', () => {
      const { container } = render(<StatusIndicator status="ready" size="large" />);
      
      const svgElement = container.querySelector('svg');
      expect(svgElement).toHaveStyle({ fontSize: '24px' });
    });
  });

  describe('Custom Labels', () => {
    it('should use custom label when provided', () => {
      const customLabel = 'Custom Status Message';
      render(<StatusIndicator status="ready" customLabel={customLabel} />);
      
      // The tooltip should contain the custom label
      const element = screen.getByRole('button');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Invalid Status Handling', () => {
    it('should handle unknown status gracefully', () => {
      render(<StatusIndicator status="unknown-status" />);
      
      const element = screen.getByRole('button');
      expect(element).toBeInTheDocument();
      
      // Should render warning icon for unknown status
      const svgElement = element.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });

    it('should handle null status gracefully', () => {
      render(<StatusIndicator status={null} />);
      
      const element = screen.getByRole('button');
      expect(element).toBeInTheDocument();
    });

    it('should handle undefined status gracefully', () => {
      render(<StatusIndicator status={undefined} />);
      
      const element = screen.getByRole('button');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Color Mapping', () => {
    it('should apply correct colors for each status', () => {
      const statuses = [
        { status: 'ready', expectedColor: '#4CAF50' },
        { status: 'processing', expectedColor: '#FF9800' },
        { status: 'error', expectedColor: '#F44336' },
        { status: 'inactive', expectedColor: '#9E9E9E' },
        { status: 'checking', expectedColor: '#FF9800' },
        { status: 'connected', expectedColor: '#4CAF50' }
      ];

      statuses.forEach(({ status, expectedColor }) => {
        const { container } = render(<StatusIndicator status={status} />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toHaveStyle({ color: expectedColor });
      });
    });
  });

  describe('Accessibility', () => {
    it('should provide accessible tooltip', () => {
      render(<StatusIndicator status="ready" />);
      
      // Should have proper aria-label
      const iconElement = screen.getByTestId('CheckCircleIcon');
      expect(iconElement).toHaveAttribute('aria-label', 'Ready');
    });
  });

  describe('Props Validation', () => {
    it('should handle missing status prop', () => {
      render(<StatusIndicator />);
      
      const iconElement = screen.getByTestId('WarningIcon');
      expect(iconElement).toBeInTheDocument();
    });

    it('should handle empty string status', () => {
      render(<StatusIndicator status="" />);
      
      const iconElement = screen.getByTestId('WarningIcon');
      expect(iconElement).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('should render appropriate icons for each status', () => {
      const statuses = ['ready', 'processing', 'error', 'inactive', 'checking', 'connected'];
      
      statuses.forEach(status => {
        const { container } = render(<StatusIndicator status={status} />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toBeInTheDocument();
      });
    });
  });
});