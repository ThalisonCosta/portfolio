/**
 * TypeScript interfaces and types for the Vim text editor
 */

/** Vim editor modes */
export type VimMode = 'normal' | 'insert' | 'visual' | 'command';

/** Position in the text buffer */
export interface Position {
  /** Line number (0-based) */
  line: number;
  /** Column number (0-based) */
  column: number;
}

/** Text selection range */
export interface Selection {
  /** Start position */
  start: Position;
  /** End position */
  end: Position;
}

/** Buffer diff for memory-efficient undo/redo */
export interface BufferDiff {
  /** Line number where change occurred */
  line: number;
  /** Old content (for undo) */
  oldContent: string;
  /** New content (for redo) */
  newContent: string;
  /** Type of operation */
  operation: 'insert' | 'delete' | 'replace';
}

/** Vim change record for efficient undo/redo */
export interface VimChange {
  /** Type of change */
  type: 'buffer' | 'cursor' | 'selection' | 'mode';
  /** Changed data - only what actually changed */
  data: {
    buffer?: string[]; // Only for legacy compatibility, prefer bufferDiffs
    bufferDiffs?: BufferDiff[]; // Memory-efficient buffer changes
    cursor?: Position;
    selection?: Selection;
    mode?: VimMode;
    isModified?: boolean;
  };
  /** Timestamp of change */
  timestamp: number;
}

/** Vim editor state */
export interface VimState {
  /** Current mode */
  mode: VimMode;
  /** Text buffer (array of lines) */
  buffer: string[];
  /** Current cursor position */
  cursor: Position;
  /** Current selection (for visual mode) */
  selection?: Selection;
  /** Whether the buffer has been modified */
  isModified: boolean;
  /** Current filename */
  filename?: string;
  /** Command line input for command mode */
  commandInput: string;
  /** Undo stack - stores only changes, not full states */
  undoStack: VimChange[];
  /** Redo stack - stores only changes, not full states */
  redoStack: VimChange[];
  /** Register for yank/put operations */
  register: string;
  /** Last search pattern */
  searchPattern: string;
  /** Search results */
  searchResults: Position[];
  /** Current search result index */
  currentSearchIndex: number;
  /** Message to display in status bar */
  message: string;
  /** Message type */
  messageType: 'info' | 'error' | 'warning';
  /** Show line numbers */
  showLineNumbers: boolean;
  /** Scroll offset from top */
  scrollOffset: number;
  /** Viewport height in lines */
  viewportHeight: number;
}

/** Vim motion result */
export interface MotionResult {
  /** New cursor position */
  position: Position;
  /** Whether the motion was successful */
  success: boolean;
}

/** Vim operation result */
export interface OperationResult {
  /** Whether the operation was successful */
  success: boolean;
  /** New vim state */
  state?: VimState;
  /** Message to display */
  message?: string;
  /** Message type */
  messageType?: 'info' | 'error' | 'warning';
}

/** Vim command definition for command mode */
export interface VimCommand {
  /** Command name (e.g., 'w', 'q', 'wq') */
  name: string;
  /** Command aliases */
  aliases: string[];
  /** Command description */
  description: string;
  /** Execute the command */
  execute: (args: string[], state: VimState, context: VimEditorContext) => Promise<OperationResult> | OperationResult;
}

/** Context passed to vim commands */
export interface VimEditorContext {
  /** Save file function */
  saveFile: (filename: string, content: string) => Promise<boolean>;
  /** Load file function */
  loadFile: (filename: string) => Promise<string>;
  /** Exit vim function */
  exitVim: () => void;
  /** Check if file exists */
  fileExists: (filename: string) => boolean;
  /** Current working directory */
  currentDirectory: string;
}

/** Syntax highlighting token */
export interface SyntaxToken {
  /** Start position in line */
  start: number;
  /** End position in line */
  end: number;
  /** Token type for styling */
  type: 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'identifier' | 'type';
}

/** Line with syntax highlighting */
export interface HighlightedLine {
  /** Original text */
  text: string;
  /** Syntax tokens */
  tokens: SyntaxToken[];
}

/** Theme colors for vim editor */
export interface VimTheme {
  /** Background color */
  background: string;
  /** Foreground color */
  foreground: string;
  /** Current line background */
  currentLineBackground: string;
  /** Line number color */
  lineNumber: string;
  /** Current line number color */
  currentLineNumber: string;
  /** Status bar background */
  statusBackground: string;
  /** Status bar foreground */
  statusForeground: string;
  /** Selection background */
  selectionBackground: string;
  /** Search highlight */
  searchHighlight: string;
  /** Cursor color */
  cursor: string;
  /** Syntax colors */
  syntax: {
    keyword: string;
    string: string;
    comment: string;
    number: string;
    operator: string;
    identifier: string;
    type: string;
  };
}