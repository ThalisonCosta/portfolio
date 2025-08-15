import type { CommandDefinition, CommandResult, CommandContext } from '../types';

/**
 * Vim text editor command for the terminal
 *
 * This command switches the terminal into vim mode, transforming it into a full-screen
 * text editor with modal editing capabilities inspired by LunarVim.
 */
export const vimCommand: CommandDefinition = {
  name: 'vim',
  aliases: ['vi'],
  description: 'Open vim text editor (LunarVim-inspired)',
  usage: 'vim [filename]',
  execute: async (args: string[], context: CommandContext): Promise<CommandResult> => {
    const filename = args[0];

    // Validate filename if provided
    if (filename) {
      // Check for invalid characters or paths
      if (filename.includes('..') || filename.startsWith('/')) {
        return {
          success: false,
          output: '',
          error: `vim: "${filename}": Invalid filename`,
          type: 'error',
        };
      }
    }

    // Return a special result that signals the terminal to enter vim mode
    return {
      success: true,
      output: '', // No output - we'll switch to vim mode
      type: 'vim', // Custom type to signal vim mode entry
      vimData: {
        filename,
        currentDirectory: context.currentDirectory,
      },
    };
  },
  autocomplete: (partial: string, args: string[], context: CommandContext): string[] => {
    // If we're completing the first argument (filename), suggest files
    if (args.length <= 1) {
      try {
        // Get files from the current directory
        const files = context.fileSystem || [];
        return files
          .filter((item: any) => !item.isFolder && item.name.startsWith(partial))
          .map((item: any) => item.name)
          .slice(0, 10); // Limit suggestions
      } catch (error) {
        return [];
      }
    }
    return [];
  },
};
