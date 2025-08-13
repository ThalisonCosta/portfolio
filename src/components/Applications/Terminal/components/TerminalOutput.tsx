import React, { memo, useEffect, useRef } from 'react';
import type { TerminalOutputLine, TerminalTheme } from '../types';
import { TerminalLine } from './TerminalLine';

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
}

/**
 * Terminal output display component
 * Renders all terminal output lines with virtual scrolling for performance
 */
export const TerminalOutput: React.FC<TerminalOutputProps> = memo(
  ({ output, theme, autoScroll = true, maxLines = 1000 }) => {
    const outputRef = useRef<HTMLDivElement>(null);
    const isUserScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef<number | undefined>(undefined);

    /**
     * Handle scroll events to detect user scrolling
     */
    const handleScroll = () => {
      const element = outputRef.current;
      if (!element) return;

      const { scrollTop, scrollHeight, clientHeight } = element;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

      isUserScrollingRef.current = !isAtBottom;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      // Reset user scrolling flag after a delay
      scrollTimeoutRef.current = window.setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 1000);
    };

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

    // Limit output to maxLines for performance
    const displayedOutput = output.slice(-maxLines);

    const outputStyle: React.CSSProperties = {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '8px 16px',
      backgroundColor: theme.background,
      scrollBehavior: 'smooth',
      // Custom scrollbar styling
      scrollbarWidth: 'thin',
      scrollbarColor: `${theme.comment} ${theme.background}`,
    };

    const scrollbarStyle = `
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
  `;

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
            displayedOutput.map((line, index) => (
              <TerminalLine key={line.id} line={line} theme={theme} isLast={index === displayedOutput.length - 1} />
            ))
          )}
        </div>
      </>
    );
  }
);

TerminalOutput.displayName = 'TerminalOutput';
