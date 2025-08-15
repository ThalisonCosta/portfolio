/**
 * Text Editor Types and Interfaces
 */

export interface Position {
  line: number;
  column: number;
}

export interface TextRange {
  start: Position;
  end: Position;
}

export interface DocumentInfo {
  filename: string;
  content: string;
  isDirty: boolean;
  format: DocumentFormat;
  lastModified: Date;
}

export enum DocumentFormat {
  PLAIN_TEXT = 'text',
  HTML = 'html',
  MARKDOWN = 'markdown',
}

export interface EditorState {
  currentDocument: DocumentInfo | null;
  openDocuments: DocumentInfo[];
  activeDocumentIndex: number;
  cursorPosition: Position;
  selection: TextRange | null;
  isPreviewVisible: boolean;
  findText: string;
  replaceText: string;
  isFindReplaceVisible: boolean;
  undoHistory: string[];
  redoHistory: string[];
  maxHistorySize: number;
}

export interface EditorSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  lineNumbers: boolean;
  wordWrap: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  tabSize: number;
}

export interface FindReplaceOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export interface ExportOptions {
  format: 'html' | 'markdown' | 'text';
  includeCSS: boolean;
  filename?: string;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: string;
}

export interface ToolbarButton {
  id: string;
  icon: string;
  label: string;
  action: string;
  shortcut?: string;
  isActive?: boolean;
  isDisabled?: boolean;
}

export interface StatusBarInfo {
  line: number;
  column: number;
  totalLines: number;
  wordCount: number;
  characterCount: number;
  filename: string;
  format: DocumentFormat;
  isDirty: boolean;
}