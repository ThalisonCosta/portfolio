import React, { memo, useEffect, useRef } from 'react';
import type { TerminalOutputLine, TerminalTheme, OSType } from '../types';
import { TerminalLine } from './TerminalLine';
import { TerminalInput } from './TerminalInput';

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
}

/**
 * Terminal output display component
 * Renders all terminal output lines with virtual scrolling for performance
 */
export const TerminalOutput: React.FC<TerminalOutputProps> = memo(
  ({
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
  }) => {
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
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      backgroundColor: theme.background,
      scrollBehavior: 'smooth',
      // Custom scrollbar styling
      scrollbarWidth: 'thin',
      scrollbarColor: `${theme.comment} ${theme.background}`,
    };

    const contentStyle: React.CSSProperties = {
      flex: 1,
      padding: '8px 16px',
    };

    const inputContainerStyle: React.CSSProperties = {
      padding: '0',
      minHeight: 'auto',
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

    const hasInputProps =
      currentInput !== undefined && onInputChange && onKeyDown && currentDirectory && osType && username && hostname;

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
              displayedOutput.map((line, index) => (
                <TerminalLine key={line.id} line={line} theme={theme} isLast={index === displayedOutput.length - 1} />
              ))
            )}
          </div>

          {/* Integrated input at the bottom */}
          {hasInputProps && (
            <div style={inputContainerStyle}>
              <TerminalInput
                value={currentInput}
                onChange={onInputChange}
                onKeyDown={onKeyDown}
                currentDirectory={currentDirectory}
                osType={osType}
                username={username}
                hostname={hostname}
                theme={theme}
                isExecuting={isExecuting || false}
                cursorPosition={cursorPosition || 0}
                suggestions={suggestions || []}
                selectedSuggestion={selectedSuggestion || -1}
                showSuggestions={showSuggestions || false}
              />
            </div>
          )}
        </div>
      </>
    );
  }
);

TerminalOutput.displayName = 'TerminalOutput';
