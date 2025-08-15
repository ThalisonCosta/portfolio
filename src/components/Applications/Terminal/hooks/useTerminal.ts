import { useState, useCallback, useRef, useEffect } from 'react';
import type { TerminalState, TerminalOutputLine, CommandContext, CommandResult, OSType } from '../types';
import { CommandRegistry, createCommandRegistry } from '../commands';
import { CommandParser } from '../utils/parser';
import { ohMyZshTheme, windowsTheme } from '../utils/colors';
import { useDesktopStore } from '../../../../stores/useDesktopStore';
import { useCommandHistory } from './useCommandHistory';
import { useAutocomplete } from './useAutocomplete';
import { terminalLinePool, PoolManager } from '../utils/objectPools';

/**
 * Main terminal state management hook
 */
export function useTerminal() {
  const { fileSystem, createFile, createFolder, removeFileSystemItem } = useDesktopStore();

  const [state, setState] = useState<TerminalState>({
    output: [],
    currentInput: '',
    currentDirectory: '/Desktop',
    history: [],
    historyIndex: -1,
    osType: 'linux',
    isExecuting: false,
    theme: ohMyZshTheme,
    username: 'portfolio',
    hostname: 'thalison',
    env: {
      PATH: '/usr/local/bin:/usr/bin:/bin',
      HOME: '/Desktop',
      USER: 'portfolio',
    },
    suggestions: [],
    showSuggestions: false,
    selectedSuggestion: -1,
    cursorPosition: 0,
  });

  // Command registry
  const commandRegistryRef = useRef<CommandRegistry>(createCommandRegistry(state.osType));
  const commandRegistry = commandRegistryRef.current;

  // Track if welcome messages have been shown to prevent duplication
  const welcomeShown = useRef(false);

  // Command history hook
  const { addToHistory, navigateHistory, searchHistory, resetHistoryIndex, clearHistory } = useCommandHistory(
    state.osType
  );

  // Autocomplete hook
  const {
    suggestions,
    selectedIndex,
    isVisible: showSuggestions,
    updateSuggestions,
    navigateSuggestions,
    getTabCompletion,
    hideSuggestions,
    clearSuggestions,
  } = useAutocomplete(commandRegistry, state.currentDirectory, fileSystem, state.osType);

  // Update command registry when OS type changes
  useEffect(() => {
    commandRegistryRef.current = createCommandRegistry(state.osType);
    setState((prev) => ({
      ...prev,
      theme: prev.osType === 'linux' ? ohMyZshTheme : windowsTheme,
    }));
  }, [state.osType]);

  /**
   * Add a new output line using object pooling
   */
  const addOutputLine = useCallback((content: string, type: TerminalOutputLine['type'] = 'output') => {
    // Get line from pool instead of creating new object
    const newLine = terminalLinePool.acquire();

    // Initialize the pooled line
    newLine.id = `line-${Date.now()}-${Math.random()}`;
    newLine.content = content;
    newLine.type = type;
    newLine.timestamp = new Date();
    newLine.className = '';

    setState((prev) => {
      const newOutput = [...prev.output, newLine];

      // Memory management: limit output to 1000 lines to prevent memory growth
      let limitedOutput = newOutput;
      if (newOutput.length > 1000) {
        // Return old lines to pool before removing them
        const linesToRemove = newOutput.slice(0, newOutput.length - 1000);
        linesToRemove.forEach((line) => terminalLinePool.release(line));
        limitedOutput = newOutput.slice(-1000);
      }

      return {
        ...prev,
        output: limitedOutput,
      };
    });
  }, []);

  /**
   * Clear terminal output and return lines to pool
   */
  const clearOutput = useCallback(() => {
    setState((prev) => {
      // Return all lines to pool before clearing
      prev.output.forEach((line) => terminalLinePool.release(line));

      return {
        ...prev,
        output: [],
      };
    });
  }, []);

  /**
   * Update current input
   */
  const updateInput = useCallback(
    (input: string, cursorPosition?: number, fromHistory?: boolean) => {
      setState((prev) => ({
        ...prev,
        currentInput: input,
        cursorPosition: cursorPosition ?? input.length,
      }));

      // Only reset history index if not navigating through history
      if (!fromHistory) {
        resetHistoryIndex();
      }

      // Update autocomplete suggestions
      if (input.trim()) {
        updateSuggestions(input, cursorPosition ?? input.length);
      } else {
        clearSuggestions();
      }
    },
    [resetHistoryIndex, updateSuggestions, clearSuggestions]
  );

  /**
   * Generate colored prompt for output
   */
  const getColoredPrompt = useCallback((): string => {
    if (state.osType === 'windows') {
      const windowsPath = `C:\\${state.currentDirectory.replace(/\//g, '\\')}`;
      return `<span style="color: ${state.theme.prompt}; font-weight: bold;">${windowsPath}></span> `;
    }

    // Linux/Unix style prompt with colors
    const displayDir = state.currentDirectory === '/Desktop' ? '~' : state.currentDirectory;
    return (
      `<span style="color: ${state.theme.success}; font-weight: bold;">${state.username}</span>` +
      `<span style="color: ${state.theme.foreground};">@</span>` +
      `<span style="color: ${state.theme.directory}; font-weight: bold;">${state.hostname}</span>` +
      `<span style="color: ${state.theme.foreground};">:</span>` +
      `<span style="color: ${state.theme.directory}; font-weight: bold;">${displayDir}</span>` +
      `<span style="color: ${state.theme.prompt}; font-weight: bold;">$</span> `
    );
  }, [state.osType, state.currentDirectory, state.username, state.hostname, state.theme]);

  /**
   * Execute a command
   */
  const executeCommand = useCallback(
    async (input: string) => {
      const trimmedInput = input.trim();

      // Add input to output with colored prompt
      const coloredPrompt = getColoredPrompt();
      addOutputLine(`${coloredPrompt}${input}`, 'input');

      // If empty command, just add a blank line and return
      if (!trimmedInput) {
        setState((prev) => ({
          ...prev,
          currentInput: '',
          cursorPosition: 0,
        }));
        return;
      }

      // Add to history
      addToHistory(trimmedInput);

      // Set executing state
      setState((prev) => ({ ...prev, isExecuting: true }));

      try {
        // Parse command
        const parsed = CommandParser.parse(trimmedInput);

        if (!parsed.command) {
          setState((prev) => ({ ...prev, isExecuting: false }));
          return;
        }

        // Get command from registry
        const command = commandRegistry.getCommand(parsed.command);

        if (!command) {
          const errorMsg =
            state.osType === 'windows'
              ? `'${parsed.command}' is not recognized as an internal or external command, operable program or batch file.`
              : `${parsed.command}: command not found`;

          addOutputLine(errorMsg, 'error');
          setState((prev) => ({ ...prev, isExecuting: false }));
          return;
        }

        // Create command context
        const context: CommandContext = {
          currentDirectory: state.currentDirectory,
          osType: state.osType,
          env: state.env,
          history: state.history,
          fileSystem,
          username: state.username,
          hostname: state.hostname,
          createFile,
          createFolder,
          removeFileSystemItem,
        };

        // Execute command
        const result: CommandResult = await command.execute(parsed.args, context);

        // Handle vim mode entry
        if (result.type === 'vim' && result.vimData) {
          setState((prev) => ({
            ...prev,
            isVimMode: true,
            vimData: result.vimData,
            isExecuting: false,
            currentInput: '',
            cursorPosition: 0,
          }));
          return;
        }

        // Handle result
        if (result.clear) {
          clearOutput();
        } else if (result.output) {
          addOutputLine(result.output, (result.type === 'vim' ? 'output' : result.type) || 'output');
        }

        if (result.error) {
          addOutputLine(result.error, 'error');
        }

        if (result.newDirectory) {
          setState((prev) => ({
            ...prev,
            currentDirectory: result.newDirectory!,
          }));
        }

        if (result.exit) {
          // In a real app, this might close the terminal window
          addOutputLine('Terminal session ended.', 'info');
        }
      } catch (error) {
        console.error('Command execution error:', error);
        addOutputLine(`Error executing command: ${error}`, 'error');
      } finally {
        setState((prev) => ({
          ...prev,
          isExecuting: false,
          currentInput: '',
          cursorPosition: 0,
        }));
        hideSuggestions();
      }
    },
    [
      state.osType,
      state.currentDirectory,
      state.username,
      state.hostname,
      state.env,
      state.history,
      addOutputLine,
      addToHistory,
      commandRegistry,
      fileSystem,
      clearOutput,
      hideSuggestions,
      getColoredPrompt,
      createFile,
      createFolder,
      removeFileSystemItem,
    ]
  );

  /**
   * Handle keyboard shortcuts and navigation
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (state.isExecuting) return;

      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          executeCommand(state.currentInput);
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (showSuggestions) {
            const suggestion = navigateSuggestions('up');
            if (suggestion) {
              // Preview suggestion but don't apply yet
            }
          } else {
            const historyCommand = navigateHistory('up');
            if (historyCommand !== null) {
              updateInput(historyCommand, undefined, true); // fromHistory = true
            }
          }
          break;

        case 'ArrowDown':
          event.preventDefault();
          if (showSuggestions) {
            const suggestion = navigateSuggestions('down');
            if (suggestion) {
              // Preview suggestion but don't apply yet
            }
          } else {
            const historyCommand = navigateHistory('down');
            if (historyCommand !== null) {
              updateInput(historyCommand, undefined, true); // fromHistory = true
            }
          }
          break;

        case 'Tab': {
          event.preventDefault();
          const completion = getTabCompletion(state.currentInput, state.cursorPosition);
          updateInput(completion.newInput, completion.newCursorPosition);
          break;
        }

        case 'Escape':
          event.preventDefault();
          hideSuggestions();
          break;

        case 'c':
          if (event.ctrlKey) {
            event.preventDefault();
            const coloredPrompt = getColoredPrompt();
            addOutputLine(`${coloredPrompt}${state.currentInput}^C`, 'input');
            updateInput('');
            hideSuggestions();
          }
          break;

        case 'l':
          if (event.ctrlKey) {
            event.preventDefault();
            clearOutput();
          }
          break;

        case 'r':
          if (event.ctrlKey) {
            event.preventDefault();
            // Implement reverse history search
            addOutputLine('(reverse-i-search): ', 'info');
          }
          break;

        default:
          // Let other keys be handled by default input behavior
          break;
      }
    },
    [
      state.isExecuting,
      state.currentInput,
      state.cursorPosition,
      showSuggestions,
      executeCommand,
      navigateSuggestions,
      navigateHistory,
      getTabCompletion,
      updateInput,
      hideSuggestions,
      addOutputLine,
      clearOutput,
      getColoredPrompt,
    ]
  );

  /**
   * Switch operating system
   */
  const switchOS = useCallback(
    (newOSType: OSType) => {
      // Prevent unnecessary switching if already in the same OS
      if (state.osType === newOSType) {
        return;
      }

      setState((prev) => ({
        ...prev,
        osType: newOSType,
        theme: newOSType === 'linux' ? ohMyZshTheme : windowsTheme,
      }));
      commandRegistry.switchOS(newOSType);
      addOutputLine(`Switched to ${newOSType === 'linux' ? 'Linux' : 'Windows'} mode`, 'info');
    },
    [state.osType, commandRegistry, addOutputLine]
  );

  /**
   * Exit vim mode and return to terminal
   */
  const exitVimMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isVimMode: false,
      vimData: undefined,
    }));
  }, []);

  /**
   * Get current prompt string
   */
  const getCurrentPrompt = useCallback(() => {
    if (state.osType === 'windows') {
      return `C:\\${state.currentDirectory.replace(/\//g, '\\')}> `;
    }
    const dir = state.currentDirectory === '/Desktop' ? '~' : state.currentDirectory;
    return `${state.username}@${state.hostname}:${dir}$ `;
  }, [state.osType, state.currentDirectory, state.username, state.hostname]);

  /**
   * Initialize terminal with welcome message
   */
  useEffect(() => {
    // Prevent welcome message duplication
    if (welcomeShown.current) return;

    const welcomeMessages = [
      'Portfolio Desktop Terminal v1.0.0',
      `Running in ${state.osType === 'linux' ? 'Linux' : 'Windows'} mode`,
      'Type "help" for available commands',
      'Use Ctrl+L to clear, Ctrl+C to interrupt',
      '',
    ];

    welcomeMessages.forEach((msg) => addOutputLine(msg, 'info'));
    welcomeShown.current = true;
  }, [addOutputLine, state.osType]); // Run only once on mount

  /**
   * Periodic cleanup and garbage collection
   */
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Force garbage collection if available
      PoolManager.forceGC();

      // Log pool statistics for debugging
      const stats = PoolManager.getAllStats();
      if (stats.terminalLines.poolSize > 150) {
        console.log('Terminal: Pool statistics', stats);
      }
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(
    () => () => {
      // Return all current terminal lines to pool
      state.output.forEach((line) => terminalLinePool.release(line));

      // Clear all pools
      PoolManager.clearAll();
    },
    [state.output]
  );

  return {
    // State
    output: state.output,
    currentInput: state.currentInput,
    currentDirectory: state.currentDirectory,
    osType: state.osType,
    isExecuting: state.isExecuting,
    theme: state.theme,
    username: state.username,
    hostname: state.hostname,
    cursorPosition: state.cursorPosition,
    isVimMode: state.isVimMode,
    vimData: state.vimData,

    // Autocomplete
    suggestions,
    selectedIndex,
    showSuggestions,

    // Actions
    updateInput,
    executeCommand,
    clearOutput,
    switchOS,
    handleKeyDown,
    getCurrentPrompt,
    exitVimMode,

    // History
    clearHistory,
    searchHistory,

    // Command registry for syntax highlighting
    commandRegistry,

    // File system operations for vim
    fileSystem,
    createFile,
    createFolder,
    removeFileSystemItem,
  };
}
