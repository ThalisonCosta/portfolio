import React, { useMemo } from 'react';
import { Position, EditorSettings } from '../../types/textEditor.types';

/**
 * Props for LineNumbers component
 */
interface LineNumbersProps {
  content: string;
  cursorPosition: Position;
  settings: EditorSettings;
  onLineClick?: (lineNumber: number) => void;
  className?: string;
}

/**
 * Line numbers component for the text editor
 */
export const LineNumbers: React.FC<LineNumbersProps> = ({
  content,
  cursorPosition,
  settings,
  onLineClick,
  className = '',
}) => {
  /**
   * Calculate line numbers and related data
   */
  const lineData = useMemo(() => {
    const lines = content.split('\n');
    const totalLines = lines.length;
    const maxDigits = totalLines.toString().length;

    return {
      lines,
      totalLines,
      maxDigits,
    };
  }, [content]);

  /**
   * Handle clicking on a line number
   */
  const handleLineClick = (lineNumber: number) => {
    if (onLineClick) {
      onLineClick(lineNumber - 1); // Convert to 0-based index
    }
  };

  if (!settings.lineNumbers) {
    return null;
  }

  const lineNumberStyle: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
    lineHeight: '1.5',
    padding: '8px 8px 8px 4px',
    backgroundColor: settings.theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
    color: settings.theme === 'dark' ? '#858585' : '#999999',
    borderRight: `1px solid ${settings.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
    textAlign: 'right',
    userSelect: 'none',
    minWidth: `${lineData.maxDigits * 8 + 16}px`,
    boxSizing: 'border-box',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  };

  const lineStyle: React.CSSProperties = {
    display: 'block',
    padding: '0 4px',
    cursor: 'pointer',
    minHeight: '1.5em',
    transition: 'background-color 0.1s ease',
  };

  const activeLineStyle: React.CSSProperties = {
    ...lineStyle,
    backgroundColor: settings.theme === 'dark' ? '#404040' : '#e8f4fd',
    color: settings.theme === 'dark' ? '#ffffff' : '#333333',
    fontWeight: 'bold',
  };

  return (
    <div className={`text-editor-line-numbers ${className}`} style={lineNumberStyle}>
      <div style={containerStyle}>
        {Array.from({ length: lineData.totalLines }, (_, index) => {
          const lineNumber = index + 1;
          const isActiveLine = cursorPosition.line === index;

          return (
            <span
              key={lineNumber}
              style={isActiveLine ? activeLineStyle : lineStyle}
              onClick={() => handleLineClick(lineNumber)}
              onMouseEnter={(e) => {
                if (!isActiveLine) {
                  e.currentTarget.style.backgroundColor = settings.theme === 'dark' ? '#353535' : '#f0f0f0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActiveLine) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              title={`Go to line ${lineNumber}`}
            >
              {lineNumber.toString().padStart(lineData.maxDigits, ' ')}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default LineNumbers;
