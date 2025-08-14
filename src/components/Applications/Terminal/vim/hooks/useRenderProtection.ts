import { useRef, useEffect, useCallback } from 'react';

interface RenderProtectionOptions {
  maxRendersPerSecond?: number;
  maxConsecutiveRenders?: number;
  onThreatDetected?: () => void;
  componentName?: string;
}

/**
 * Hook to protect against render loops and excessive re-renders
 * Forces component unmount if render thresholds are exceeded
 */
export function useRenderProtection(options: RenderProtectionOptions = {}) {
  const {
    maxRendersPerSecond = 60,
    maxConsecutiveRenders = 100,
    onThreatDetected,
    componentName = 'Component',
  } = options;

  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const lastResetRef = useRef(Date.now());
  const consecutiveRendersRef = useRef(0);
  const isThrottledRef = useRef(false);

  const resetCounters = useCallback(() => {
    renderCountRef.current = 0;
    renderTimesRef.current = [];
    consecutiveRendersRef.current = 0;
    lastResetRef.current = Date.now();
    isThrottledRef.current = false;
  }, []);

  const checkRenderHealth = useCallback(() => {
    const now = Date.now();
    renderCountRef.current++;
    consecutiveRendersRef.current++;
    renderTimesRef.current.push(now);

    // Clean old render times (older than 1 second)
    renderTimesRef.current = renderTimesRef.current.filter(time => now - time < 1000);

    // Check for excessive renders per second
    if (renderTimesRef.current.length > maxRendersPerSecond) {
      console.error(`${componentName}: Excessive renders detected - ${renderTimesRef.current.length}/sec`);
      if (onThreatDetected) {
        onThreatDetected();
      }
      isThrottledRef.current = true;
      return true; // Threat detected
    }

    // Check for excessive consecutive renders
    if (consecutiveRendersRef.current > maxConsecutiveRenders) {
      console.error(`${componentName}: Too many consecutive renders - ${consecutiveRendersRef.current}`);
      if (onThreatDetected) {
        onThreatDetected();
      }
      isThrottledRef.current = true;
      return true; // Threat detected
    }

    // Reset consecutive counter if enough time has passed
    if (now - lastResetRef.current > 5000) { // 5 seconds
      consecutiveRendersRef.current = 0;
      lastResetRef.current = now;
    }

    return false; // No threat
  }, [maxRendersPerSecond, maxConsecutiveRenders, onThreatDetected, componentName]);

  // Check render health on every render
  const isThreatDetected = checkRenderHealth();

  // Auto-reset protection after cooldown period
  useEffect(() => {
    if (isThrottledRef.current) {
      const resetTimer = setTimeout(() => {
        console.log(`${componentName}: Render protection reset`);
        resetCounters();
      }, 10000); // 10 second cooldown

      return () => clearTimeout(resetTimer);
    }
  }, [componentName, resetCounters]);

  return {
    renderCount: renderCountRef.current,
    consecutiveRenders: consecutiveRendersRef.current,
    rendersPerSecond: renderTimesRef.current.length,
    isThreatDetected,
    isThrottled: isThrottledRef.current,
    resetCounters,
  };
}