import { useCallback } from 'react';
import type { VimState, Position } from '../types';
import { normalModeKeymap } from '../modes/normalMode';
import { insertModeKeymap } from '../modes/insertMode';
import { visualModeKeymap } from '../modes/visualMode';
import { commandModeKeymap } from '../modes/commandMode';

/**
 * Actions interface for vim key handler
 */
interface VimActions {
  executeCommand: (command: string) => Promise<any>;
  enterInsertMode: (position?: Position) => void;
  enterVisualMode: () => void;
  enterNormalMode: () => void;
  enterCommandMode: () => void;
  updateBuffer: (buffer: string[]) => void;
  moveCursor: (position: Position) => void;
  undo: () => void;
  redo: () => void;
  setMessage: (message: string, type?: 'info' | 'error' | 'warning') => void;
  handleCommandInputChange: (char: string, action: 'add' | 'delete') => void;
}

/**
 * Custom hook for handling keyboard events in vim editor
 * 
 * Routes keyboard events to the appropriate mode handler based on current vim mode.
 */
export function useVimKeyHandler(state: VimState, actions: VimActions) {
  /**
   * Main keyboard event handler
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Prevent default browser behavior for most keys
    const allowedKeys = ['F5', 'F11', 'F12'];
    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }

    try {
      switch (state.mode) {
        case 'normal':
          normalModeKeymap(event, state, actions);
          break;
        case 'insert':
          insertModeKeymap(event, state, actions);
          break;
        case 'visual':
          visualModeKeymap(event, state, actions);
          break;
        case 'command':
          commandModeKeymap(event, state, actions);
          break;
        default:
          console.warn(`Unknown vim mode: ${state.mode}`);
          break;
      }
    } catch (error) {
      console.error('Vim key handler error:', error);
      actions.setMessage(`Key handler error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }, [state, actions]);

  return { handleKeyDown };
}