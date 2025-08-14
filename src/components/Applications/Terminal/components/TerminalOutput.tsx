import React, { memo, useEffect, useRef, useMemo, useState, useCallback } from 'react';
import type { TerminalOutputLine, TerminalTheme, OSType } from '../types';
import { TerminalLine } from './TerminalLine';
import { TerminalInput } from './TerminalInput';
import type { CommandRegistry } from '../commands';
import { StyleObjectPool } from '../utils/objectPools';

/**
 * Props for TerminalOutput component
 */
interface TerminalOutputProps {
  /** Array of output lines */
  output: TerminalOutputLine[];
  /** Terminal theme */
  theme: TerminalTheme;
  /** Whether to auto-scroll to bottom */
  autoScroll?: boolean;
  /** Maximum number of lines to keep */
  maxLines?: number;
  /** Input integration props */
  currentInput?: string;
  onInputChange?: (value: string, cursorPosition?: number) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  currentDirectory?: string;
  osType?: OSType;
  username?: string;
  hostname?: string;
  isExecuting?: boolean;
  cursorPosition?: number;
  suggestions?: string[];
  selectedSuggestion?: number;
  showSuggestions?: boolean;
  /** Command registry for syntax highlighting */
  commandRegistry?: CommandRegistry;
}

/**
 * Virtual scrolling parameters
 */
const ITEM_HEIGHT = 24; // Approximate height of each terminal line
const BUFFER_SIZE = 10; // Extra items to render above/below visible area

/**
 * Terminal output display component with virtual scrolling
 * Only renders visible lines for optimal performance
 */
const TerminalOutputComponent: React.FC<TerminalOutputProps> = ({
  output,
  theme,
  autoScroll = true,
  maxLines = 1000,
  // Input props
  currentInput,
  onInputChange,
  onKeyDown,
  currentDirectory,
  osType,
  username,
  hostname,
  isExecuting,
  cursorPosition,
  suggestions,
  selectedSuggestion,
  showSuggestions,
  commandRegistry,
}) => {
  const outputRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | undefined>(undefined);
  
  // Virtual scrolling state
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Memoized display output to prevent recalculation
  const displayedOutput = useMemo(() => {
    return output.slice(-maxLines);
  }, [output, maxLines]);

  // Calculate visible range for virtual scrolling
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const itemCount = displayedOutput.length;
    const start = Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE;
    const visibleCount = Math.ceil(viewportHeight / ITEM_HEIGHT);
    const end = start + visibleCount + BUFFER_SIZE * 2;

    return {
      startIndex: Math.max(0, start),
      endIndex: Math.min(itemCount, end),
      totalHeight: itemCount * ITEM_HEIGHT,
    };
  }, [scrollTop, viewportHeight, displayedOutput.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return displayedOutput.slice(startIndex, endIndex);
  }, [displayedOutput, startIndex, endIndex]);

  /**
   * Optimized scroll handler with debouncing
   */
  const handleScroll = useCallback(() => {
    const element = outputRef.current;
    if (!element) return;

    const { scrollTop: newScrollTop, scrollHeight, clientHeight } = element;
    const isAtBottom = scrollHeight - newScrollTop - clientHeight < 10;

    setScrollTop(newScrollTop);
    setViewportHeight(clientHeight);
    isUserScrollingRef.current = !isAtBottom;

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    // Reset user scrolling flag after a delay
    scrollTimeoutRef.current = window.setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 1000);
  }, []);

  /**
   * Auto-scroll to bottom when new content is added
   */
  useEffect(() => {
    if (!autoScroll || isUserScrollingRef.current) return;

    const element = outputRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [output, autoScroll]);

  // Initialize viewport height
  useEffect(() => {
    const element = outputRef.current;
    if (element) {
      setViewportHeight(element.clientHeight);
    }
  }, []);

  // Memoized styles using object pool
  const outputStyle = useMemo(() => {
    const styleKey = `output-${theme.background}-${theme.comment}`;
    return StyleObjectPool.get(styleKey, () => ({
      flex: 1,
      display: 'flex' as const,
      flexDirection: 'column' as const,
      overflowY: 'auto' as const,
      overflowX: 'hidden' as const,
      backgroundColor: theme.background,
      scrollBehavior: 'smooth' as const,
      scrollbarWidth: 'thin' as const,
      scrollbarColor: `${theme.comment} ${theme.background}`,
    }));
  }, [theme.background, theme.comment]);

  const contentStyle = useMemo(() => {
    return StyleObjectPool.get('content', () => ({
      position: 'relative' as const,
      height: `${totalHeight}px`,
      padding: '8px 16px',
    }));
  }, [totalHeight]);

  const inputContainerStyle = useMemo(() => {
    return StyleObjectPool.get('input-container', () => ({
      padding: '0',
      minHeight: 'auto' as const,
    }));
  }, []);

  const scrollbarStyle = useMemo(() => {
    const styleKey = `scrollbar-${theme.background}-${theme.comment}-${theme.foreground}`;
    return StyleObjectPool.get(styleKey, () => `
      .terminal-output::-webkit-scrollbar {
        width: 8px;
      }
      .terminal-output::-webkit-scrollbar-track {
        background: ${theme.background};
      }
      .terminal-output::-webkit-scrollbar-thumb {
        background-color: ${theme.comment};
        border-radius: 4px;
        border: 2px solid ${theme.background};
      }
      .terminal-output::-webkit-scrollbar-thumb:hover {
        background-color: ${theme.foreground};
      }
    `);
  }, [theme.background, theme.comment, theme.foreground]);

  const hasInputProps = useMemo(() => {
    return currentInput !== undefined && onInputChange && onKeyDown && currentDirectory && osType && username && hostname;
  }, [currentInput, onInputChange, onKeyDown, currentDirectory, osType, username, hostname]);

  // Virtual list item style
  const virtualListStyle = useMemo(() => {
    return StyleObjectPool.get('virtual-list', () => ({
      position: 'absolute' as const,
      top: `${startIndex * ITEM_HEIGHT}px`,
      left: 0,
      right: 0,
    }));
  }, [startIndex]);

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div
        ref={outputRef}
        style={outputStyle}
        className="terminal-output"
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
      >
        <div style={contentStyle}>
          {displayedOutput.length === 0 ? (
            <div
              style={{
                color: theme.comment,
                fontStyle: 'italic',
                padding: '20px 0',
                textAlign: 'center',
              }}
            >
              Terminal ready - type a command to get started
            </div>
          ) : (
            <div style={virtualListStyle}>
              {visibleItems.map((line, index) => {
                const actualIndex = startIndex + index;
                // Create robust unique key to prevent duplicate key warnings
                const uniqueKey = line.id && line.id.trim() !== '' 
                  ? `${line.id}-${actualIndex}` 
                  : `line-${actualIndex}-${line.timestamp?.getTime() || Date.now()}`;
                
                // Development mode: validate key uniqueness
                if (process.env.NODE_ENV === 'development') {
                  if (!line.id || line.id.trim() === '') {
                    console.warn(`TerminalOutput: Line at index ${actualIndex} has empty ID, using fallback key: ${uniqueKey}`);
                  }
                }
                
                return (
                  <div
                    key={uniqueKey}
                    style={{ height: `${ITEM_HEIGHT}px` }}
                  >
                    <TerminalLine 
                      line={line} 
                      theme={theme} 
                      isLast={actualIndex === displayedOutput.length - 1} 
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Integrated input at the bottom */}
        {hasInputProps && (
          <div style={inputContainerStyle}>
            <TerminalInput
              value={currentInput!}
              onChange={onInputChange!}
              onKeyDown={onKeyDown!}
              currentDirectory={currentDirectory!}
              osType={osType!}
              username={username!}
              hostname={hostname!}
              theme={theme}
              isExecuting={isExecuting || false}
              cursorPosition={cursorPosition || 0}
              suggestions={suggestions || []}
              selectedSuggestion={selectedSuggestion || -1}
              showSuggestions={showSuggestions || false}
              commandRegistry={commandRegistry}
            />
          </div>
        )}
      </div>
    </>
  );
};

/**
 * Memoized terminal output with custom comparison
 */
export const TerminalOutput = memo(TerminalOutputComponent, (prevProps, nextProps) => {
  return (
    prevProps.output.length === nextProps.output.length &&
    prevProps.output === nextProps.output &&
    prevProps.theme === nextProps.theme &&
    prevProps.autoScroll === nextProps.autoScroll &&
    prevProps.maxLines === nextProps.maxLines &&
    prevProps.currentInput === nextProps.currentInput &&
    prevProps.isExecuting === nextProps.isExecuting &&
    prevProps.cursorPosition === nextProps.cursorPosition &&
    prevProps.showSuggestions === nextProps.showSuggestions
  );
});

TerminalOutput.displayName = 'TerminalOutput';
