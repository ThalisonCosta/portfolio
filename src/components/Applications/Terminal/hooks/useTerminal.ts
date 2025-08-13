import { useState, useCallback, useRef, useEffect } from 'react';
import type { TerminalState, TerminalOutputLine, CommandContext, CommandResult, OSType } from '../types';
import { CommandRegistry, createCommandRegistry } from '../commands';
import { CommandParser } from '../utils/parser';
import { ohMyZshTheme, windowsTheme } from '../utils/colors';
import { useDesktopStore } from '../../../../stores/useDesktopStore';
import { useCommandHistory } from './useCommandHistory';
import { useAutocomplete } from './useAutocomplete';

/**
 * Main terminal state management hook
 */
export function useTerminal() {
  const { fileSystem } = useDesktopStore();

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
    hostname: 'desktop',
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
   * Add a new output line
   */
  const addOutputLine = useCallback((content: string, type: TerminalOutputLine['type'] = 'output') => {
    const newLine: TerminalOutputLine = {
      id: `line-${Date.now()}-${Math.random()}`,
      content,
      type,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      output: [...prev.output, newLine],
    }));
  }, []);

  /**
   * Clear terminal output
   */
  const clearOutput = useCallback(() => {
    setState((prev) => ({
      ...prev,
      output: [],
    }));
  }, []);

  /**
   * Update current input
   */
  const updateInput = useCallback(
    (input: string, cursorPosition?: number) => {
      setState((prev) => ({
        ...prev,
        currentInput: input,
        cursorPosition: cursorPosition ?? input.length,
      }));

      resetHistoryIndex();

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
   * Execute a command
   */
  const executeCommand = useCallback(
    async (input: string) => {
      const trimmedInput = input.trim();
      if (!trimmedInput) return;

      // Add input to output
      const prompt =
        state.osType === 'windows'
          ? `C:\\${state.currentDirectory.replace(/\//g, '\\')}>`
          : `${state.username}@${state.hostname}:${state.currentDirectory === '/Desktop' ? '~' : state.currentDirectory}$`;

      addOutputLine(`${prompt} ${trimmedInput}`, 'input');

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
        };

        // Execute command
        const result: CommandResult = await command.execute(parsed.args, context);

        // Handle result
        if (result.clear) {
          clearOutput();
        } else if (result.output) {
          addOutputLine(result.output, result.type || 'output');
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
              updateInput(historyCommand);
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
              updateInput(historyCommand);
            }
          }
          break;

        case 'Tab':
          event.preventDefault();
          const completion = getTabCompletion(state.currentInput, state.cursorPosition);
          updateInput(completion.newInput, completion.newCursorPosition);
          break;

        case 'Escape':
          event.preventDefault();
          hideSuggestions();
          break;

        case 'c':
          if (event.ctrlKey) {
            event.preventDefault();
            addOutputLine(`${state.currentInput}^C`, 'input');
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
    ]
  );

  /**
   * Switch operating system
   */
  const switchOS = useCallback(
    (osType: OSType) => {
      setState((prev) => ({
        ...prev,
        osType,
        theme: osType === 'linux' ? ohMyZshTheme : windowsTheme,
      }));
      commandRegistry.switchOS(osType);
      addOutputLine(`Switched to ${osType === 'linux' ? 'Linux' : 'Windows'} mode`, 'info');
    },
    [commandRegistry, addOutputLine]
  );

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
    const welcomeMessages = [
      'Portfolio Desktop Terminal v1.0.0',
      `Running in ${state.osType === 'linux' ? 'Linux' : 'Windows'} mode`,
      'Type "help" for available commands',
      'Use Ctrl+L to clear, Ctrl+C to interrupt',
      '',
    ];

    welcomeMessages.forEach((msg) => addOutputLine(msg, 'info'));
  }, []); // Only run once on mount

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

    // History
    clearHistory,
    searchHistory,
  };
}
