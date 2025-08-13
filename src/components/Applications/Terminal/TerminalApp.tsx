import React, { useEffect, useRef, useState } from 'react';
import { TerminalOutput } from './components/TerminalOutput';
import { useTerminal } from './hooks/useTerminal';
import type { OSType } from './types';

/**
 * Props for TerminalApp component
 */
interface TerminalAppProps {
  /** Initial OS type */
  initialOS?: OSType;
  /** Whether to show OS switcher */
  showOSSwitcher?: boolean;
}

/**
 * Main Terminal Application Component
 *
 * A comprehensive terminal emulator with:
 * - Full Linux and Windows command support
 * - Oh My Zsh inspired styling
 * - Tab completion and command history
 * - Real-time syntax highlighting
 * - Network command simulation
 * - File system integration
 */
export const TerminalApp: React.FC<TerminalAppProps> = ({ initialOS = 'linux', showOSSwitcher = true }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    // State
    output,
    currentInput,
    currentDirectory,
    osType,
    isExecuting,
    theme,
    username,
    hostname,
    cursorPosition,

    // Autocomplete
    suggestions,
    selectedIndex,
    showSuggestions,

    // Actions
    updateInput,
    clearOutput,
    switchOS,
    handleKeyDown,
    getCurrentPrompt,
    clearHistory,
  } = useTerminal();

  /**
   * Set up global keyboard event listeners
   */
  useEffect(() => {
    const element = terminalRef.current;
    if (!element) return;

    // Focus terminal when clicked
    const handleClick = () => {
      const input = element.querySelector('.terminal-input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    };

    // Global keyboard handler
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Only handle if terminal is focused or if it's a global shortcut
      const isTerminalFocused = element.contains(document.activeElement);

      if (isTerminalFocused || event.ctrlKey) {
        handleKeyDown(event);
      }
    };

    element.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      element.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleKeyDown]);

  /**
   * Initialize with the specified OS type
   */
  useEffect(() => {
    if (!isInitialized && initialOS !== osType) {
      switchOS(initialOS);
      setIsInitialized(true);
    }
  }, [initialOS, osType, switchOS, isInitialized]);

  /**
   * Handle OS switching
   */
  const handleOSSwitch = (newOS: OSType) => {
    switchOS(newOS);
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: theme.background,
    color: theme.foreground,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
    fontSize: '14px',
    overflow: 'hidden',
    position: 'relative',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: theme.selection,
    borderBottom: `1px solid ${theme.comment}`,
    fontSize: '12px',
    color: theme.comment,
  };

  const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const switcherStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 8px',
    border: 'none',
    backgroundColor: active ? theme.foreground : 'transparent',
    color: active ? theme.background : theme.comment,
    fontSize: '11px',
    borderRadius: '3px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  });

  const statusStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '11px',
  };

  return (
    <div
      ref={terminalRef}
      style={containerStyle}
      className="terminal-app"
      tabIndex={0}
      role="application"
      aria-label="Terminal Application"
    >
      {/* Header with OS switcher and status */}
      <div style={headerStyle} className="terminal-header">
        {/* <div style={titleStyle}>
          <span>📟</span>
          <span>Terminal</span>
        </div> */}

        <div style={statusStyle}>
          {/* <span>{getCurrentPrompt().trim()}</span> */}
          {/* <span>|</span> */}
          <span>{osType === 'linux' ? '🐧 Linux' : '🪟 Windows'}</span>
          {isExecuting && (
            <>
              <span>|</span>
              <span style={{ color: theme.warning }}>Running...</span>
            </>
          )}
        </div>

        {showOSSwitcher && (
          <div style={switcherStyle}>
            <span style={{ fontSize: '11px', color: theme.comment }}>OS:</span>
            <button
              style={buttonStyle(osType === 'linux')}
              onClick={() => handleOSSwitch('linux')}
              disabled={isExecuting}
              title="Switch to Linux mode"
            >
              Linux
            </button>
            <button
              style={buttonStyle(osType === 'windows')}
              onClick={() => handleOSSwitch('windows')}
              disabled={isExecuting}
              title="Switch to Windows mode"
            >
              Windows
            </button>
          </div>
        )}
      </div>

      {/* Terminal Output with integrated input */}
      <TerminalOutput
        output={output}
        theme={theme}
        autoScroll={true}
        maxLines={1000}
        // Pass input props for integrated display
        currentInput={currentInput}
        onInputChange={updateInput}
        onKeyDown={handleKeyDown}
        currentDirectory={currentDirectory}
        osType={osType}
        username={username}
        hostname={hostname}
        isExecuting={isExecuting}
        cursorPosition={cursorPosition}
        suggestions={suggestions}
        selectedSuggestion={selectedIndex}
        showSuggestions={showSuggestions}
      />

      {/* Hidden commands for accessibility */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <button onClick={clearOutput} aria-label="Clear terminal output">
          Clear (Ctrl+L)
        </button>
        <button onClick={clearHistory} aria-label="Clear command history">
          Clear History
        </button>
      </div>

      {/* Terminal styling and animations */}
      <style>{`
        .terminal-app {
          font-variant-ligatures: none;
          -webkit-font-feature-settings: "liga" 0;
          font-feature-settings: "liga" 0;
        }
        
        .terminal-app *:focus {
          outline: none;
        }
        
        .terminal-input::selection {
          background-color: ${theme.selection};
          color: ${theme.foreground};
        }
        
        .terminal-suggestion:hover {
          background-color: ${theme.selection} !important;
          color: ${theme.foreground} !important;
        }
        
        .terminal-line {
          animation: fadeIn 0.1s ease-in;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .terminal-cursor {
          animation: blink 1s infinite;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .terminal-header {
            flex-direction: column;
            gap: 8px;
            padding: 12px 16px;
          }
          
          .terminal-input-container {
            padding: 12px 16px;
          }
          
          .terminal-output {
            padding: 12px 16px;
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .terminal-app {
            border: 2px solid ${theme.foreground};
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .terminal-line {
            animation: none;
          }
          
          .terminal-cursor {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
