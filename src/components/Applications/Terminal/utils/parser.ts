import type { ParsedCommand } from '../types';

/**
 * Command line parser utility
 */
export class CommandParser {
  /**
   * Parse a command line input into command, arguments, and flags
   */
  static parse(input: string): ParsedCommand {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        command: '',
        args: [],
        raw: input,
        flags: {},
      };
    }

    // Split by spaces but respect quoted strings
    const tokens = this.tokenize(trimmed);
    if (tokens.length === 0) {
      return {
        command: '',
        args: [],
        raw: input,
        flags: {},
      };
    }

    const command = tokens[0];
    const rest = tokens.slice(1);
    const args: string[] = [];
    const flags: Record<string, boolean | string> = {};

    for (let i = 0; i < rest.length; i++) {
      const token = rest[i];

      if (token.startsWith('--')) {
        // Long flag (--flag or --flag=value)
        const [flagName, ...valueParts] = token.substring(2).split('=');
        if (valueParts.length > 0) {
          flags[flagName] = valueParts.join('=');
        } else if (i + 1 < rest.length && !rest[i + 1].startsWith('-')) {
          flags[flagName] = rest[i + 1];
          i++; // Skip next token as it's the value
        } else {
          flags[flagName] = true;
        }
      } else if (token.startsWith('-') && token.length > 1) {
        // Short flag(s) (-f or -abc)
        const flagChars = token.substring(1);
        for (let j = 0; j < flagChars.length; j++) {
          const flagChar = flagChars[j];
          if (j === flagChars.length - 1 && i + 1 < rest.length && !rest[i + 1].startsWith('-')) {
            // Last flag in group might have a value
            flags[flagChar] = rest[i + 1];
            i++; // Skip next token as it's the value
          } else {
            flags[flagChar] = true;
          }
        }
      } else {
        // Regular argument
        args.push(token);
      }
    }

    return {
      command,
      args,
      raw: input,
      flags,
    };
  }

  /**
   * Tokenize input respecting quoted strings
   */
  private static tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let escaped = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (escaped) {
        current += char;
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        continue;
      }

      if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        continue;
      }

      if (char === ' ' && !inQuotes) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Escape special characters for shell
   */
  static escape(str: string): string {
    return str.replace(/[\\'"$`]/g, '\\$&');
  }

  /**
   * Check if a string needs quoting
   */
  static needsQuoting(str: string): boolean {
    return /[\s'"$`\\]/.test(str);
  }

  /**
   * Quote a string if necessary
   */
  static quote(str: string): string {
    if (!this.needsQuoting(str)) {
      return str;
    }
    return `"${str.replace(/["\\]/g, '\\$&')}"`;
  }
}
