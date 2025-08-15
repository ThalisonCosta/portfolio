import React from 'react';

/**
 * Performance monitoring utilities for terminal application
 */

interface PerformanceMetrics {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  memoryUsage?: number;
  timestamp: number;
}

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics>();
  private renderTimes = new Map<string, number[]>();
  private isMonitoring = process.env.NODE_ENV === 'development';

  /**
   * Start performance measurement for a component
   */
  startRender(componentName: string): () => void {
    if (!this.isMonitoring) return () => {};

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      this.recordRender(componentName, renderTime);
    };
  }

  /**
   * Record render performance for a component
   */
  private recordRender(componentName: string, renderTime: number): void {
    const existing = this.metrics.get(componentName) || {
      componentName,
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      timestamp: Date.now(),
    };

    // Update render times history
    const times = this.renderTimes.get(componentName) || [];
    times.push(renderTime);

    // Keep only last 50 render times for average calculation
    if (times.length > 50) {
      times.shift();
    }
    this.renderTimes.set(componentName, times);

    // Update metrics
    const updated: PerformanceMetrics = {
      ...existing,
      renderCount: existing.renderCount + 1,
      averageRenderTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      lastRenderTime: renderTime,
      memoryUsage: this.getMemoryUsage(),
      timestamp: Date.now(),
    };

    this.metrics.set(componentName, updated);

    // Log warning for slow renders
    if (renderTime > 16) {
      // > 16ms (60fps threshold)
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }

    // Log warning for excessive renders
    if (updated.renderCount % 100 === 0) {
      console.warn(`High render count: ${componentName} has rendered ${updated.renderCount} times`);
    }
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number | undefined {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * Get detailed memory statistics
   */
  getMemoryStats(): MemoryStats | null {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory;
    }
    return null;
  }

  /**
   * Get performance metrics for a component
   */
  getMetrics(componentName: string): PerformanceMetrics | undefined {
    return this.metrics.get(componentName);
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get components with performance issues
   */
  getPerformanceIssues(): PerformanceMetrics[] {
    return this.getAllMetrics().filter(
      (metric) =>
        metric.averageRenderTime > 10 || // Slower than 10ms average
        metric.renderCount > 200 // Too many renders
    );
  }

  /**
   * Reset metrics for a component
   */
  resetMetrics(componentName: string): void {
    this.metrics.delete(componentName);
    this.renderTimes.delete(componentName);
  }

  /**
   * Reset all metrics
   */
  resetAllMetrics(): void {
    this.metrics.clear();
    this.renderTimes.clear();
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const issues = this.getPerformanceIssues();
    const memoryStats = this.getMemoryStats();

    let report = '=== Terminal Performance Report ===\n\n';

    if (memoryStats) {
      report += `Memory Usage:\n`;
      report += `  Used: ${(memoryStats.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
      report += `  Total: ${(memoryStats.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
      report += `  Limit: ${(memoryStats.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB\n\n`;
    }

    if (issues.length > 0) {
      report += `Performance Issues Found:\n`;
      issues.forEach((metric) => {
        report += `  ${metric.componentName}:\n`;
        report += `    Render Count: ${metric.renderCount}\n`;
        report += `    Average Render Time: ${metric.averageRenderTime.toFixed(2)}ms\n`;
        report += `    Last Render Time: ${metric.lastRenderTime.toFixed(2)}ms\n`;
        if (metric.memoryUsage) {
          report += `    Memory Usage: ${(metric.memoryUsage / 1024 / 1024).toFixed(2)} MB\n`;
        }
        report += '\n';
      });
    } else {
      report += 'No performance issues detected.\n\n';
    }

    report += `Total Components Monitored: ${this.metrics.size}\n`;

    return report;
  }

  /**
   * Enable/disable monitoring
   */
  setMonitoring(enabled: boolean): void {
    this.isMonitoring = enabled;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for monitoring component performance
 */
export function usePerformanceMonitor(componentName: string) {
  const endRender = performanceMonitor.startRender(componentName);

  // Call endRender after the component finishes rendering
  React.useLayoutEffect(() => {
    endRender();
  });

  return {
    getMetrics: () => performanceMonitor.getMetrics(componentName),
    resetMetrics: () => performanceMonitor.resetMetrics(componentName),
  };
}

/**
 * Higher-order component for performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const MonitoredComponent: React.FC<P> = (props) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
    const endRender = performanceMonitor.startRender(name);

    React.useLayoutEffect(() => {
      endRender();
    });

    return React.createElement(WrappedComponent, props);
  };

  MonitoredComponent.displayName = `withPerformanceMonitoring(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return MonitoredComponent;
}

// Global performance utilities
export const PerformanceUtils = {
  /**
   * Log current performance statistics
   */
  logStats(): void {
    console.log(performanceMonitor.generateReport());
  },

  /**
   * Start performance monitoring session
   */
  startMonitoring(): void {
    performanceMonitor.setMonitoring(true);
    console.log('Terminal performance monitoring started');
  },

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    performanceMonitor.setMonitoring(false);
    console.log('Terminal performance monitoring stopped');
  },

  /**
   * Force garbage collection (if available)
   */
  forceGC(): void {
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
      console.log('Forced garbage collection');
    }
  },

  /**
   * Get memory pressure indicator
   */
  getMemoryPressure(): 'low' | 'medium' | 'high' {
    const stats = performanceMonitor.getMemoryStats();
    if (!stats) return 'low';

    const usageRatio = stats.usedJSHeapSize / stats.jsHeapSizeLimit;

    if (usageRatio > 0.8) return 'high';
    if (usageRatio > 0.6) return 'medium';
    return 'low';
  },
};

// Expose to window for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).terminalPerformance = {
    monitor: performanceMonitor,
    utils: PerformanceUtils,
  };
}
