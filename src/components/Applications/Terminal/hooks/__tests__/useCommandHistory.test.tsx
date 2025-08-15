import { renderHook, act } from '@testing-library/react';
import { useCommandHistory } from '../useCommandHistory';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useCommandHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty history', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useCommandHistory('linux'));

      expect(result.current.history).toEqual([]);
      expect(result.current.historyIndex).toBe(-1);
      expect(result.current.hasHistory).toBe(false);
    });

    it('should load history from localStorage', () => {
      const savedHistory = ['ls', 'cd /home', 'cat file.txt'];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedHistory));

      const { result } = renderHook(() => useCommandHistory('linux'));

      expect(result.current.history).toEqual(savedHistory);
      expect(result.current.hasHistory).toBe(true);
    });

    it('should handle invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useCommandHistory('linux'));

      expect(result.current.history).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load command history from localStorage:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should use different storage keys for different OS types', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      renderHook(() => useCommandHistory('linux'));
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('terminal-command-history-linux');

      renderHook(() => useCommandHistory('windows'));
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('terminal-command-history-windows');
    });

    it('should respect maxHistorySize when loading from localStorage', () => {
      const savedHistory = Array.from({ length: 20 }, (_, i) => `command${i}`);
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedHistory));

      const { result } = renderHook(() => useCommandHistory('linux', 10));

      expect(result.current.history).toHaveLength(10);
      expect(result.current.history).toEqual(savedHistory.slice(-10));
    });
  });

  describe('addToHistory', () => {
    it('should add command to history', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useCommandHistory('linux'));

      act(() => {
        result.current.addToHistory('ls -la');
      });

      expect(result.current.history).toEqual(['ls -la']);
      expect(result.current.historyIndex).toBe(-1);
    });

    it('should trim whitespace from commands', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useCommandHistory('linux'));

      act(() => {
        result.current.addToHistory('  ls -la  ');
      });

      expect(result.current.history).toEqual(['ls -la']);
    });

    it('should ignore empty commands', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useCommandHistory('linux'));

      act(() => {
        result.current.addToHistory('');
        result.current.addToHistory('   ');
      });

      expect(result.current.history).toEqual([]);
    });

    it('should respect maxHistorySize', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useCommandHistory('linux', 3));

      act(() => {
        result.current.addToHistory('cmd1');
        result.current.addToHistory('cmd2');
        result.current.addToHistory('cmd3');
        result.current.addToHistory('cmd4');
      });

      expect(result.current.history).toEqual(['cmd2', 'cmd3', 'cmd4']);
    });

    it('should save to localStorage after adding', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useCommandHistory('linux'));

      act(() => {
        result.current.addToHistory('ls -la');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'terminal-command-history-linux',
        JSON.stringify(['ls -la'])
      );
    });
  });

  describe('navigateHistory', () => {
    it('should navigate up through history', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['cmd1', 'cmd2', 'cmd3']));

      const { result } = renderHook(() => useCommandHistory('linux'));

      let command: string | null = null;
      act(() => {
        command = result.current.navigateHistory('up') || '';
      });
      expect(command).toBe('cmd3');
      expect(result.current.historyIndex).toBe(2);

      act(() => {
        command = result.current.navigateHistory('up') || '';
      });
      expect(command).toBe('cmd2');
      expect(result.current.historyIndex).toBe(1);
    });

    it('should navigate down through history', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['cmd1', 'cmd2', 'cmd3']));

      const { result } = renderHook(() => useCommandHistory('linux'));

      // Navigate up twice: first to cmd3 (index 2), then to cmd2 (index 1)
      act(() => {
        result.current.navigateHistory('up'); // Goes to cmd3 (index 2)
      });
      expect(result.current.historyIndex).toBe(2); // At most recent command

      act(() => {
        result.current.navigateHistory('up'); // Goes to cmd2 (index 1)
      });
      expect(result.current.historyIndex).toBe(1); // At cmd2

      // Navigate down should go to cmd3 (index 2)
      let command: string | null = null;
      act(() => {
        command = result.current.navigateHistory('down') || '';
      });
      expect(command).toBe('cmd3');
      expect(result.current.historyIndex).toBe(2);

      // Navigate down again should go to empty (index -1)
      act(() => {
        command = result.current.navigateHistory('down') || '';
      });
      expect(command).toBe('');
      expect(result.current.historyIndex).toBe(-1);
    });

    it('should return null when no history available', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useCommandHistory('linux'));

      let command: string | null = null;
      act(() => {
        command = result.current.navigateHistory('up');
      });
      expect(command).toBeNull();
    });

    it('should stay at oldest command when navigating up beyond limit', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['cmd1']));

      const { result } = renderHook(() => useCommandHistory('linux'));

      act(() => {
        result.current.navigateHistory('up');
        result.current.navigateHistory('up');
      });

      expect(result.current.historyIndex).toBe(0);
    });
  });

  describe('searchHistory', () => {
    it('should search for commands containing term', () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(['ls -la', 'cd /home', 'ls file.txt', 'cat file.txt', 'ls -al'])
      );

      const { result } = renderHook(() => useCommandHistory('linux'));

      const matches = result.current.searchHistory('ls');
      expect(matches).toEqual(['ls -la', 'ls file.txt', 'ls -al']);
    });

    it('should be case insensitive', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['LS -la', 'cd /home']));

      const { result } = renderHook(() => useCommandHistory('linux'));

      const matches = result.current.searchHistory('ls');
      expect(matches).toEqual(['LS -la']);
    });

    it('should return all history for empty search term', () => {
      const history = ['cmd1', 'cmd2', 'cmd3'];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(history));

      const { result } = renderHook(() => useCommandHistory('linux'));

      const matches = result.current.searchHistory('');
      expect(matches).toEqual(history);
    });
  });

  describe('getCurrentHistoryEntry', () => {
    it('should return current history entry', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['cmd1', 'cmd2']));

      const { result } = renderHook(() => useCommandHistory('linux'));

      act(() => {
        result.current.navigateHistory('up');
      });

      expect(result.current.getCurrentHistoryEntry()).toBe('cmd2');
    });

    it('should return null when no current entry', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['cmd1', 'cmd2']));

      const { result } = renderHook(() => useCommandHistory('linux'));

      expect(result.current.getCurrentHistoryEntry()).toBeNull();
    });
  });

  describe('resetHistoryIndex', () => {
    it('should reset history index', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['cmd1', 'cmd2']));

      const { result } = renderHook(() => useCommandHistory('linux'));

      act(() => {
        result.current.navigateHistory('up');
      });
      expect(result.current.historyIndex).toBe(1);

      act(() => {
        result.current.resetHistoryIndex();
      });
      expect(result.current.historyIndex).toBe(-1);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['cmd1', 'cmd2']));

      const { result } = renderHook(() => useCommandHistory('linux'));

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toEqual([]);
      expect(result.current.historyIndex).toBe(-1);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('terminal-command-history-linux');
    });

    it('should handle localStorage errors when clearing', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useCommandHistory('linux'));

      act(() => {
        result.current.clearHistory();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to clear command history from localStorage:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('getRecentCommands', () => {
    it('should return recent commands', () => {
      const history = Array.from({ length: 15 }, (_, i) => `cmd${i}`);
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(history));

      const { result } = renderHook(() => useCommandHistory('linux'));

      const recent = result.current.getRecentCommands(5);
      expect(recent).toEqual(['cmd10', 'cmd11', 'cmd12', 'cmd13', 'cmd14']);
    });

    it('should default to 10 recent commands', () => {
      const history = Array.from({ length: 15 }, (_, i) => `cmd${i}`);
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(history));

      const { result } = renderHook(() => useCommandHistory('linux'));

      const recent = result.current.getRecentCommands();
      expect(recent).toHaveLength(10);
      expect(recent).toEqual(['cmd5', 'cmd6', 'cmd7', 'cmd8', 'cmd9', 'cmd10', 'cmd11', 'cmd12', 'cmd13', 'cmd14']);
    });
  });

  describe('navigation flags', () => {
    it('should correctly calculate navigation flags', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['cmd1', 'cmd2', 'cmd3']));

      const { result } = renderHook(() => useCommandHistory('linux'));

      // Initial state (historyIndex = -1)
      expect(result.current.canNavigateUp).toBe(true); // can go up to most recent
      expect(result.current.canNavigateDown).toBe(false); // already at newest position

      // After navigating up once (now at cmd3, index 2)
      act(() => {
        result.current.navigateHistory('up');
      });
      expect(result.current.historyIndex).toBe(2);
      // At index 2 (most recent command in history), canNavigateUp is false since 2 >= history.length - 1
      expect(result.current.canNavigateUp).toBe(false); // already at most recent, can't go back further
      expect(result.current.canNavigateDown).toBe(true); // can go forward

      // Navigate up one more time to cmd2 (index 1), then cmd1 (index 0)
      act(() => {
        result.current.navigateHistory('up'); // Goes to cmd2 (index 1)
      });
      expect(result.current.historyIndex).toBe(1);

      act(() => {
        result.current.navigateHistory('up'); // Goes to cmd1 (index 0, oldest)
      });
      expect(result.current.historyIndex).toBe(0);
      expect(result.current.canNavigateUp).toBe(true); // canNavigateUp is true when historyIndex < history.length - 1
      expect(result.current.canNavigateDown).toBe(false); // canNavigateDown is false when historyIndex = 0
    });
  });
});
