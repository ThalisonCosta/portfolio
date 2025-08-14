import type { TerminalOutputLine } from '../types';

/**
 * Generic object pool implementation for reducing garbage collection
 */
class ObjectPool<T> {
  private pool: T[] = [];
  private maxSize: number;
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  /**
   * Get an object from the pool or create a new one
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  /**
   * Return an object to the pool
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      maxSize: this.maxSize,
    };
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool.length = 0;
  }
}

/**
 * Terminal line object pool
 */
const createTerminalLine = (): TerminalOutputLine => ({
  id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  content: '',
  type: 'output',
  timestamp: new Date(),
  className: '',
});

const resetTerminalLine = (line: TerminalOutputLine): void => {
  // Generate temporary unique ID to prevent empty key conflicts
  line.id = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  line.content = '';
  line.type = 'output';
  line.timestamp = new Date();
  line.className = '';
};

export const terminalLinePool = new ObjectPool(
  createTerminalLine,
  resetTerminalLine,
  200 // Keep pool of 200 lines
);

/**
 * Style object pool for React components
 */
interface CachedStyle {
  [key: string]: React.CSSProperties;
}

const styleCache = new Map<string, React.CSSProperties>();

export const StyleObjectPool = {
  /**
   * Get cached style object
   */
  get(key: string, factory: () => React.CSSProperties): React.CSSProperties {
    if (styleCache.has(key)) {
      return styleCache.get(key)!;
    }

    const style = factory();
    
    // Prevent cache from growing too large
    if (styleCache.size >= 500) {
      // Clear oldest 50% of entries
      const entries = Array.from(styleCache.entries());
      const keepCount = Math.floor(entries.length * 0.5);
      styleCache.clear();
      entries.slice(-keepCount).forEach(([k, v]) => styleCache.set(k, v));
    }

    styleCache.set(key, style);
    return style;
  },

  /**
   * Clear style cache
   */
  clear(): void {
    styleCache.clear();
  },

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: styleCache.size,
      maxSize: 500,
    };
  },
};

/**
 * Event object pool for keyboard/mouse events
 */
interface PooledEvent {
  type: string;
  key?: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
}

const createPooledEvent = (): PooledEvent => ({
  type: '',
  key: '',
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  metaKey: false,
  preventDefault: () => {},
  stopPropagation: () => {},
});

const resetPooledEvent = (event: PooledEvent): void => {
  event.type = '';
  event.key = '';
  event.ctrlKey = false;
  event.shiftKey = false;
  event.altKey = false;
  event.metaKey = false;
};

export const eventPool = new ObjectPool(
  createPooledEvent,
  resetPooledEvent,
  50
);

/**
 * Syntax token pool for highlighting
 */
interface SyntaxToken {
  start: number;
  end: number;
  type: string;
  content?: string;
}

const createSyntaxToken = (): SyntaxToken => ({
  start: 0,
  end: 0,
  type: '',
  content: '',
});

const resetSyntaxToken = (token: SyntaxToken): void => {
  token.start = 0;
  token.end = 0;
  token.type = '';
  token.content = '';
};

export const syntaxTokenPool = new ObjectPool(
  createSyntaxToken,
  resetSyntaxToken,
  1000 // Large pool for syntax highlighting
);

/**
 * Global pool manager
 */
export const PoolManager = {
  /**
   * Get statistics for all pools
   */
  getAllStats() {
    return {
      terminalLines: terminalLinePool.getStats(),
      styles: StyleObjectPool.getStats(),
      events: eventPool.getStats(),
      syntaxTokens: syntaxTokenPool.getStats(),
    };
  },

  /**
   * Clear all pools
   */
  clearAll() {
    terminalLinePool.clear();
    StyleObjectPool.clear();
    eventPool.clear();
    syntaxTokenPool.clear();
  },

  /**
   * Force garbage collection hint (if available)
   */
  forceGC() {
    if (typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  },
};