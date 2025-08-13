import type { TerminalTheme } from '../types';

/**
 * Oh My Zsh inspired terminal theme
 */
export const ohMyZshTheme: TerminalTheme = {
  background: '#282c34',
  foreground: '#abb2bf',
  prompt: '#98c379',
  success: '#98c379',
  error: '#e06c75',
  warning: '#e5c07b',
  directory: '#61afef',
  file: '#abb2bf',
  executable: '#c678dd',
  comment: '#5c6370',
  selection: '#3e4451',
  cursor: '#528bff',
};

/**
 * Windows Command Prompt theme
 */
export const windowsTheme: TerminalTheme = {
  background: '#0c0c0c',
  foreground: '#cccccc',
  prompt: '#ffffff',
  success: '#00ff00',
  error: '#ff0000',
  warning: '#ffff00',
  directory: '#00ffff',
  file: '#cccccc',
  executable: '#ff00ff',
  comment: '#808080',
  selection: '#264f78',
  cursor: '#ffffff',
};

/**
 * Apply ANSI color codes to text
 */
export class AnsiColorizer {
  private static readonly ANSI_COLORS = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',

    // Foreground colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',

    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
  };

  /**
   * Convert ANSI color codes to HTML span elements
   */
  static ansiToHtml(text: string): string {
    const colorMap: Record<string, string> = {
      '\x1b[0m': '</span>',
      '\x1b[1m': '<span style="font-weight: bold;">',
      '\x1b[2m': '<span style="opacity: 0.5;">',
      '\x1b[3m': '<span style="font-style: italic;">',
      '\x1b[4m': '<span style="text-decoration: underline;">',
      '\x1b[30m': '<span style="color: #000000;">',
      '\x1b[31m': '<span style="color: #e06c75;">',
      '\x1b[32m': '<span style="color: #98c379;">',
      '\x1b[33m': '<span style="color: #e5c07b;">',
      '\x1b[34m': '<span style="color: #61afef;">',
      '\x1b[35m': '<span style="color: #c678dd;">',
      '\x1b[36m': '<span style="color: #56b6c2;">',
      '\x1b[37m': '<span style="color: #abb2bf;">',
      '\x1b[40m': '<span style="background-color: #000000;">',
      '\x1b[41m': '<span style="background-color: #e06c75;">',
      '\x1b[42m': '<span style="background-color: #98c379;">',
      '\x1b[43m': '<span style="background-color: #e5c07b;">',
      '\x1b[44m': '<span style="background-color: #61afef;">',
      '\x1b[45m': '<span style="background-color: #c678dd;">',
      '\x1b[46m': '<span style="background-color: #56b6c2;">',
      '\x1b[47m': '<span style="background-color: #abb2bf;">',
    };

    let result = text;
    Object.entries(colorMap).forEach(([ansi, html]) => {
      result = result.replace(new RegExp(ansi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), html);
    });

    return result;
  }

  /**
   * Add color to text for specific contexts
   */
  static colorize(
    text: string,
    type: 'success' | 'error' | 'warning' | 'info' | 'directory' | 'file' | 'executable'
  ): string {
    const colors = {
      success: this.ANSI_COLORS.green,
      error: this.ANSI_COLORS.red,
      warning: this.ANSI_COLORS.yellow,
      info: this.ANSI_COLORS.cyan,
      directory: this.ANSI_COLORS.blue,
      file: this.ANSI_COLORS.white,
      executable: this.ANSI_COLORS.magenta,
    };

    return `${colors[type]}${text}${this.ANSI_COLORS.reset}`;
  }

  /**
   * Format file listing with colors
   */
  static formatFileList(files: Array<{ name: string; isDirectory: boolean; isExecutable?: boolean }>): string {
    return files
      .map((file) => {
        if (file.isDirectory) {
          return this.colorize(`${file.name}/`, 'directory');
        }
        if (file.isExecutable) {
          return this.colorize(file.name, 'executable');
        }
        return this.colorize(file.name, 'file');
      })
      .join('  ');
  }
}

/**
 * Syntax highlighting for command input
 */
export class SyntaxHighlighter {
  private static readonly LINUX_COMMANDS = [
    'ls',
    'cd',
    'pwd',
    'mkdir',
    'rmdir',
    'rm',
    'cp',
    'mv',
    'touch',
    'cat',
    'grep',
    'find',
    'sort',
    'wc',
    'head',
    'tail',
    'chmod',
    'chown',
    'ps',
    'kill',
    'top',
    'df',
    'du',
    'tar',
    'gzip',
    'gunzip',
    'wget',
    'curl',
    'ping',
    'ssh',
    'scp',
    'sudo',
    'su',
    'man',
    'which',
    'whereis',
    'whoami',
    'id',
    'date',
    'uptime',
    'uname',
    'clear',
    'exit',
  ];

  private static readonly WINDOWS_COMMANDS = [
    'dir',
    'cd',
    'md',
    'mkdir',
    'rd',
    'rmdir',
    'del',
    'copy',
    'move',
    'type',
    'echo',
    'cls',
    'exit',
    'ver',
    'time',
    'date',
    'ping',
    'ipconfig',
    'nslookup',
    'tracert',
    'attrib',
    'find',
    'findstr',
    'sort',
    'more',
    'tree',
    'tasklist',
    'taskkill',
  ];

  /**
   * Highlight command syntax
   */
  static highlight(input: string, osType: 'linux' | 'windows'): string {
    const commands = osType === 'linux' ? this.LINUX_COMMANDS : this.WINDOWS_COMMANDS;
    const parts = input.split(' ');

    if (parts.length === 0) return input;

    const command = parts[0];
    const isValidCommand = commands.includes(command);

    let result = isValidCommand
      ? `<span style="color: #98c379; font-weight: bold;">${command}</span>`
      : `<span style="color: #e06c75;">${command}</span>`;

    if (parts.length > 1) {
      const args = parts.slice(1).join(' ');
      result += ` <span style="color: #abb2bf;">${args}</span>`;
    }

    return result;
  }

  /**
   * Check if a command is valid
   */
  static isValidCommand(command: string, osType: 'linux' | 'windows'): boolean {
    const commands = osType === 'linux' ? this.LINUX_COMMANDS : this.WINDOWS_COMMANDS;
    return commands.includes(command);
  }
}
