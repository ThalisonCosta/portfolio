import React, { useEffect, useRef, useState } from 'react';
import { TerminalOutput } from './components/TerminalOutput';
import { VimEditor } from './vim/VimEditor';
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
  const handleKeyDownRef = useRef<((event: KeyboardEvent) => void) | null>(null);

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
    isVimMode,
    vimData,

    // Autocomplete
    suggestions,
    selectedIndex,
    showSuggestions,

    // Actions
    updateInput,
    clearOutput,
    switchOS,
    handleKeyDown,
    clearHistory,
    exitVimMode,

    // File system operations for vim
    createFile,

    // Command registry for syntax highlighting
    commandRegistry,
  } = useTerminal();

  // Update ref with current handleKeyDown
  handleKeyDownRef.current = handleKeyDown;

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

    // Global keyboard handler - use ref to get current handleKeyDown
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Only handle if terminal is focused or if it's a global shortcut
      const isTerminalFocused = element.contains(document.activeElement);
      const isInputFocused = document.activeElement?.classList.contains('terminal-input');

      // Handle global shortcuts only when input is not focused to prevent double execution
      if (event.ctrlKey && !isInputFocused && handleKeyDownRef.current) {
        handleKeyDownRef.current(event);
        return;
      }

      // If the terminal input is focused, let it handle all key events
      // to prevent double execution of commands
      if (isInputFocused) {
        return;
      }

      // Handle other keys only when terminal is focused but input is not
      if (isTerminalFocused && handleKeyDownRef.current) {
        handleKeyDownRef.current(event);
      }
    };

    element.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      element.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []); // Remove handleKeyDown dependency

  /**
   * Initialize with the specified OS type
   */
  useEffect(() => {
    if (!isInitialized) {
      if (initialOS !== osType) {
        switchOS(initialOS);
      }
      setIsInitialized(true);
    }
  }, [initialOS, osType, switchOS, isInitialized]);

  /**
   * Handle OS switching
   */
  const handleOSSwitch = (newOS: OSType) => {
    switchOS(newOS);
  };

  /**
   * Vim file operations
   */
  const handleVimSaveFile = async (filename: string, content: string): Promise<boolean> => {
    try {
      const success = createFile?.(vimData?.currentDirectory || currentDirectory, filename, content);
      return success || false;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
    }
  };

  const handleVimLoadFile = async (_filename: string): Promise<string> => {
    try {
      // For now, return empty content - would need to implement file reading from store
      return '';
    } catch (error) {
      throw new Error(`Cannot read file: ${_filename}`);
    }
  };

  const handleVimFileExists = (_filename: string): boolean => {
    try {
      // Check if file exists in current directory
      // For now, return false - would need to implement file checking from store
      return false;
    } catch (error) {
      return false;
    }
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

  const switcherStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  const buttonStyle = (active: boolean, disabled: boolean = false): React.CSSProperties => ({
    padding: '4px 8px',
    border: 'none',
    backgroundColor: active ? theme.foreground : 'transparent',
    color: active ? theme.background : theme.comment,
    fontSize: '11px',
    borderRadius: '3px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    opacity: disabled && !active ? 0.5 : 1,
  });

  const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    fontWeight: 'bold',
  };

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
      {isVimMode && vimData ? (
        /* Vim Editor Mode */
        <VimEditor
          filename={vimData.filename}
          currentDirectory={vimData.currentDirectory}
          theme={theme}
          onExit={exitVimMode}
          onSaveFile={handleVimSaveFile}
          onLoadFile={handleVimLoadFile}
          onFileExists={handleVimFileExists}
        />
      ) : (
        /* Normal Terminal Mode */
        <>
          {/* Header with OS switcher and status */}
          <div style={headerStyle} className="terminal-header">
            <div style={titleStyle}>
              <span>📟</span>
              <span>Terminal</span>
            </div>

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
                  style={buttonStyle(osType === 'linux', isExecuting || osType === 'linux')}
                  onClick={() => handleOSSwitch('linux')}
                  disabled={isExecuting || osType === 'linux'}
                  title={osType === 'linux' ? 'Already in Linux mode' : 'Switch to Linux mode'}
                >
                  Linux
                </button>
                <button
                  style={buttonStyle(osType === 'windows', isExecuting || osType === 'windows')}
                  onClick={() => handleOSSwitch('windows')}
                  disabled={isExecuting || osType === 'windows'}
                  title={osType === 'windows' ? 'Already in Windows mode' : 'Switch to Windows mode'}
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
            commandRegistry={commandRegistry}
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
        </>
      )}

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
            padding: 12px 0px;
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
