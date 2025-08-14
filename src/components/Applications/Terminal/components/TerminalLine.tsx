import React, { memo } from 'react';
import type { TerminalOutputLine, TerminalTheme } from '../types';
import { AnsiColorizer } from '../utils/colors';

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
 * Handles different line types and ANSI color rendering
 */
export const TerminalLine: React.FC<TerminalLineProps> = memo(({ line, theme, isLast }) => {
  /**
   * Get color for line type
   */
  const getLineColor = (type: TerminalOutputLine['type']): string => {
    switch (type) {
      case 'input':
        return theme.foreground;
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
  };

  /**
   * Get additional styling for line type
   */
  const getLineStyle = (type: TerminalOutputLine['type']): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      color: getLineColor(type),
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
      fontSize: '14px',
      lineHeight: '1.4',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      margin: 0,
      padding: '2px 0',
    };

    switch (type) {
      case 'input':
        return {
          ...baseStyle,
          fontWeight: 500,
        };
      case 'error':
        return {
          ...baseStyle,
          fontWeight: 500,
        };
      case 'success':
        return {
          ...baseStyle,
          fontWeight: 500,
        };
      case 'warning':
        return {
          ...baseStyle,
          fontWeight: 500,
        };
      default:
        return baseStyle;
    }
  };

  /**
   * Check if content contains HTML tags or ANSI codes that need to be rendered
   */
  const hasHtmlContent = line.content.includes('<span') || line.content.includes('</span>');
  const hasAnsiCodes = line.content.includes('\x1b[');
  const needsHtmlRendering = hasHtmlContent || hasAnsiCodes;

  // Convert ANSI color codes to HTML if present, otherwise use content as-is
  const processedContent = hasAnsiCodes ? AnsiColorizer.ansiToHtml(line.content) : line.content;

  return (
    <div
      style={getLineStyle(line.type)}
      className={`terminal-line terminal-line--${line.type} ${line.className || ''}`}
      data-line-id={line.id}
      data-timestamp={line.timestamp.toISOString()}
      ref={
        isLast
          ? (el) => {
              if (el && typeof el.scrollIntoView === 'function') {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }
          : undefined
      }
    >
      {needsHtmlRendering ? <span dangerouslySetInnerHTML={{ __html: processedContent }} /> : processedContent}
    </div>
  );
});

TerminalLine.displayName = 'TerminalLine';
