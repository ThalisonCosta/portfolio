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
export const TextBuffer: React.FC<TextBufferProps> = ({ state, theme }) => {
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
    const { scrollTop } = element;

    const startLine = Math.floor(scrollTop / lineHeight);
    const endLine = Math.min(
      state.buffer.length,
      startLine + Math.ceil(viewportHeight / lineHeight) + 10 // Increased buffer for new lines
    );

    // Ensure cursor line is always included in visible range
    const cursorLine = state.cursor.line;
    const adjustedStartLine = Math.max(0, Math.min(startLine - 5, cursorLine - 5));
    const adjustedEndLine = Math.max(endLine, cursorLine + 10);

    return [adjustedStartLine, Math.min(adjustedEndLine, state.buffer.length)];
  }, [state.buffer.length, state.cursor.line]);

  // Update visible range after DOM changes (not during render)
  useLayoutEffect(() => {
    const newRange = calculateVisibleRange();
    setVisibleRange(newRange);
  }, [calculateVisibleRange, state.buffer.length]);

  // Immediate scroll adjustment for new lines (fixes Enter key visibility)
  useLayoutEffect(() => {
    const element = bufferRef.current;
    if (!element) return;

    const lineHeight = 20;
    const cursorTop = state.cursor.line * lineHeight;
    const viewportTop = element.scrollTop;
    const viewportBottom = viewportTop + element.clientHeight;

    // If cursor is outside viewport, scroll immediately (no delay)
    if (cursorTop < viewportTop || cursorTop > viewportBottom - lineHeight) {
      element.scrollTop = Math.max(0, cursorTop - element.clientHeight / 2);

      // Update visible range immediately after scroll
      const newRange = calculateVisibleRange();
      setVisibleRange(newRange);
    }
  }, [state.cursor.line, state.cursor.column, calculateVisibleRange]);

  // Consolidated effect for scroll handling and memory management
  useEffect(() => {
    const element = bufferRef.current;
    if (!element) return;

    let scrollTimeout: NodeJS.Timeout;
    let cursorScrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const newRange = calculateVisibleRange();
        setVisibleRange(newRange);
      }, 16);
    };

    const handleCursorScroll = () => {
      clearTimeout(cursorScrollTimeout);
      // Reduced delay for better responsiveness, especially for Enter key
      cursorScrollTimeout = setTimeout(() => {
        const lineHeight = 20;
        const cursorTop = state.cursor.line * lineHeight;
        const viewportTop = element.scrollTop;
        const viewportBottom = viewportTop + element.clientHeight;

        if (cursorTop < viewportTop || cursorTop > viewportBottom - lineHeight) {
          element.scrollTop = Math.max(0, cursorTop - element.clientHeight / 2);

          // Update visible range after programmatic scroll
          const newRange = calculateVisibleRange();
          setVisibleRange(newRange);
        }
      }, 8); // Reduced from 16ms to 8ms for more responsive cursor following
    };

    // Memory management for large buffers
    const bufferSize = state.buffer.reduce((total, line) => total + line.length, 0);
    if (bufferSize > 500000) {
      const stats = getCacheStats();
      if (stats.syntaxCacheSize > 500) {
        console.log('Vim TextBuffer: Clearing syntax cache for large buffer');
        clearCache();
      }
    }

    element.addEventListener('scroll', handleScroll, { passive: true });
    handleCursorScroll(); // Handle cursor scroll immediately

    return () => {
      element.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      clearTimeout(cursorScrollTimeout);
    };
  }, [calculateVisibleRange, state.cursor, state.buffer, clearCache, getCacheStats]);

  // Stabilize cursor and mode values to reduce re-renders
  const cursorLine = state.cursor.line;
  const cursorColumn = state.cursor.column;
  const currentMode = state.mode;
  const currentFilename = state.filename;

  // Generate line HTML with syntax highlighting using string manipulation (much faster than React elements)
  const generateLineHTML = useMemo(
    () =>
      (lineText: string, lineIndex: number): string => {
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
        const segments: Array<{ start: number; end: number; className: string; isCursor?: boolean }> = [];

        // Add syntax highlighting segments
        highlightedLine.tokens.forEach((token) => {
          segments.push({
            start: token.start,
            end: token.end,
            className: `vim-syntax-${token.type}`,
          });
        });

        // Add cursor segment if on this line
        if (isCursorLine && cursorCol >= 0 && cursorCol < lineText.length && currentMode !== 'insert') {
          segments.push({
            start: cursorCol,
            end: cursorCol + 1,
            className: 'vim-cursor',
            isCursor: true,
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
      },
    [cursorLine, cursorColumn, currentMode, currentFilename, highlightLine]
  );

  // Helper function to escape HTML
  const escapeHtml = (text: string): string =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/ /g, '&nbsp;');

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
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
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
