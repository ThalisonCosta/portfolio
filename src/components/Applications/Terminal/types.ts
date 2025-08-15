/**
 * TypeScript interfaces and types for the Terminal application
 */

/** Represents the current operating system for command execution */
export type OSType = 'linux' | 'windows';

/** Terminal theme configuration */
export interface TerminalTheme {
  /** Background color of the terminal */
  background: string;
  /** Primary text color */
  foreground: string;
  /** Command prompt color */
  prompt: string;
  /** Success message color */
  success: string;
  /** Error message color */
  error: string;
  /** Warning message color */
  warning: string;
  /** Directory color in listings */
  directory: string;
  /** File color in listings */
  file: string;
  /** Executable file color */
  executable: string;
  /** Comment/secondary text color */
  comment: string;
  /** Selection/highlight color */
  selection: string;
  /** Cursor color */
  cursor: string;
}

/** Represents a single line of terminal output */
export interface TerminalOutputLine {
  /** Unique identifier for the line */
  id: string;
  /** The content of the line */
  content: string;
  /** Type of output line for styling */
  type: 'input' | 'output' | 'error' | 'success' | 'warning' | 'info';
  /** Optional additional CSS classes */
  className?: string;
  /** Timestamp when the line was created */
  timestamp: Date;
}

/** Command execution context */
export interface CommandContext {
  /** Current working directory */
  currentDirectory: string;
  /** Current operating system type */
  osType: OSType;
  /** Environment variables */
  env: Record<string, string>;
  /** Command history */
  history: string[];
  /** Reference to the file system */
  fileSystem: import('../../../stores/useDesktopStore').FileSystemItem[];
  /** Username for the prompt */
  username: string;
  /** Hostname for the prompt */
  hostname: string;
  /** Function to create a file in the desktop store */
  createFile?: (path: string, name: string, content?: string) => boolean;
  /** Function to create a folder in the desktop store */
  createFolder?: (path: string, name: string) => boolean;
  /** Function to remove a file or folder from the desktop store */
  removeFileSystemItem?: (path: string) => boolean;
}

/** Result of command execution */
export interface CommandResult {
  /** Success status of the command */
  success: boolean;
  /** Output content */
  output: string;
  /** Error message if command failed */
  error?: string;
  /** Whether to clear the terminal */
  clear?: boolean;
  /** New working directory if changed */
  newDirectory?: string;
  /** Exit the terminal (for exit command) */
  exit?: boolean;
  /** Type of output for styling */
  type?: 'output' | 'error' | 'success' | 'warning' | 'info' | 'vim';
  /** Vim-specific data when entering vim mode */
  vimData?: {
    filename?: string;
    currentDirectory: string;
  };
}

/** Command definition */
export interface CommandDefinition {
  /** Command name */
  name: string;
  /** Command aliases */
  aliases: string[];
  /** Command description */
  description: string;
  /** Usage information */
  usage: string;
  /** Execute the command */
  execute: (args: string[], context: CommandContext) => Promise<CommandResult> | CommandResult;
  /** Autocomplete function */
  autocomplete?: (partial: string, args: string[], context: CommandContext) => string[];
}

/** Terminal state */
export interface TerminalState {
  /** Array of output lines */
  output: TerminalOutputLine[];
  /** Current command being typed */
  currentInput: string;
  /** Current working directory */
  currentDirectory: string;
  /** Command history */
  history: string[];
  /** Current history index */
  historyIndex: number;
  /** Current OS type */
  osType: OSType;
  /** Whether terminal is busy executing command */
  isExecuting: boolean;
  /** Current theme */
  theme: TerminalTheme;
  /** Username */
  username: string;
  /** Hostname */
  hostname: string;
  /** Environment variables */
  env: Record<string, string>;
  /** Autocomplete suggestions */
  suggestions: string[];
  /** Whether autocomplete is active */
  showSuggestions: boolean;
  /** Selected suggestion index */
  selectedSuggestion: number;
  /** Cursor position in input */
  cursorPosition: number;
  /** Whether vim mode is active */
  isVimMode?: boolean;
  /** Vim editor data when in vim mode */
  vimData?: {
    filename?: string;
    currentDirectory: string;
  };
}

/** Autocomplete result */
export interface AutocompleteResult {
  /** Available completions */
  completions: string[];
  /** Common prefix of all completions */
  commonPrefix: string;
  /** Whether there's an exact match */
  hasExactMatch: boolean;
}

/** File system item for terminal operations and autocomplete */
export interface TerminalFileSystemItem {
  /** File/directory name */
  name: string;
  /** Whether it's a directory */
  isDirectory: boolean;
  /** Full path */
  path: string;
  /** File permissions (for display) */
  permissions?: string;
  /** File size */
  size?: number;
  /** Last modified date */
  modified?: Date;
}

/** Network command result (for ping, curl, etc.) */
export interface NetworkResult {
  /** Success status */
  success: boolean;
  /** Response data */
  data: string;
  /** Response time in milliseconds */
  responseTime: number;
  /** Status code (for HTTP requests) */
  statusCode?: number;
  /** Error message */
  error?: string;
}

/** Process information (for ps command) */
export interface ProcessInfo {
  /** Process ID */
  pid: number;
  /** Process name */
  name: string;
  /** CPU usage percentage */
  cpu: number;
  /** Memory usage */
  memory: string;
  /** Process state */
  state: string;
  /** Start time */
  startTime: string;
}

/** System information */
export interface SystemInfo {
  /** Operating system */
  os: string;
  /** OS version */
  version: string;
  /** Architecture */
  arch: string;
  /** Uptime */
  uptime: string;
  /** Current user */
  user: string;
  /** Hostname */
  hostname: string;
  /** Current date/time */
  datetime: string;
}

/** Command parsing result */
export interface ParsedCommand {
  /** Command name */
  command: string;
  /** Command arguments */
  args: string[];
  /** Raw input */
  raw: string;
  /** Flags/options */
  flags: Record<string, boolean | string>;
}
