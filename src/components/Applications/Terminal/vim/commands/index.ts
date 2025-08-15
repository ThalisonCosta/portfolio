import type { VimCommand, VimState, VimEditorContext, OperationResult } from '../types';

/**
 * Write (save) command
 */
const writeCommand: VimCommand = {
  name: 'w',
  aliases: ['write'],
  description: 'Write (save) the current buffer',
  execute: async (args: string[], state: VimState, context: VimEditorContext): Promise<OperationResult> => {
    const filename = args[0] || state.filename;

    if (!filename) {
      return {
        success: false,
        message: 'E32: No file name',
        messageType: 'error',
      };
    }

    try {
      const content = state.buffer.join('\n');
      const success = await context.saveFile(filename, content);

      if (success) {
        const newState: VimState = {
          ...state,
          filename,
          isModified: false,
          mode: 'normal',
          commandInput: '',
        };

        return {
          success: true,
          state: newState,
          message: `"${filename}" ${state.buffer.length}L, ${content.length}C written`,
          messageType: 'info',
        };
      }
      return {
        success: false,
        message: `E212: Can't open file for writing: ${filename}`,
        messageType: 'error',
      };
    } catch (error) {
      return {
        success: false,
        message: `Write error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        messageType: 'error',
      };
    }
  },
};

/**
 * Quit command
 */
const quitCommand: VimCommand = {
  name: 'q',
  aliases: ['quit'],
  description: 'Quit vim',
  execute: async (_args: string[], state: VimState, context: VimEditorContext): Promise<OperationResult> => {
    if (state.isModified) {
      return {
        success: false,
        message: 'E37: No write since last change (add ! to override)',
        messageType: 'error',
      };
    }

    context.exitVim();
    return { success: true };
  },
};

/**
 * Force quit command
 */
const forceQuitCommand: VimCommand = {
  name: 'q!',
  aliases: ['quit!'],
  description: 'Force quit vim (discard changes)',
  execute: async (_args: string[], _state: VimState, context: VimEditorContext): Promise<OperationResult> => {
    context.exitVim();
    return { success: true };
  },
};

/**
 * Write and quit command
 */
const writeQuitCommand: VimCommand = {
  name: 'wq',
  aliases: ['x'],
  description: 'Write and quit',
  execute: async (args: string[], state: VimState, context: VimEditorContext): Promise<OperationResult> => {
    // First try to write
    const writeResult = await writeCommand.execute(args, state, context);

    if (!writeResult.success) {
      return writeResult;
    }

    // If write was successful, quit
    context.exitVim();
    return { success: true };
  },
};

/**
 * Edit command
 */
const editCommand: VimCommand = {
  name: 'e',
  aliases: ['edit'],
  description: 'Edit a file',
  execute: async (args: string[], state: VimState, context: VimEditorContext): Promise<OperationResult> => {
    if (state.isModified) {
      return {
        success: false,
        message: 'E37: No write since last change (add ! to override)',
        messageType: 'error',
      };
    }

    const filename = args[0];
    if (!filename) {
      return {
        success: false,
        message: 'E471: Argument required',
        messageType: 'error',
      };
    }

    try {
      const content = await context.loadFile(filename);
      const lines = content.split('\n');

      const newState: VimState = {
        ...state,
        filename,
        buffer: lines.length > 0 ? lines : [''],
        isModified: false,
        cursor: { line: 0, column: 0 },
        mode: 'normal',
        commandInput: '',
      };

      return {
        success: true,
        state: newState,
        message: `"${filename}" ${lines.length}L, ${content.length}C`,
        messageType: 'info',
      };
    } catch (error) {
      // File doesn't exist, create new buffer
      const newState: VimState = {
        ...state,
        filename,
        buffer: [''],
        isModified: false,
        cursor: { line: 0, column: 0 },
        mode: 'normal',
        commandInput: '',
      };

      return {
        success: true,
        state: newState,
        message: `"${filename}" [New File]`,
        messageType: 'info',
      };
    }
  },
};

/**
 * Set command for vim options
 */
const setCommand: VimCommand = {
  name: 'set',
  aliases: ['se'],
  description: 'Set vim options',
  execute: async (args: string[], state: VimState, _context: VimEditorContext): Promise<OperationResult> => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'E471: Argument required',
        messageType: 'error',
      };
    }

    const option = args[0];
    const newState = { ...state };
    let message = '';

    switch (option) {
      case 'number':
      case 'nu':
        newState.showLineNumbers = true;
        message = 'Line numbers enabled';
        break;
      case 'nonumber':
      case 'nonu':
        newState.showLineNumbers = false;
        message = 'Line numbers disabled';
        break;
      default:
        return {
          success: false,
          message: `E518: Unknown option: ${option}`,
          messageType: 'error',
        };
    }

    newState.mode = 'normal';
    newState.commandInput = '';

    return {
      success: true,
      state: newState,
      message,
      messageType: 'info',
    };
  },
};

/**
 * Help command
 */
const helpCommand: VimCommand = {
  name: 'help',
  aliases: ['h'],
  description: 'Show help',
  execute: async (_args: string[], state: VimState, _context: VimEditorContext): Promise<OperationResult> => {
    const helpText = [
      '=== Vim Help ===',
      '',
      'Normal Mode Commands:',
      '  h, j, k, l    - Move cursor left, down, up, right',
      '  w, b, e       - Word movements',
      '  0, $          - Beginning/end of line',
      '  gg, G         - First/last line',
      '  i, a, o, O    - Enter insert mode',
      '  x             - Delete character',
      '  dd            - Delete line',
      '  yy            - Yank (copy) line',
      '  p, P          - Put (paste)',
      '  u             - Undo',
      '  Ctrl+r        - Redo',
      '  /             - Search',
      '  v             - Enter visual mode',
      '  :             - Enter command mode',
      '',
      'Command Mode:',
      '  :w            - Write (save) file',
      '  :q            - Quit',
      '  :wq           - Write and quit',
      '  :q!           - Force quit',
      '  :e <file>     - Edit file',
      '  :set number   - Show line numbers',
      '  :help         - Show this help',
      '',
      'Press : to enter command mode, then type a command.',
    ];

    const newState: VimState = {
      ...state,
      buffer: helpText,
      filename: '[Help]',
      isModified: false,
      cursor: { line: 0, column: 0 },
      mode: 'normal',
      commandInput: '',
    };

    return {
      success: true,
      state: newState,
      message: 'Help loaded',
      messageType: 'info',
    };
  },
};

/**
 * All available vim commands
 */
export const vimCommands: VimCommand[] = [
  writeCommand,
  quitCommand,
  forceQuitCommand,
  writeQuitCommand,
  editCommand,
  setCommand,
  helpCommand,
];
