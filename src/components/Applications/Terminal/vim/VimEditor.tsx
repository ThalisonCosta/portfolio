import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { StatusBar } from './components/StatusBar';
import { TextBuffer } from './components/TextBuffer';
import { LineNumbers } from './components/LineNumbers';
import { VimErrorBoundary } from './components/VimErrorBoundary';
import { useVimState } from './hooks/useVimState';
import { useVimKeyHandler } from './hooks/useVimKeyHandler';
import { useMemoryMonitor } from './hooks/useMemoryMonitor';
import { useRenderProtection } from './hooks/useRenderProtection';
import type { VimEditorContext } from './types';
import type { TerminalTheme } from '../types';

/**
 * Props for VimEditor component
 */
interface VimEditorProps {
  /** Optional filename to open */
  filename?: string;
  /** Current working directory */
  currentDirectory: string;
  /** Terminal theme for consistent styling */
  theme: TerminalTheme;
  /** Function to exit vim mode */
  onExit: () => void;
  /** Function to save file */
  onSaveFile: (filename: string, content: string) => Promise<boolean>;
  /** Function to load file */
  onLoadFile: (filename: string) => Promise<string>;
  /** Function to check if file exists */
  onFileExists: (filename: string) => boolean;
}

/**
 * VimEditor - A comprehensive vim text editor component
 * 
 * Features:
 * - Modal editing (Normal, Insert, Visual, Command modes)
 * - Essential vim motions and operations
 * - LunarVim-inspired modern UI
 * - Syntax highlighting for TypeScript/JavaScript
 * - Search functionality with highlighting
 * - Undo/redo support
 * - Line numbers and enhanced status bar
 */
export const VimEditor: React.FC<VimEditorProps> = ({
  filename,
  currentDirectory,
  theme,
  onExit,
  onSaveFile,
  onLoadFile,
  onFileExists,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Create vim editor context (memoized to prevent recreation)
  const context = useMemo<VimEditorContext>(() => ({
    saveFile: onSaveFile,
    loadFile: onLoadFile,
    exitVim: onExit,
    fileExists: onFileExists,
    currentDirectory,
  }), [onSaveFile, onLoadFile, onExit, onFileExists, currentDirectory]);

  // Initialize vim state
  const {
    state,
    executeCommand,
    enterInsertMode,
    enterVisualMode,
    enterNormalMode,
    enterCommandMode,
    updateBuffer,
    moveCursor,
    undo,
    redo,
    setMessage,
    handleCommandInputChange,
  } = useVimState(filename, context);

  // Stable callback for memory warnings (prevent memory monitor restart)
  const onMemoryWarning = useCallback((stats: any) => {
    console.warn('Vim Editor: Memory usage warning', stats);
    setMessage('High memory usage detected', 'warning');
  }, [setMessage]);
  
  const onMemoryCritical = useCallback((stats: any) => {
    console.error('Vim Editor: Critical memory usage', stats);
    setMessage('Critical memory usage - performance may be affected', 'error');
  }, [setMessage]);

  // Memory monitoring with stable callbacks
  const { forceGarbageCollection, getCurrentMemoryUsage } = useMemoryMonitor({
    warningThresholdMB: 150,
    criticalThresholdMB: 300,
    onWarning: onMemoryWarning,
    onCritical: onMemoryCritical,
  });

  // Render protection to prevent infinite loops and crashes
  const { isThreatDetected, renderCount, rendersPerSecond } = useRenderProtection({
    maxRendersPerSecond: 30, // Conservative limit for text editor
    maxConsecutiveRenders: 50, // Prevent runaway renders
    componentName: 'VimEditor',
    onThreatDetected: () => {
      console.error('Vim Editor: Render threat detected, forcing exit');
      setMessage('Performance threat detected - exiting vim', 'error');
      // Emergency exit after short delay
      setTimeout(() => onExit(), 100);
    },
  });

  // Emergency bailout if render threat is detected
  if (isThreatDetected) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: theme.foreground,
        backgroundColor: theme.background,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
        fontSize: '14px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: theme.error || '#ff4444', marginBottom: '8px' }}>
            ⚠️ Performance Protection Activated
          </div>
          <div style={{ marginBottom: '8px' }}>
            Excessive renders detected: {renderCount} ({rendersPerSecond}/sec)
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Vim editor has been safely stopped to prevent browser crash.
          </div>
        </div>
      </div>
    );
  }

  // Handle keyboard events
  const { handleKeyDown } = useVimKeyHandler(state, {
    executeCommand,
    enterInsertMode,
    enterVisualMode,
    enterNormalMode,
    enterCommandMode,
    updateBuffer,
    moveCursor,
    undo,
    redo,
    setMessage,
    handleCommandInputChange,
  });

  // Focus editor when mounted
  useEffect(() => {
    const element = editorRef.current;
    if (element) {
      element.focus();
    }
  }, []);

  // Global keyboard event handler with cleanup
  useEffect(() => {
    const element = editorRef.current;
    if (!element) return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Performance guard: prevent processing if element is not visible
      if (element.offsetParent === null) return;
      
      // Prevent default browser shortcuts that conflict with vim
      if (event.ctrlKey && ['s', 'o', 'f', 'h', 'r', 'w', 'n', 't'].includes(event.key)) {
        event.preventDefault();
      }
      
      try {
        handleKeyDown(event);
      } catch (error) {
        console.error('Vim key handler error:', error);
        // Graceful degradation - don't crash the whole component
      }
    };

    // Use passive event listener for better performance
    element.addEventListener('keydown', handleGlobalKeyDown, { passive: false });
    
    return () => {
      element.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleKeyDown]);

  // Convert terminal theme to vim theme
  const vimTheme = {
    background: theme.background,
    foreground: theme.foreground,
    currentLineBackground: theme.selection,
    lineNumber: theme.comment,
    currentLineNumber: theme.foreground,
    statusBackground: theme.selection,
    statusForeground: theme.foreground,
    selectionBackground: theme.selection,
    searchHighlight: theme.warning,
    cursor: theme.cursor,
    syntax: {
      keyword: theme.success,
      string: theme.directory,
      comment: theme.comment,
      number: theme.warning,
      operator: theme.foreground,
      identifier: theme.foreground,
      type: theme.success,
    },
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: vimTheme.background,
    color: vimTheme.foreground,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
    fontSize: '14px',
    overflow: 'hidden',
    position: 'relative',
  };

  const editorAreaStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  };

  const lineNumbersStyle: React.CSSProperties = {
    flexShrink: 0,
  };

  const textAreaStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
  };

  const handleVimError = (error: Error) => {
    console.error('Vim Editor crashed:', error);
    setMessage('Editor crashed - restarting in safe mode', 'error');
    
    // Log memory usage for debugging
    console.log('Memory usage at crash:', getCurrentMemoryUsage());
    
    // Force cleanup
    forceGarbageCollection();
  };

  return (
    <VimErrorBoundary theme={vimTheme} onError={handleVimError}>
      <div
        ref={editorRef}
        style={containerStyle}
        className="vim-editor"
        tabIndex={0}
        role="application"
        aria-label="Vim Text Editor"
      >
        <div style={editorAreaStyle} className="vim-editor-area">
          {state.showLineNumbers && (
            <div style={lineNumbersStyle}>
              <LineNumbers
                buffer={state.buffer}
                currentLine={state.cursor.line}
                scrollOffset={state.scrollOffset}
                viewportHeight={state.viewportHeight}
                theme={vimTheme}
              />
            </div>
          )}
          
          <div style={textAreaStyle}>
            <TextBuffer
              state={state}
              theme={vimTheme}
              onBufferChange={updateBuffer}
            />
          </div>
        </div>

        <StatusBar
          state={state}
          theme={vimTheme}
          filename={filename}
          currentDirectory={currentDirectory}
        />

        {/* Vim-specific styling */}
        <style>{`
        .vim-editor {
          font-variant-ligatures: none;
          -webkit-font-feature-settings: "liga" 0;
          font-feature-settings: "liga" 0;
        }
        
        .vim-editor:focus {
          outline: none;
        }
        
        .vim-cursor {
          animation: vim-blink 1s infinite;
          background-color: ${vimTheme.cursor};
          color: ${vimTheme.background};
        }
        
        .vim-current-line {
          background-color: ${vimTheme.currentLineBackground};
        }
        
        .vim-selection {
          background-color: ${vimTheme.selectionBackground};
        }
        
        .vim-search-highlight {
          background-color: ${vimTheme.searchHighlight};
          color: ${vimTheme.background};
        }
        
        @keyframes vim-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        /* Syntax highlighting */
        .vim-syntax-keyword { color: ${vimTheme.syntax.keyword}; font-weight: bold; }
        .vim-syntax-string { color: ${vimTheme.syntax.string}; }
        .vim-syntax-comment { color: ${vimTheme.syntax.comment}; font-style: italic; }
        .vim-syntax-number { color: ${vimTheme.syntax.number}; }
        .vim-syntax-operator { color: ${vimTheme.syntax.operator}; }
        .vim-syntax-identifier { color: ${vimTheme.syntax.identifier}; }
        .vim-syntax-type { color: ${vimTheme.syntax.type}; font-weight: bold; }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .vim-editor {
            font-size: 12px;
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .vim-editor {
            border: 2px solid ${vimTheme.foreground};
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .vim-cursor {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
      </div>
    </VimErrorBoundary>
  );
};