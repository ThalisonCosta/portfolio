import type { VimState, Position } from '../types';

/**
 * Actions interface for normal mode
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
}

/**
 * Get word boundaries for word motions
 */
function getWordBoundaries(line: string): number[] {
  const boundaries = [0];
  let inWord = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const isWordChar = /\w/.test(char);

    if (!inWord && isWordChar) {
      boundaries.push(i);
      inWord = true;
    } else if (inWord && !isWordChar) {
      boundaries.push(i);
      inWord = false;
    }
  }

  boundaries.push(line.length);
  return [...new Set(boundaries)].sort((a, b) => a - b);
}

/**
 * Move cursor by word
 */
function moveByWord(state: VimState, direction: 'forward' | 'backward'): Position {
  const currentLine = state.buffer[state.cursor.line] || '';
  const boundaries = getWordBoundaries(currentLine);

  if (direction === 'forward') {
    const nextBoundary = boundaries.find((b) => b > state.cursor.column);
    if (nextBoundary !== undefined) {
      return { line: state.cursor.line, column: nextBoundary };
    }
    if (state.cursor.line < state.buffer.length - 1) {
      // Move to next line
      return { line: state.cursor.line + 1, column: 0 };
    }
  } else {
    const prevBoundary = boundaries.reverse().find((b) => b < state.cursor.column);
    if (prevBoundary !== undefined) {
      return { line: state.cursor.line, column: prevBoundary };
    }
    if (state.cursor.line > 0) {
      // Move to end of previous line
      const prevLine = state.buffer[state.cursor.line - 1] || '';
      return { line: state.cursor.line - 1, column: prevLine.length };
    }
  }

  return state.cursor;
}

/**
 * Delete character at cursor
 */
function deleteCharacter(state: VimState, actions: VimActions): void {
  const currentLine = state.buffer[state.cursor.line] || '';
  if (state.cursor.column < currentLine.length) {
    const newLine = currentLine.slice(0, state.cursor.column) + currentLine.slice(state.cursor.column + 1);
    const newBuffer = [...state.buffer];
    newBuffer[state.cursor.line] = newLine;
    actions.updateBuffer(newBuffer);
  }
}

/**
 * Delete current line
 */
function deleteLine(state: VimState, actions: VimActions): void {
  if (state.buffer.length === 1) {
    // If only one line, clear it
    actions.updateBuffer(['']);
    actions.moveCursor({ line: 0, column: 0 });
  } else {
    // Remove the current line
    const newBuffer = state.buffer.filter((_, index) => index !== state.cursor.line);
    actions.updateBuffer(newBuffer);

    // Adjust cursor position
    const newLine = Math.min(state.cursor.line, newBuffer.length - 1);
    const newColumn = Math.min(state.cursor.column, (newBuffer[newLine] || '').length);
    actions.moveCursor({ line: newLine, column: newColumn });
  }
}

/**
 * Yank (copy) current line
 */
function yankLine(_state: VimState, actions: VimActions): void {
  // For now, we'll just show a message since we don't have clipboard integration yet
  actions.setMessage('1 line yanked', 'info');
}

/**
 * Put (paste) - placeholder for now
 */
function put(_state: VimState, actions: VimActions): void {
  // Placeholder - would paste from register
  actions.setMessage('Nothing to put', 'warning');
}

/**
 * Normal mode keymap handler
 */
export function normalModeKeymap(event: KeyboardEvent, state: VimState, actions: VimActions): void {
  const { key, ctrlKey } = event;

  // Handle Ctrl combinations first
  if (ctrlKey) {
    switch (key) {
      case 'r':
        actions.redo();
        return;
      case 'f':
        // Page down - move down by viewport height
        const pageDownLine = Math.min(state.buffer.length - 1, state.cursor.line + state.viewportHeight);
        actions.moveCursor({ line: pageDownLine, column: state.cursor.column });
        return;
      case 'b':
        // Page up - move up by viewport height
        const pageUpLine = Math.max(0, state.cursor.line - state.viewportHeight);
        actions.moveCursor({ line: pageUpLine, column: state.cursor.column });
        return;
      default:
        return;
    }
  }

  // Handle regular key mappings
  switch (key) {
    // Movement
    case 'h':
    case 'ArrowLeft':
      actions.moveCursor({
        line: state.cursor.line,
        column: Math.max(0, state.cursor.column - 1),
      });
      break;

    case 'j':
    case 'ArrowDown':
      if (state.cursor.line < state.buffer.length - 1) {
        const nextLine = state.buffer[state.cursor.line + 1] || '';
        actions.moveCursor({
          line: state.cursor.line + 1,
          column: Math.min(state.cursor.column, nextLine.length),
        });
      }
      break;

    case 'k':
    case 'ArrowUp':
      if (state.cursor.line > 0) {
        const prevLine = state.buffer[state.cursor.line - 1] || '';
        actions.moveCursor({
          line: state.cursor.line - 1,
          column: Math.min(state.cursor.column, prevLine.length),
        });
      }
      break;

    case 'l':
    case 'ArrowRight':
      const currentLine = state.buffer[state.cursor.line] || '';
      if (state.cursor.column < currentLine.length) {
        actions.moveCursor({
          line: state.cursor.line,
          column: state.cursor.column + 1,
        });
      }
      break;

    // Word movements
    case 'w':
      actions.moveCursor(moveByWord(state, 'forward'));
      break;

    case 'b':
      actions.moveCursor(moveByWord(state, 'backward'));
      break;

    case 'e':
      // Move to end of word - simplified implementation
      const pos = moveByWord(state, 'forward');
      if (pos.column > 0) {
        actions.moveCursor({ ...pos, column: pos.column - 1 });
      } else {
        actions.moveCursor(pos);
      }
      break;

    // Line movements
    case '0':
    case 'Home':
      actions.moveCursor({ line: state.cursor.line, column: 0 });
      break;

    case '$':
    case 'End':
      const lineLength = (state.buffer[state.cursor.line] || '').length;
      actions.moveCursor({ line: state.cursor.line, column: Math.max(0, lineLength - 1) });
      break;

    // Buffer movements
    case 'g':
      // Handle 'gg' sequence - would need sequence tracking for full implementation
      // For now, just go to first line
      actions.moveCursor({ line: 0, column: 0 });
      break;

    case 'G':
      // Go to last line
      const lastLine = state.buffer.length - 1;
      const lastLineLength = (state.buffer[lastLine] || '').length;
      actions.moveCursor({ line: lastLine, column: Math.max(0, lastLineLength - 1) });
      break;

    // Insert mode entries
    case 'i':
      actions.enterInsertMode();
      break;

    case 'I':
      // Insert at beginning of line
      actions.moveCursor({ line: state.cursor.line, column: 0 });
      actions.enterInsertMode();
      break;

    case 'a':
      // Append after cursor
      const appendColumn = Math.min(state.cursor.column + 1, (state.buffer[state.cursor.line] || '').length);
      actions.enterInsertMode({ line: state.cursor.line, column: appendColumn });
      break;

    case 'A':
      // Append at end of line
      const endColumn = (state.buffer[state.cursor.line] || '').length;
      actions.enterInsertMode({ line: state.cursor.line, column: endColumn });
      break;

    case 'o':
      // Open new line below
      const newBuffer = [
        ...state.buffer.slice(0, state.cursor.line + 1),
        '',
        ...state.buffer.slice(state.cursor.line + 1),
      ];
      actions.updateBuffer(newBuffer);
      actions.enterInsertMode({ line: state.cursor.line + 1, column: 0 });
      break;

    case 'O':
      // Open new line above
      const newBufferAbove = [
        ...state.buffer.slice(0, state.cursor.line),
        '',
        ...state.buffer.slice(state.cursor.line),
      ];
      actions.updateBuffer(newBufferAbove);
      actions.enterInsertMode({ line: state.cursor.line, column: 0 });
      break;

    // Delete operations
    case 'x':
      deleteCharacter(state, actions);
      break;

    case 'd':
      // Handle 'dd' sequence - would need sequence tracking for full implementation
      // For now, delete current line
      deleteLine(state, actions);
      break;

    // Yank operations
    case 'y':
      // Handle 'yy' sequence - for now, yank current line
      yankLine(state, actions);
      break;

    // Put operations
    case 'p':
      put(state, actions);
      break;

    case 'P':
      // Put before cursor
      put(state, actions);
      break;

    // Undo/redo
    case 'u':
      actions.undo();
      break;

    // Visual mode
    case 'v':
      actions.enterVisualMode();
      break;

    // Command mode
    case ':':
      actions.enterCommandMode();
      break;

    // Search
    case '/':
      // Enter search mode - simplified for now
      actions.setMessage('Search not implemented yet', 'info');
      break;

    // Escape (redundant but for consistency)
    case 'Escape':
      // Already in normal mode
      break;

    default:
      // Ignore unhandled keys
      break;
  }
}
