import type { VimState, Position } from '../types';

/**
 * Actions interface for insert mode
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
}

/**
 * Insert character at cursor position
 */
function insertCharacter(state: VimState, char: string, actions: VimActions): void {
  const currentLine = state.buffer[state.cursor.line] || '';
  const newLine = currentLine.slice(0, state.cursor.column) + char + currentLine.slice(state.cursor.column);

  const newBuffer = [...state.buffer];
  newBuffer[state.cursor.line] = newLine;

  actions.updateBuffer(newBuffer);
  actions.moveCursor({ line: state.cursor.line, column: state.cursor.column + 1 });
}

/**
 * Delete character before cursor (backspace)
 */
function deleteCharacterBefore(state: VimState, actions: VimActions): void {
  if (state.cursor.column > 0) {
    // Delete character in current line
    const currentLine = state.buffer[state.cursor.line] || '';
    const newLine = currentLine.slice(0, state.cursor.column - 1) + currentLine.slice(state.cursor.column);

    const newBuffer = [...state.buffer];
    newBuffer[state.cursor.line] = newLine;

    actions.updateBuffer(newBuffer);
    actions.moveCursor({ line: state.cursor.line, column: state.cursor.column - 1 });
  } else if (state.cursor.line > 0) {
    // Join with previous line
    const currentLine = state.buffer[state.cursor.line] || '';
    const previousLine = state.buffer[state.cursor.line - 1] || '';
    const joinedLine = previousLine + currentLine;

    const newBuffer = [
      ...state.buffer.slice(0, state.cursor.line - 1),
      joinedLine,
      ...state.buffer.slice(state.cursor.line + 1),
    ];

    actions.updateBuffer(newBuffer);
    actions.moveCursor({ line: state.cursor.line - 1, column: previousLine.length });
  }
}

/**
 * Delete character after cursor (delete key)
 */
function deleteCharacterAfter(state: VimState, actions: VimActions): void {
  const currentLine = state.buffer[state.cursor.line] || '';

  if (state.cursor.column < currentLine.length) {
    // Delete character in current line
    const newLine = currentLine.slice(0, state.cursor.column) + currentLine.slice(state.cursor.column + 1);

    const newBuffer = [...state.buffer];
    newBuffer[state.cursor.line] = newLine;

    actions.updateBuffer(newBuffer);
  } else if (state.cursor.line < state.buffer.length - 1) {
    // Join with next line
    const nextLine = state.buffer[state.cursor.line + 1] || '';
    const joinedLine = currentLine + nextLine;

    const newBuffer = [
      ...state.buffer.slice(0, state.cursor.line),
      joinedLine,
      ...state.buffer.slice(state.cursor.line + 2),
    ];

    actions.updateBuffer(newBuffer);
  }
}

/**
 * Insert new line at cursor
 */
function insertNewLine(state: VimState, actions: VimActions): void {
  const currentLine = state.buffer[state.cursor.line] || '';
  const beforeCursor = currentLine.slice(0, state.cursor.column);
  const afterCursor = currentLine.slice(state.cursor.column);

  const newBuffer = [
    ...state.buffer.slice(0, state.cursor.line),
    beforeCursor,
    afterCursor,
    ...state.buffer.slice(state.cursor.line + 1),
  ];

  actions.updateBuffer(newBuffer);
  actions.moveCursor({ line: state.cursor.line + 1, column: 0 });
}

/**
 * Handle Tab key (simple implementation with spaces)
 */
function insertTab(state: VimState, actions: VimActions): void {
  const tabSpaces = '  '; // 2 spaces for tab
  insertCharacter(state, tabSpaces, actions);
}

/**
 * Insert mode keymap handler
 */
export function insertModeKeymap(event: KeyboardEvent, state: VimState, actions: VimActions): void {
  const { key, ctrlKey, altKey, metaKey } = event;

  // Handle Ctrl combinations
  if (ctrlKey && !altKey && !metaKey) {
    switch (key) {
      case 'c':
        // Ctrl+C - exit insert mode
        actions.enterNormalMode();
        return;
      case 'h':
        // Ctrl+H - backspace
        deleteCharacterBefore(state, actions);
        return;
      case 'w':
        // Ctrl+W - delete word before cursor (simplified)
        // For now, just delete character
        deleteCharacterBefore(state, actions);
        return;
      case 'u':
        // Ctrl+U - delete line before cursor
        const currentLine = state.buffer[state.cursor.line] || '';
        const afterCursor = currentLine.slice(state.cursor.column);
        const newBuffer = [...state.buffer];
        newBuffer[state.cursor.line] = afterCursor;
        actions.updateBuffer(newBuffer);
        actions.moveCursor({ line: state.cursor.line, column: 0 });
        return;
      default:
        // Ignore other Ctrl combinations
        return;
    }
  }

  // Handle special keys
  switch (key) {
    case 'Escape':
      actions.enterNormalMode();
      break;

    case 'Enter':
      insertNewLine(state, actions);
      break;

    case 'Backspace':
      deleteCharacterBefore(state, actions);
      break;

    case 'Delete':
      deleteCharacterAfter(state, actions);
      break;

    case 'Tab':
      insertTab(state, actions);
      break;

    case 'ArrowLeft':
      if (state.cursor.column > 0) {
        actions.moveCursor({ line: state.cursor.line, column: state.cursor.column - 1 });
      } else if (state.cursor.line > 0) {
        const prevLine = state.buffer[state.cursor.line - 1] || '';
        actions.moveCursor({ line: state.cursor.line - 1, column: prevLine.length });
      }
      break;

    case 'ArrowRight':
      const currentLine = state.buffer[state.cursor.line] || '';
      if (state.cursor.column < currentLine.length) {
        actions.moveCursor({ line: state.cursor.line, column: state.cursor.column + 1 });
      } else if (state.cursor.line < state.buffer.length - 1) {
        actions.moveCursor({ line: state.cursor.line + 1, column: 0 });
      }
      break;

    case 'ArrowUp':
      if (state.cursor.line > 0) {
        const prevLine = state.buffer[state.cursor.line - 1] || '';
        actions.moveCursor({
          line: state.cursor.line - 1,
          column: Math.min(state.cursor.column, prevLine.length),
        });
      }
      break;

    case 'ArrowDown':
      if (state.cursor.line < state.buffer.length - 1) {
        const nextLine = state.buffer[state.cursor.line + 1] || '';
        actions.moveCursor({
          line: state.cursor.line + 1,
          column: Math.min(state.cursor.column, nextLine.length),
        });
      }
      break;

    case 'Home':
      actions.moveCursor({ line: state.cursor.line, column: 0 });
      break;

    case 'End':
      const endColumn = (state.buffer[state.cursor.line] || '').length;
      actions.moveCursor({ line: state.cursor.line, column: endColumn });
      break;

    case 'PageUp':
      const pageUpLine = Math.max(0, state.cursor.line - state.viewportHeight);
      actions.moveCursor({ line: pageUpLine, column: state.cursor.column });
      break;

    case 'PageDown':
      const pageDownLine = Math.min(state.buffer.length - 1, state.cursor.line + state.viewportHeight);
      actions.moveCursor({ line: pageDownLine, column: state.cursor.column });
      break;

    default:
      // Handle printable characters
      if (key.length === 1 && !ctrlKey && !altKey && !metaKey) {
        insertCharacter(state, key, actions);
      }
      break;
  }
}
