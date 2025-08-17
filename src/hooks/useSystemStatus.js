import { useState, useEffect, useCallback } from 'react';

export const useSystemStatus = () => {
  // System status state
  const [systemStatus, setSystemStatus] = useState({
    pexelsApi: 'inactive',
    printifyApi: 'inactive',
    serverConnection: 'inactive'
  });
  const [systemCheckDialog, setSystemCheckDialog] = useState(false);

  // Check individual system components
  const checkSystemStatus = useCallback(async () => {
    console.log('🔍 Checking system status...');
    
    const newStatus = {
      pexelsApi: 'checking',
      printifyApi: 'checking',
      serverConnection: 'checking'
    };
    
    setSystemStatus(newStatus);

    try {
      // Check server connection first
      try {
        const serverResponse = await fetch('http://localhost:3001/health', {
          timeout: 5000
        });
        newStatus.serverConnection = serverResponse.ok ? 'connected' : 'error';
      } catch (error) {
        console.warn('❌ Server health check failed:', error);
        newStatus.serverConnection = 'error';
      }

      // Check Pexels API
      try {
        const pexelsResponse = await fetch('http://localhost:3001/api/pexels/search?query=ocean&per_page=1&page=1', {
          timeout: 10000
        });
        if (pexelsResponse.ok) {
          const pexelsData = await pexelsResponse.json();
          newStatus.pexelsApi = pexelsData.photos && pexelsData.photos.length > 0 ? 'connected' : 'error';
        } else if (pexelsResponse.status === 401) {
          newStatus.pexelsApi = 'error'; // Invalid API key
        } else if (pexelsResponse.status === 429) {
          newStatus.pexelsApi = 'connected'; // Rate limited but API key works
        } else {
          newStatus.pexelsApi = 'error';
        }
      } catch (error) {
        console.warn('❌ Pexels API check failed:', error);
        newStatus.pexelsApi = 'error';
      }

      // Check Printify API
      try {
        const printifyResponse = await fetch('http://localhost:3001/api/printify/validate', {
          timeout: 10000
        });
        const printifyData = await printifyResponse.json();
        newStatus.printifyApi = printifyData.success ? 'connected' : 'error';
      } catch (error) {
        console.warn('❌ Printify API check failed:', error);
        newStatus.printifyApi = 'error';
      }

    } catch (error) {
      console.error('❌ System status check failed:', error);
      newStatus.pexelsApi = 'error';
      newStatus.printifyApi = 'error';
      newStatus.serverConnection = 'error';
    }

    setSystemStatus(newStatus);
    
    console.log('✅ System status check completed:', newStatus);
    return newStatus;
  }, []);

  // Auto-check system status on mount and periodically
  useEffect(() => {
    // Initial check
    checkSystemStatus();

    // Periodic checks every 5 minutes
    const interval = setInterval(checkSystemStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkSystemStatus]);

  // Get overall system health
  const getSystemHealth = useCallback(() => {
    const statuses = Object.values(systemStatus);
    const connectedCount = statuses.filter(status => status === 'connected').length;
    const totalCount = statuses.length;
    
    if (connectedCount === totalCount) {
      return { status: 'healthy', percentage: 100 };
    } else if (connectedCount > 0) {
      return { status: 'partial', percentage: Math.round((connectedCount / totalCount) * 100) };
    } else {
      return { status: 'unhealthy', percentage: 0 };
    }
  }, [systemStatus]);

  // Check if system is ready for automation
  const isSystemReady = useCallback(() => {
    return systemStatus.pexelsApi === 'connected' && 
           systemStatus.printifyApi === 'connected' && 
           systemStatus.serverConnection === 'connected';
  }, [systemStatus]);

  // Get system status summary for display
  const getSystemSummary = useCallback(() => {
    const health = getSystemHealth();
    const ready = isSystemReady();
    
    return {
      health,
      ready,
      status: systemStatus,
      message: ready 
        ? 'All systems operational' 
        : health.status === 'partial'
        ? 'Some systems offline'
        : 'Systems not ready'
    };
  }, [systemStatus, getSystemHealth, isSystemReady]);

  // Force refresh system status
  const refreshSystemStatus = useCallback(() => {
    console.log('🔄 Manually refreshing system status...');
    return checkSystemStatus();
  }, [checkSystemStatus]);

  return {
    // State
    systemStatus,
    setSystemStatus,
    systemCheckDialog,
    setSystemCheckDialog,
    
    // Computed values
    getSystemHealth,
    isSystemReady,
    getSystemSummary,
    
    // Actions
    checkSystemStatus,
    refreshSystemStatus
  };
};