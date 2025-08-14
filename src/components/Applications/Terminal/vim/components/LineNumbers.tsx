import React from 'react';
import type { VimTheme } from '../types';

/**
 * Props for LineNumbers component
 */
interface LineNumbersProps {
  /** Text buffer (array of lines) */
  buffer: string[];
  /** Current cursor line (0-based) */
  currentLine: number;
  /** Scroll offset from top */
  scrollOffset: number;
  /** Viewport height in lines */
  viewportHeight: number;
  /** Vim theme for styling */
  theme: VimTheme;
  /** Whether to show relative line numbers */
  relative?: boolean;
}

/**
 * LineNumbers - Line number gutter for the vim editor
 * 
 * Features:
 * - Absolute and relative line numbers
 * - Current line highlighting
 * - Responsive design
 * - Virtual scrolling support
 */
export const LineNumbers: React.FC<LineNumbersProps> = ({
  buffer,
  currentLine,
  scrollOffset,
  viewportHeight,
  theme,
  relative = false,
}) => {
  // Calculate the width needed for line numbers
  const getLineNumberWidth = (): number => {
    const maxLineNumber = buffer.length;
    const digits = Math.max(2, Math.floor(Math.log10(maxLineNumber)) + 1);
    return Math.max(40, digits * 8 + 16); // 8px per digit + padding
  };

  // Get the display number for a line
  const getDisplayNumber = (lineIndex: number): string => {
    if (relative && lineIndex !== currentLine) {
      const distance = Math.abs(lineIndex - currentLine);
      return distance.toString();
    }
    return (lineIndex + 1).toString(); // 1-based for display
  };

  // Calculate visible lines for virtual scrolling
  const getVisibleRange = (): [number, number] => {
    const lineHeight = 20;
    const startLine = Math.max(0, Math.floor(scrollOffset / lineHeight) - 5);
    const endLine = Math.min(
      buffer.length,
      startLine + Math.ceil(viewportHeight / lineHeight) + 10
    );
    return [startLine, endLine];
  };

  const [startLine, endLine] = getVisibleRange();
  const lineNumberWidth = getLineNumberWidth();

  const containerStyle: React.CSSProperties = {
    width: `${lineNumberWidth}px`,
    backgroundColor: theme.background,
    borderRight: `1px solid ${theme.currentLineBackground}`,
    overflow: 'hidden',
    position: 'relative',
    fontSize: '12px',
    lineHeight: '20px',
    fontFamily: 'inherit',
  };

  const virtualSpacerStyle: React.CSSProperties = {
    height: `${buffer.length * 20}px`,
    position: 'relative',
  };

  const visibleContentStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${startLine * 20}px`,
    left: 0,
    right: 0,
  };

  const lineNumberStyle = (lineIndex: number): React.CSSProperties => ({
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '8px',
    color: lineIndex === currentLine ? theme.currentLineNumber : theme.lineNumber,
    backgroundColor: lineIndex === currentLine ? theme.currentLineBackground : 'transparent',
    fontWeight: lineIndex === currentLine ? 'bold' : 'normal',
    cursor: 'default',
    userSelect: 'none',
  });

  return (
    <div style={containerStyle} className="vim-line-numbers">
      <div style={virtualSpacerStyle}>
        <div style={visibleContentStyle}>
          {buffer.slice(startLine, endLine).map((_, index) => {
            const actualLineIndex = startLine + index;
            return (
              <div
                key={actualLineIndex}
                style={lineNumberStyle(actualLineIndex)}
                className={`vim-line-number ${actualLineIndex === currentLine ? 'current' : ''}`}
              >
                {getDisplayNumber(actualLineIndex)}
              </div>
            );
          })}
          
          {/* Handle empty buffer */}
          {buffer.length === 0 && (
            <div style={lineNumberStyle(0)} className="vim-line-number current">
              1
            </div>
          )}
        </div>
      </div>
    </div>
  );
};