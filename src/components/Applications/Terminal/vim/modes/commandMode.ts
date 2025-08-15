import type { VimState, Position } from '../types';

/**
 * Actions interface for command mode
 */
interface VimActions {
  executeCommand: (command: string) => Promise<unknown>;
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
 * Execute the current command
 */
async function executeCurrentCommand(state: VimState, actions: VimActions): Promise<void> {
  if (!state.commandInput.trim()) {
    actions.enterNormalMode();
    return;
  }

  try {
    await actions.executeCommand(state.commandInput);
  } catch (error) {
    actions.setMessage(`Command error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  }

  // executeCommand should handle mode switching, but ensure we're in normal mode
  actions.enterNormalMode();
}

/**
 * Command mode keymap handler
 */
export function commandModeKeymap(event: KeyboardEvent, state: VimState, actions: VimActions): void {
  const { key, ctrlKey, altKey, metaKey } = event;

  // Handle Ctrl combinations
  if (ctrlKey && !altKey && !metaKey) {
    switch (key) {
      case 'c':
        // Ctrl+C - cancel command
        actions.enterNormalMode();
        return;
      case 'u':
        // Ctrl+U - clear command line
        // In a real implementation, we'd clear the command input
        return;
      case 'w':
        // Ctrl+W - delete word backward
        // Simplified - just delete one character for now
        return;
      default:
        return;
    }
  }

  // Handle special keys
  switch (key) {
    case 'Escape':
      actions.enterNormalMode();
      break;

    case 'Enter':
      executeCurrentCommand(state, actions);
      break;

    case 'Backspace':
      // Delete character from command input
      actions.handleCommandInputChange('', 'delete');
      break;

    case 'Delete':
      // Delete character after cursor in command input
      actions.handleCommandInputChange('', 'delete');
      break;

    case 'ArrowLeft':
      // Move cursor left in command input
      break;

    case 'ArrowRight':
      // Move cursor right in command input
      break;

    case 'ArrowUp':
      // Command history - previous command
      break;

    case 'ArrowDown':
      // Command history - next command
      break;

    case 'Home':
      // Move to beginning of command input
      break;

    case 'End':
      // Move to end of command input
      break;

    case 'Tab':
      // Command completion - not implemented yet
      break;

    default:
      // Handle printable characters
      if (key.length === 1 && !ctrlKey && !altKey && !metaKey) {
        // Add character to command input
        actions.handleCommandInputChange(key, 'add');
      }
      break;
  }
}
