import type { VimState, Position } from '../types';

/**
 * Actions interface for visual mode
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
 * Get selected text from current selection
 */
function getSelectedText(state: VimState): string {
  if (!state.selection) return '';

  const { start, end } = state.selection;

  // Normalize selection (ensure start comes before end)
  const selStart = start.line < end.line || (start.line === end.line && start.column <= end.column) ? start : end;
  const selEnd = start.line < end.line || (start.line === end.line && start.column <= end.column) ? end : start;

  if (selStart.line === selEnd.line) {
    // Single line selection
    const line = state.buffer[selStart.line] || '';
    return line.slice(selStart.column, selEnd.column);
  }
  // Multi-line selection
  const lines = [];
  for (let i = selStart.line; i <= selEnd.line; i++) {
    const line = state.buffer[i] || '';
    if (i === selStart.line) {
      lines.push(line.slice(selStart.column));
    } else if (i === selEnd.line) {
      lines.push(line.slice(0, selEnd.column));
    } else {
      lines.push(line);
    }
  }
  return lines.join('\n');
}

/**
 * Delete selected text
 */
function deleteSelection(state: VimState, actions: VimActions): void {
  if (!state.selection) return;

  const { start, end } = state.selection;

  // Normalize selection
  const selStart = start.line < end.line || (start.line === end.line && start.column <= end.column) ? start : end;
  const selEnd = start.line < end.line || (start.line === end.line && start.column <= end.column) ? end : start;

  if (selStart.line === selEnd.line) {
    // Single line deletion
    const line = state.buffer[selStart.line] || '';
    const newLine = line.slice(0, selStart.column) + line.slice(selEnd.column);
    const newBuffer = [...state.buffer];
    newBuffer[selStart.line] = newLine;

    actions.updateBuffer(newBuffer);
    actions.moveCursor(selStart);
  } else {
    // Multi-line deletion
    const firstLine = state.buffer[selStart.line] || '';
    const lastLine = state.buffer[selEnd.line] || '';
    const newLine = firstLine.slice(0, selStart.column) + lastLine.slice(selEnd.column);

    const newBuffer = [...state.buffer.slice(0, selStart.line), newLine, ...state.buffer.slice(selEnd.line + 1)];

    actions.updateBuffer(newBuffer);
    actions.moveCursor(selStart);
  }

  actions.enterNormalMode();
}

/**
 * Yank (copy) selected text
 */
function yankSelection(state: VimState, actions: VimActions): void {
  if (!state.selection) return;

  const selectedText = getSelectedText(state);
  const lineCount = selectedText.split('\n').length;

  actions.setMessage(`${lineCount} line${lineCount === 1 ? '' : 's'} yanked`, 'info');
  actions.enterNormalMode();
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
      return { line: state.cursor.line + 1, column: 0 };
    }
  } else {
    const prevBoundary = boundaries.reverse().find((b) => b < state.cursor.column);
    if (prevBoundary !== undefined) {
      return { line: state.cursor.line, column: prevBoundary };
    }
    if (state.cursor.line > 0) {
      const prevLine = state.buffer[state.cursor.line - 1] || '';
      return { line: state.cursor.line - 1, column: prevLine.length };
    }
  }

  return state.cursor;
}

/**
 * Visual mode keymap handler
 */
export function visualModeKeymap(event: KeyboardEvent, state: VimState, actions: VimActions): void {
  const { key, ctrlKey } = event;

  // Handle Ctrl combinations
  if (ctrlKey) {
    switch (key) {
      case 'f':
        // Page down
        const pageDownLine = Math.min(state.buffer.length - 1, state.cursor.line + state.viewportHeight);
        actions.moveCursor({ line: pageDownLine, column: state.cursor.column });
        return;
      case 'b':
        // Page up
        const pageUpLine = Math.max(0, state.cursor.line - state.viewportHeight);
        actions.moveCursor({ line: pageUpLine, column: state.cursor.column });
        return;
      default:
        return;
    }
  }

  // Handle regular key mappings
  switch (key) {
    // Exit visual mode
    case 'Escape':
    case 'v':
      actions.enterNormalMode();
      break;

    // Movement (extends selection)
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
      // Move to end of word
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
      actions.moveCursor({ line: state.cursor.line, column: lineLength });
      break;

    // Buffer movements
    case 'g':
      // Go to first line (simplified - would need sequence tracking for 'gg')
      actions.moveCursor({ line: 0, column: 0 });
      break;

    case 'G':
      // Go to last line
      const lastLine = state.buffer.length - 1;
      const lastLineLength = (state.buffer[lastLine] || '').length;
      actions.moveCursor({ line: lastLine, column: lastLineLength });
      break;

    // Operations on selection
    case 'd':
    case 'x':
      deleteSelection(state, actions);
      break;

    case 'y':
      yankSelection(state, actions);
      break;

    // Enter other modes
    case 'i':
      actions.enterInsertMode();
      break;

    case ':':
      actions.enterCommandMode();
      break;

    default:
      // Ignore unhandled keys
      break;
  }
}
