import React, { useEffect, useRef, useMemo, useCallback, useState, useLayoutEffect } from 'react';
import type { VimState, VimTheme } from '../types';
import { useSyntaxHighlighter } from '../hooks/useSyntaxHighlighter';

/**
 * Props for TextBuffer component
 */
interface TextBufferProps {
  /** Current vim state */
  state: VimState;
  /** Vim theme for styling */
  theme: VimTheme;
  /** Callback for buffer changes */
  onBufferChange: (newBuffer: string[]) => void;
}

/**
 * TextBuffer - The main text editing area of the vim editor
 * 
 * Features:
 * - Virtual scrolling for performance
 * - Syntax highlighting
 * - Visual selection rendering
 * - Search highlighting
 * - Cursor positioning and rendering
 */
export const TextBuffer: React.FC<TextBufferProps> = ({
  state,
  theme,
}) => {
  const bufferRef = useRef<HTMLDivElement>(null);
  const { highlightLine, clearCache, getCacheStats } = useSyntaxHighlighter();

  // State for visible range to prevent infinite render loops
  const [visibleRange, setVisibleRange] = useState<[number, number]>([0, Math.min(state.buffer.length, 50)]);
  
  // Calculate visible range without triggering renders
  const calculateVisibleRange = useCallback((): [number, number] => {
    const element = bufferRef.current;
    if (!element) return [0, Math.min(state.buffer.length, 50)];
    
    const lineHeight = 20;
    const viewportHeight = element.clientHeight;
    const scrollTop = element.scrollTop;
    
    const startLine = Math.floor(scrollTop / lineHeight);
    const endLine = Math.min(
      state.buffer.length,
      startLine + Math.ceil(viewportHeight / lineHeight) + 5 // Buffer for smooth scrolling
    );
    
    return [Math.max(0, startLine - 5), endLine]; // Buffer before for smooth scrolling
  }, [state.buffer.length]);

  // Update visible range after DOM changes (not during render)
  useLayoutEffect(() => {
    const newRange = calculateVisibleRange();
    setVisibleRange(newRange);
  }, [calculateVisibleRange, state.buffer.length]);

  // Handle scroll events to update visible range
  useEffect(() => {
    const element = bufferRef.current;
    if (!element) return;

    const handleScroll = () => {
      const newRange = calculateVisibleRange();
      setVisibleRange(newRange);
    };

    // Debounce scroll updates
    let scrollTimeout: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 16); // ~60fps
    };

    element.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [calculateVisibleRange]);
  
  // Clear syntax cache on large buffer changes to prevent memory leaks
  useEffect(() => {
    const bufferSize = state.buffer.reduce((total, line) => total + line.length, 0);
    
    // Clear cache if buffer becomes very large (>500KB)
    if (bufferSize > 500000) {
      const stats = getCacheStats();
      if (stats.syntaxCacheSize > 500) {
        console.log('Vim TextBuffer: Clearing syntax cache for large buffer');
        clearCache();
      }
    }
  }, [state.buffer, clearCache, getCacheStats]);

  // Auto-scroll to cursor when it moves (debounced for performance)
  useEffect(() => {
    const element = bufferRef.current;
    if (!element) return;

    // Debounce scrolling to prevent excessive DOM updates
    const timeoutId = setTimeout(() => {
      const lineHeight = 20; // Approximate line height
      const cursorTop = state.cursor.line * lineHeight;
      const viewportTop = element.scrollTop;
      const viewportBottom = viewportTop + element.clientHeight;

      // Scroll if cursor is outside viewport
      if (cursorTop < viewportTop || cursorTop > viewportBottom - lineHeight) {
        element.scrollTop = Math.max(0, cursorTop - element.clientHeight / 2);
      }
    }, 16); // ~60fps debouncing

    return () => clearTimeout(timeoutId);
  }, [state.cursor]);


  // Stabilize cursor and mode values to reduce re-renders
  const cursorLine = state.cursor.line;
  const cursorColumn = state.cursor.column;
  const currentMode = state.mode;
  const currentFilename = state.filename;

  // Generate line HTML with syntax highlighting using string manipulation (much faster than React elements)
  const generateLineHTML = useMemo(() => {
    return (lineText: string, lineIndex: number): string => {
      const highlightedLine = highlightLine(lineText, currentFilename);
      let html = '';
      
      // Pre-compute selection and cursor info for this line
      const isCursorLine = cursorLine === lineIndex;
      const cursorCol = isCursorLine ? cursorColumn : -1;
      
      // Handle empty lines
      if (lineText.length === 0) {
        if (isCursorLine) {
          return '<span class="vim-cursor">█</span>';
        }
        return '<span>&nbsp;</span>';
      }
      
      // Create segments based on syntax tokens and cursor position
      const segments: Array<{start: number, end: number, className: string, isCursor?: boolean}> = [];
      
      // Add syntax highlighting segments
      highlightedLine.tokens.forEach(token => {
        segments.push({
          start: token.start,
          end: token.end,
          className: `vim-syntax-${token.type}`
        });
      });
      
      // Add cursor segment if on this line
      if (isCursorLine && cursorCol >= 0 && cursorCol < lineText.length && currentMode !== 'insert') {
        segments.push({
          start: cursorCol,
          end: cursorCol + 1,
          className: 'vim-cursor',
          isCursor: true
        });
      }
      
      // Sort segments and merge overlapping ones
      segments.sort((a, b) => a.start - b.start);
      
      let currentPos = 0;
      
      for (const segment of segments) {
        // Add text before segment
        if (currentPos < segment.start) {
          const text = lineText.slice(currentPos, segment.start);
          html += escapeHtml(text);
        }
        
        // Add segment with styling
        const segmentText = lineText.slice(segment.start, segment.end);
        html += `<span class="${segment.className}">${escapeHtml(segmentText)}</span>`;
        
        currentPos = Math.max(currentPos, segment.end);
      }
      
      // Add remaining text
      if (currentPos < lineText.length) {
        const remainingText = lineText.slice(currentPos);
        html += escapeHtml(remainingText);
      }
      
      // Add cursor at end of line for insert mode
      if (isCursorLine && currentMode === 'insert' && cursorCol === lineText.length) {
        html += '<span class="vim-cursor">█</span>';
      }
      
      return html || '&nbsp;';
    };
  }, [cursorLine, cursorColumn, currentMode, currentFilename, highlightLine]);

  // Helper function to escape HTML
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/ /g, '&nbsp;');
  };

  const [startLine, endLine] = visibleRange;

  const containerStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: '8px 12px',
    backgroundColor: theme.background,
    color: theme.foreground,
    lineHeight: '20px',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    whiteSpace: 'pre',
    position: 'relative',
  };

  const virtualSpacerStyle: React.CSSProperties = {
    height: `${state.buffer.length * 20}px`,
    position: 'relative',
  };

  const visibleContentStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${startLine * 20}px`,
    left: 0,
    right: 0,
  };

  const lineStyle = (lineIndex: number): React.CSSProperties => ({
    height: '20px',
    minHeight: '20px',
    backgroundColor: lineIndex === state.cursor.line ? theme.currentLineBackground : 'transparent',
    padding: '0 4px',
    margin: 0,
  });

  return (
    <div
      ref={bufferRef}
      style={containerStyle}
      className="vim-text-buffer"
      role="textbox"
      aria-label="Text editor content"
      aria-multiline={true}
    >
      <div style={virtualSpacerStyle}>
        <div style={visibleContentStyle}>
          {state.buffer.slice(startLine, endLine).map((line, index) => {
            const actualLineIndex = startLine + index;
            const lineHTML = generateLineHTML(line, actualLineIndex);
            
            return (
              <div
                key={actualLineIndex}
                style={lineStyle(actualLineIndex)}
                className={`vim-line ${actualLineIndex === state.cursor.line ? 'vim-current-line' : ''}`}
                dangerouslySetInnerHTML={{ __html: lineHTML }}
              />
            );
          })}
          
          {/* Empty buffer placeholder */}
          {state.buffer.length === 0 && (
            <div style={lineStyle(0)} className="vim-line vim-current-line">
              <span className="vim-cursor">█</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};