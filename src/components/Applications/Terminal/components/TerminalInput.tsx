import React, { memo, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { TerminalTheme, OSType } from '../types';
import { TerminalPrompt } from './TerminalPrompt';
import { SyntaxHighlighter } from '../utils/colors';

/**
 * Props for TerminalInput component
 */
interface TerminalInputProps {
  /** Current input value */
  value: string;
  /** Input change handler */
  onChange: (value: string, cursorPosition?: number) => void;
  /** Key down handler */
  onKeyDown: (event: KeyboardEvent) => void;
  /** Current working directory */
  currentDirectory: string;
  /** Operating system type */
  osType: OSType;
  /** Username */
  username: string;
  /** Hostname */
  hostname: string;
  /** Terminal theme */
  theme: TerminalTheme;
  /** Whether terminal is executing */
  isExecuting: boolean;
  /** Cursor position */
  cursorPosition: number;
  /** Autocomplete suggestions */
  suggestions: string[];
  /** Selected suggestion index */
  selectedSuggestion: number;
  /** Whether to show suggestions */
  showSuggestions: boolean;
}

/**
 * Terminal input component with syntax highlighting and autocomplete
 */
export const TerminalInput: React.FC<TerminalInputProps> = memo(
  ({
    value,
    onChange,
    onKeyDown,
    currentDirectory,
    osType,
    username,
    hostname,
    theme,
    isExecuting,
    cursorPosition,
    suggestions,
    selectedSuggestion,
    showSuggestions,
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const [, setIsFocused] = useState(false);

    /**
     * Focus input on mount and when not executing
     */
    useEffect(() => {
      if (!isExecuting && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isExecuting]);

    /**
     * Handle input changes - optimized
     */
    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        const newCursorPosition = event.target.selectionStart || 0;
        onChange(newValue, newCursorPosition);
      },
      [onChange]
    );

    /**
     * Handle key down events - simplified
     */
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Convert React event to native event for the handler
        const { nativeEvent } = event;
        onKeyDown(nativeEvent);
      },
      [onKeyDown]
    );

    /**
     * Handle suggestion clicks
     */
    const handleSuggestionClick = useCallback(
      (suggestion: string) => {
        // Apply the suggestion
        const words = value.split(/\s+/);
        const beforeCursor = value.substring(0, cursorPosition);
        const currentWordIndex = Math.max(0, beforeCursor.split(/\s+/).length - 1);

        words[currentWordIndex] = suggestion;
        const newValue = words.join(' ');

        onChange(newValue, newValue.length);

        // Focus back to input
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
      [value, cursorPosition, onChange]
    );

    // Memoize styles for better performance
    const containerStyle: React.CSSProperties = useMemo(
      () => ({
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: theme.background,
        minHeight: '40px',
      }),
      [theme.background]
    );

    const inputContainerStyle: React.CSSProperties = useMemo(
      () => ({
        position: 'relative',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
      }),
      []
    );

    const inputStyle: React.CSSProperties = useMemo(
      () => ({
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: theme.foreground, // Show actual text for better performance
        caretColor: theme.cursor,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
        fontSize: '14px',
        lineHeight: '1.4',
        width: '100%',
        position: 'relative',
      }),
      [theme.foreground, theme.cursor]
    );

    const suggestionsStyle: React.CSSProperties = useMemo(
      () => ({
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        maxHeight: '200px',
        overflowY: 'auto',
        backgroundColor: theme.background,
        border: `1px solid ${theme.selection}`,
        borderRadius: '4px',
        zIndex: 1000,
        boxShadow: `0 4px 12px rgba(0, 0, 0, 0.3)`,
      }),
      [theme.background, theme.selection]
    );

    const getSuggestionStyle = useCallback(
      (index: number): React.CSSProperties => ({
        padding: '8px 12px',
        fontSize: '14px',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
        cursor: 'pointer',
        backgroundColor: index === selectedSuggestion ? theme.selection : 'transparent',
        color: index === selectedSuggestion ? theme.foreground : theme.comment,
        borderBottom: index < suggestions.length - 1 ? `1px solid ${theme.selection}` : 'none',
      }),
      [selectedSuggestion, suggestions.length, theme.selection, theme.foreground, theme.comment]
    );

    return (
      <div style={containerStyle} className="terminal-input-container">
        <TerminalPrompt
          currentDirectory={currentDirectory}
          osType={osType}
          username={username}
          hostname={hostname}
          theme={theme}
          isExecuting={isExecuting}
        />

        <div style={inputContainerStyle}>
          {/* Simplified input without overlay for better performance */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={inputStyle}
            disabled={isExecuting}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal command input"
            className="terminal-input"
          />

          {/* Autocomplete suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} style={suggestionsStyle} className="terminal-suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  style={getSuggestionStyle(index)}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="terminal-suggestion"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading indicator */}
        {isExecuting && (
          <div
            style={{
              marginLeft: '8px',
              color: theme.comment,
              fontSize: '12px',
            }}
          >
            <span className="terminal-spinner">⠋</span>
          </div>
        )}

        {/* Spinner animation */}
        <style>{`
        @keyframes spin {
          0% { content: '⠋'; }
          12.5% { content: '⠙'; }
          25% { content: '⠹'; }
          37.5% { content: '⠸'; }
          50% { content: '⠼'; }
          62.5% { content: '⠴'; }
          75% { content: '⠦'; }
          87.5% { content: '⠧'; }
          100% { content: '⠇'; }
        }
        .terminal-spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
      </div>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';
