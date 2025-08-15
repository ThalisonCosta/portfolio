import type { CommandDefinition, CommandContext, OSType } from '../types';
import { linuxCommands } from './linux';
import { windowsCommands } from './windows';
import {
  clearCommand,
  exitCommand,
  helpCommand,
  echoCommand,
  dateCommand,
  whoamiCommand,
  pingCommand,
  curlCommand,
  psCommand,
  uptimeCommand,
  unameCommand,
} from './shared';
import { vimCommand } from '../vim/vimCommand';

/**
 * Command Registry - Central management of all terminal commands
 */
export class CommandRegistry {
  private commands: Map<string, CommandDefinition> = new Map();
  private aliases: Map<string, string> = new Map();

  constructor(osType: OSType) {
    this.initializeCommands(osType);
  }

  /**
   * Initialize commands based on operating system type
   */
  private initializeCommands(osType: OSType): void {
    this.commands.clear();
    this.aliases.clear();

    // Shared commands available on both systems
    const sharedCommands = [
      clearCommand,
      exitCommand,
      helpCommand,
      echoCommand,
      dateCommand,
      whoamiCommand,
      pingCommand,
    ];

    // OS-specific commands
    const osCommands =
      osType === 'linux' ? [...linuxCommands, curlCommand, psCommand, uptimeCommand, unameCommand] : windowsCommands;

    // Register all commands
    [...sharedCommands, ...osCommands, vimCommand].forEach((cmd) => {
      this.commands.set(cmd.name, cmd);

      // Register aliases
      cmd.aliases.forEach((alias) => {
        this.aliases.set(alias, cmd.name);
      });
    });
  }

  /**
   * Get command by name or alias
   */
  getCommand(name: string): CommandDefinition | undefined {
    // Check if it's an alias first
    const aliasTarget = this.aliases.get(name);
    if (aliasTarget) {
      return this.commands.get(aliasTarget);
    }

    // Check direct command name
    return this.commands.get(name);
  }

  /**
   * Get all available commands
   */
  getAllCommands(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get command suggestions for autocomplete
   */
  getCommandSuggestions(partial: string): string[] {
    const suggestions: string[] = [];

    // Add matching command names
    this.commands.forEach((_, name) => {
      if (name.startsWith(partial.toLowerCase())) {
        suggestions.push(name);
      }
    });

    // Add matching aliases
    this.aliases.forEach((_, alias) => {
      if (alias.startsWith(partial.toLowerCase())) {
        suggestions.push(alias);
      }
    });

    return suggestions.sort();
  }

  /**
   * Check if a command exists
   */
  hasCommand(name: string): boolean {
    return this.commands.has(name) || this.aliases.has(name);
  }

  /**
   * Get autocomplete suggestions for command arguments
   */
  getArgumentSuggestions(commandName: string, partial: string, args: string[], context: CommandContext): string[] {
    const command = this.getCommand(commandName);
    if (!command || !command.autocomplete) {
      return [];
    }

    try {
      return command.autocomplete(partial, args, context);
    } catch (error) {
      console.warn(`Autocomplete error for command ${commandName}:`, error);
      return [];
    }
  }

  /**
   * Switch operating system and reinitialize commands
   */
  switchOS(osType: OSType): void {
    this.initializeCommands(osType);
  }

  /**
   * Get command usage information
   */
  getCommandUsage(name: string): string | undefined {
    const command = this.getCommand(name);
    return command?.usage;
  }

  /**
   * Get command description
   */
  getCommandDescription(name: string): string | undefined {
    const command = this.getCommand(name);
    return command?.description;
  }

  /**
   * Get all command names (including aliases) for validation
   */
  getAllCommandNames(): string[] {
    const names = Array.from(this.commands.keys());
    const aliases = Array.from(this.aliases.keys());
    return [...names, ...aliases];
  }
}

/**
 * Create a command registry instance
 */
export function createCommandRegistry(osType: OSType): CommandRegistry {
  return new CommandRegistry(osType);
}

/**
 * Export individual command collections for testing
 */
export {
  linuxCommands,
  windowsCommands,
  clearCommand,
  exitCommand,
  helpCommand,
  echoCommand,
  dateCommand,
  whoamiCommand,
  pingCommand,
  curlCommand,
  psCommand,
  uptimeCommand,
  unameCommand,
  vimCommand,
};
