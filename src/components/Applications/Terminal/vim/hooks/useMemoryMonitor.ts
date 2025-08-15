import { useEffect, useRef, useCallback } from 'react';

interface MemoryStats {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

interface MemoryMonitorOptions {
  warningThresholdMB?: number;
  criticalThresholdMB?: number;
  onWarning?: (stats: MemoryStats) => void;
  onCritical?: (stats: MemoryStats) => void;
  monitoringIntervalMs?: number;
}

/**
 * Hook to monitor memory usage and prevent crashes
 * Provides early warning when memory usage gets high
 */
export function useMemoryMonitor(options: MemoryMonitorOptions = {}) {
  const {
    warningThresholdMB = 100,
    criticalThresholdMB = 200,
    onWarning,
    onCritical,
    monitoringIntervalMs = 30000, // Check every 30 seconds
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastWarningRef = useRef<number>(0);
  const lastCriticalRef = useRef<number>(0);

  const getMemoryStats = useCallback((): MemoryStats => {
    // Check if performance.memory is available (Chrome/Edge)
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const { memory } = performance as any;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }

    return {};
  }, []);

  const checkMemory = useCallback(() => {
    const stats = getMemoryStats();

    if (!stats.usedJSHeapSize) {
      // Memory API not available, skip monitoring
      return;
    }

    const usedMB = stats.usedJSHeapSize / (1024 * 1024);
    const now = Date.now();

    // Check critical threshold (only alert once per 5 minutes)
    if (usedMB > criticalThresholdMB && now - lastCriticalRef.current > 300000) {
      lastCriticalRef.current = now;
      console.warn(`Vim Editor: Critical memory usage detected: ${usedMB.toFixed(1)}MB`);

      if (onCritical) {
        onCritical(stats);
      }

      // Trigger garbage collection if available
      if (typeof window !== 'undefined' && 'gc' in window && typeof (window as any).gc === 'function') {
        try {
          (window as any).gc();
        } catch (e) {
          // Ignore GC errors
        }
      }
    }
    // Check warning threshold (only alert once per 2 minutes)
    else if (usedMB > warningThresholdMB && now - lastWarningRef.current > 120000) {
      lastWarningRef.current = now;
      console.warn(`Vim Editor: High memory usage detected: ${usedMB.toFixed(1)}MB`);

      if (onWarning) {
        onWarning(stats);
      }
    }
  }, [criticalThresholdMB, warningThresholdMB, onCritical, onWarning, getMemoryStats]);

  // Force garbage collection (if available)
  const forceGarbageCollection = useCallback(() => {
    if (typeof window !== 'undefined' && 'gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
        console.log('Vim Editor: Forced garbage collection');
      } catch (e) {
        console.warn('Vim Editor: Could not force garbage collection:', e);
      }
    }
  }, []);

  // Get current memory usage for debugging
  const getCurrentMemoryUsage = useCallback((): string => {
    const stats = getMemoryStats();

    if (!stats.usedJSHeapSize) {
      return 'Memory monitoring not available';
    }

    const usedMB = (stats.usedJSHeapSize / (1024 * 1024)).toFixed(1);
    const totalMB = stats.totalJSHeapSize ? (stats.totalJSHeapSize / (1024 * 1024)).toFixed(1) : 'N/A';
    const limitMB = stats.jsHeapSizeLimit ? (stats.jsHeapSizeLimit / (1024 * 1024)).toFixed(1) : 'N/A';

    return `Used: ${usedMB}MB, Total: ${totalMB}MB, Limit: ${limitMB}MB`;
  }, [getMemoryStats]);

  // Start monitoring when component mounts
  useEffect(() => {
    // Initial check
    checkMemory();

    // Set up periodic monitoring
    intervalRef.current = setInterval(checkMemory, monitoringIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkMemory, monitoringIntervalMs]);

  return {
    getMemoryStats,
    forceGarbageCollection,
    getCurrentMemoryUsage,
  };
}
