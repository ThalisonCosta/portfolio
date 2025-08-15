import { useCallback, useMemo } from 'react';
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
  // Memoize the state and actions to prevent unnecessary re-renders
  const memoizedState = useMemo(
    () => state,
    [
      state.mode,
      state.cursor.line,
      state.cursor.column,
      state.buffer.length,
      state.commandInput,
      state.selection?.start.line,
      state.selection?.start.column,
      state.selection?.end.line,
      state.selection?.end.column,
    ]
  );

  const memoizedActions = useMemo(
    () => actions,
    [
      actions.executeCommand,
      actions.enterInsertMode,
      actions.enterVisualMode,
      actions.enterNormalMode,
      actions.enterCommandMode,
      actions.updateBuffer,
      actions.moveCursor,
      actions.undo,
      actions.redo,
      actions.setMessage,
      actions.handleCommandInputChange,
    ]
  );

  /**
   * Main keyboard event handler
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Prevent default browser behavior for most keys
      const allowedKeys = ['F5', 'F11', 'F12'];
      if (!allowedKeys.includes(event.key)) {
        event.preventDefault();
      }

      try {
        switch (memoizedState.mode) {
          case 'normal':
            normalModeKeymap(event, memoizedState, memoizedActions);
            break;
          case 'insert':
            insertModeKeymap(event, memoizedState, memoizedActions);
            break;
          case 'visual':
            visualModeKeymap(event, memoizedState, memoizedActions);
            break;
          case 'command':
            commandModeKeymap(event, memoizedState, memoizedActions);
            break;
          default:
            console.warn(`Unknown vim mode: ${memoizedState.mode}`);
            break;
        }
      } catch (error) {
        console.error('Vim key handler error:', error);
        memoizedActions.setMessage(
          `Key handler error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error'
        );
      }
    },
    [memoizedState, memoizedActions]
  );

  return { handleKeyDown };
}
