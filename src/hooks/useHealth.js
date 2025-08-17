import { useEffect } from 'react';
import { HEALTH_POLL_INTERVAL_MS } from '../config';
import useWorkflowStore from '../store/workflowStore';

export default function useHealth() {
  const setSystemStatus = useWorkflowStore(s => s.setSystemStatus);
  
  useEffect(() => {
    let mounted = true;
    
    async function poll() {
      try {
        const res = await fetch('/api/health');
        const json = await res.json();
        if (mounted) setSystemStatus(json);
      } catch (e) {
        if (mounted) setSystemStatus({ backend: 'down' });
      }
    }
    
    poll();
    const interval = setInterval(poll, HEALTH_POLL_INTERVAL_MS);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [setSystemStatus]);
}