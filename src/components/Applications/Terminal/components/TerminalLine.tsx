import React, { memo, useMemo, useCallback } from 'react';
import type { TerminalOutputLine, TerminalTheme } from '../types';
import { AnsiColorizer } from '../utils/colors';
import { StyleObjectPool } from '../utils/objectPools';

/**
 * Props for TerminalLine component
 */
interface TerminalLineProps {
  /** The output line data */
  line: TerminalOutputLine;
  /** Terminal theme for styling */
  theme: TerminalTheme;
  /** Whether this is the last line (for auto-scroll) */
  isLast?: boolean;
}

/**
 * Individual terminal output line component
 * Optimized with object pooling and memoization to reduce renders
 */
const TerminalLineComponent: React.FC<TerminalLineProps> = ({ line, theme, isLast }) => {
  /**
   * Memoized color getter using style pool
   */
  const lineColor = useMemo(() => {
    switch (line.type) {
      case 'input':
      case 'output':
        return theme.foreground;
      case 'error':
        return theme.error;
      case 'success':
        return theme.success;
      case 'warning':
        return theme.warning;
      case 'info':
        return theme.comment;
      default:
        return theme.foreground;
    }
  }, [line.type, theme.foreground, theme.error, theme.success, theme.warning, theme.comment]);

  /**
   * Memoized style object using style pool to prevent recreation
   */
  const lineStyle = useMemo(() => {
    const styleKey = `line-${line.type}-${lineColor}`;
    return StyleObjectPool.get(styleKey, () => {
      const baseStyle: React.CSSProperties = {
        color: lineColor,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
        fontSize: '14px',
        lineHeight: '1.4',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
        margin: 0,
        padding: '2px 0',
      };

      // Add font weight for special line types
      if (['input', 'error', 'success', 'warning'].includes(line.type)) {
        return { ...baseStyle, fontWeight: 500 };
      }

      return baseStyle;
    });
  }, [line.type, lineColor]);

  /**
   * Memoized content processing to avoid repeated ANSI parsing
   */
  const { needsHtmlRendering, processedContent } = useMemo(() => {
    const hasHtmlContent = line.content.includes('<span') || line.content.includes('</span>');
    const hasAnsiCodes = line.content.includes('\x1b[');
    const needsHtml = hasHtmlContent || hasAnsiCodes;

    return {
      needsHtmlRendering: needsHtml,
      processedContent: hasAnsiCodes ? AnsiColorizer.ansiToHtml(line.content) : line.content,
    };
  }, [line.content]);

  /**
   * Memoized scroll-into-view callback
   */
  const scrollRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (el && isLast && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [isLast]
  );

  return (
    <div
      style={lineStyle}
      className={`terminal-line terminal-line--${line.type} ${line.className || ''}`}
      data-line-id={line.id}
      data-timestamp={line.timestamp.toISOString()}
      ref={isLast ? scrollRef : undefined}
    >
      {needsHtmlRendering ? <span dangerouslySetInnerHTML={{ __html: processedContent }} /> : processedContent}
    </div>
  );
};

/**
 * Memoized terminal line with custom comparison function
 */
export const TerminalLine = memo(
  TerminalLineComponent,
  (prevProps, nextProps) =>
    // Custom comparison to prevent unnecessary re-renders
    prevProps.line.id === nextProps.line.id &&
    prevProps.line.content === nextProps.line.content &&
    prevProps.line.type === nextProps.line.type &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.theme === nextProps.theme
);

TerminalLine.displayName = 'TerminalLine';
