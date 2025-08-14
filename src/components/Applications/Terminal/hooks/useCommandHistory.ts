import { useState, useCallback, useEffect } from 'react';

const MAX_HISTORY_SIZE = 15; // Default maximum history size

/**
 * Hook for managing command history with persistent storage
 */
export function useCommandHistory(osType: 'linux' | 'windows', maxHistorySize: number = MAX_HISTORY_SIZE) {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Generate OS-specific localStorage key
  const getStorageKey = (os: 'linux' | 'windows') => `terminal-command-history-${os}`;

  // Load history from localStorage on mount or when OS changes
  useEffect(() => {
    try {
      const storageKey = getStorageKey(osType);
      const savedHistory = localStorage.getItem(storageKey);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setHistory(parsedHistory.slice(-maxHistorySize));
        }
      } else {
        // Reset history when switching to OS with no saved history
        setHistory([]);
      }
      // Reset history index when switching OS
      setHistoryIndex(-1);
    } catch (error) {
      console.warn('Failed to load command history from localStorage:', error);
    }
  }, [maxHistorySize, osType]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      const storageKey = getStorageKey(osType);
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save command history to localStorage:', error);
    }
  }, [history, osType]);

  /**
   * Add a command to history
   */
  const addToHistory = useCallback(
    (command: string) => {
      const trimmedCommand = command.trim();
      if (!trimmedCommand) return;

      setHistory((prev) => {
        // Add command to end of history (chronological order)
        const newHistory = [...prev, trimmedCommand];

        // Implement FIFO: keep only the last maxHistorySize commands
        return newHistory.slice(-maxHistorySize);
      });

      // Reset history index
      setHistoryIndex(-1);
    },
    [maxHistorySize]
  );

  /**
   * Navigate through history (for arrow keys)
   */
  const navigateHistory = useCallback(
    (direction: 'up' | 'down'): string | null => {
      if (history.length === 0) return null;

      let newIndex: number;

      if (direction === 'up') {
        // Up arrow: go backwards in history (towards older commands)
        if (historyIndex === -1) {
          // Start from the most recent command
          newIndex = history.length - 1;
        } else if (historyIndex > 0) {
          // Move to previous command
          newIndex = historyIndex - 1;
        } else {
          // Already at the oldest command, stay there
          newIndex = 0;
        }
      } else {
        // Down arrow: go forwards in history (towards newer commands)
        if (historyIndex === -1) {
          // Already at newest position, stay there
          return null;
        }
        if (historyIndex < history.length - 1) {
          // Move to next command
          newIndex = historyIndex + 1;
        } else {
          // Reached the end, go back to current input (empty)
          newIndex = -1;
        }
      }

      setHistoryIndex(newIndex);
      return newIndex === -1 ? '' : history[newIndex];
    },
    [history, historyIndex]
  );

  /**
   * Search history for commands containing the search term
   */
  const searchHistory = useCallback(
    (searchTerm: string): string[] => {
      if (!searchTerm.trim()) return history;

      const term = searchTerm.toLowerCase();
      return history.filter((cmd) => cmd.toLowerCase().includes(term)).slice(-20); // Return last 20 matches
    },
    [history]
  );

  /**
   * Get the current history entry
   */
  const getCurrentHistoryEntry = useCallback((): string | null => {
    if (historyIndex === -1 || historyIndex >= history.length) {
      return null;
    }
    return history[historyIndex];
  }, [history, historyIndex]);

  /**
   * Reset history index (when user types)
   */
  const resetHistoryIndex = useCallback(() => {
    setHistoryIndex(-1);
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    try {
      const storageKey = getStorageKey(osType);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear command history from localStorage:', error);
    }
  }, [osType]);

  /**
   * Get a specific number of recent commands
   */
  const getRecentCommands = useCallback((count: number = 10): string[] => history.slice(-count), [history]);

  /**
   * Check if there's history to navigate
   */
  const hasHistory = history.length > 0;
  const canNavigateUp = historyIndex < history.length - 1 || historyIndex === -1;
  const canNavigateDown = historyIndex > 0;

  return {
    history,
    historyIndex,
    addToHistory,
    navigateHistory,
    searchHistory,
    getCurrentHistoryEntry,
    resetHistoryIndex,
    clearHistory,
    getRecentCommands,
    hasHistory,
    canNavigateUp,
    canNavigateDown,
  };
}
