import type { CommandDefinition, CommandResult } from '../types';
import { FileSystemUtils } from '../utils/filesystem';
import { AnsiColorizer } from '../utils/colors';

/**
 * List directory contents (ls)
 */
export const lsCommand: CommandDefinition = {
  name: 'ls',
  aliases: ['ll'],
  description: 'List directory contents',
  usage: 'ls [options] [directory]',
  execute: (args, context): CommandResult => {
    const flags = parseFlags(args);
    const paths = args.filter((arg) => !arg.startsWith('-'));
    const targetPath =
      paths.length > 0 ? FileSystemUtils.resolvePath(context.currentDirectory, paths[0]) : context.currentDirectory;

    if (!FileSystemUtils.pathExists(context.fileSystem, targetPath)) {
      return {
        success: false,
        output: '',
        error: `ls: cannot access '${paths[0] || targetPath}': No such file or directory`,
        type: 'error',
      };
    }

    if (!FileSystemUtils.isDirectory(context.fileSystem, targetPath)) {
      // If it's a file, just show the file
      const filename = FileSystemUtils.getFilename(targetPath);
      return {
        success: true,
        output: filename,
        type: 'output',
      };
    }

    const items = FileSystemUtils.getDirectoryContents(context.fileSystem, targetPath);

    if (items.length === 0) {
      return {
        success: true,
        output: '',
        type: 'output',
      };
    }

    if (flags.l || flags.long) {
      // Long format
      const lines = items.map((item) => {
        const permissions = item.isDirectory ? 'drwxr-xr-x' : '-rw-r--r--';
        const size = item.isDirectory ? '4096' : (item.size || 0).toString();
        const date = item.modified?.toLocaleDateString() || new Date().toLocaleDateString();
        const name = item.isDirectory
          ? AnsiColorizer.colorize(item.name, 'directory')
          : AnsiColorizer.colorize(item.name, 'file');

        return `${permissions} 1 ${context.username} ${context.username} ${size.padStart(8)} ${date} ${name}`;
      });

      return {
        success: true,
        output: lines.join('\n'),
        type: 'output',
      };
    }

    // Simple format
    const fileList = items.map((item) => ({
      name: item.name,
      isDirectory: item.isDirectory,
      isExecutable: FileSystemUtils.isExecutable(item.name),
    }));

    return {
      success: true,
      output: AnsiColorizer.formatFileList(fileList),
      type: 'output',
    };
  },
  autocomplete: (partial, _, context) => FileSystemUtils.getPathCompletions(context.fileSystem, context.currentDirectory, partial),
};

/**
 * Change directory (cd)
 */
export const cdCommand: CommandDefinition = {
  name: 'cd',
  aliases: [],
  description: 'Change current directory',
  usage: 'cd [directory]',
  execute: (args, context): CommandResult => {
    let targetPath: string;

    if (args.length === 0) {
      // cd with no arguments goes to home directory
      targetPath = '/Desktop';
    } else {
      targetPath = FileSystemUtils.resolvePath(context.currentDirectory, args[0]);
    }

    if (!FileSystemUtils.pathExists(context.fileSystem, targetPath)) {
      return {
        success: false,
        output: '',
        error: `cd: no such file or directory: ${args[0] || 'home'}`,
        type: 'error',
      };
    }

    if (!FileSystemUtils.isDirectory(context.fileSystem, targetPath)) {
      return {
        success: false,
        output: '',
        error: `cd: not a directory: ${args[0]}`,
        type: 'error',
      };
    }

    return {
      success: true,
      output: '',
      newDirectory: targetPath,
      type: 'success',
    };
  },
  autocomplete: (partial, _, context) => 
     FileSystemUtils.getPathCompletions(context.fileSystem, context.currentDirectory, partial).filter((path) =>
      path.endsWith('/')
    ) // Only directories
  ,
};

/**
 * Print working directory (pwd)
 */
export const pwdCommand: CommandDefinition = {
  name: 'pwd',
  aliases: [],
  description: 'Print current working directory',
  usage: 'pwd',
  execute: (_, context): CommandResult => ({
    success: true,
    output: context.currentDirectory,
    type: 'output',
  }),
};

/**
 * Create directory (mkdir)
 */
export const mkdirCommand: CommandDefinition = {
  name: 'mkdir',
  aliases: [],
  description: 'Create directories',
  usage: 'mkdir [options] directory...',
  execute: (args, _): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'mkdir: missing operand',
        type: 'error',
      };
    }

    // In a real implementation, this would create directories
    // For the portfolio, we'll simulate the command
    const created = args.filter((arg) => !arg.startsWith('-'));

    return {
      success: true,
      output: `Created ${created.length} director${created.length === 1 ? 'y' : 'ies'}: ${created.join(', ')}`,
      type: 'success',
    };
  },
};

/**
 * Remove directory (rmdir)
 */
export const rmdirCommand: CommandDefinition = {
  name: 'rmdir',
  aliases: [],
  description: 'Remove empty directories',
  usage: 'rmdir directory...',
  execute: (args): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'rmdir: missing operand',
        type: 'error',
      };
    }

    return {
      success: true,
      output: `Removed ${args.length} director${args.length === 1 ? 'y' : 'ies'}: ${args.join(', ')}`,
      type: 'success',
    };
  },
};

/**
 * Create file (touch)
 */
export const touchCommand: CommandDefinition = {
  name: 'touch',
  aliases: [],
  description: 'Create empty files or update timestamps',
  usage: 'touch file...',
  execute: (args): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'touch: missing file operand',
        type: 'error',
      };
    }

    return {
      success: true,
      output: `Created/updated ${args.length} file${args.length === 1 ? '' : 's'}: ${args.join(', ')}`,
      type: 'success',
    };
  },
};

/**
 * Remove files (rm)
 */
export const rmCommand: CommandDefinition = {
  name: 'rm',
  aliases: [],
  description: 'Remove files and directories',
  usage: 'rm [options] file...',
  execute: (args): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'rm: missing operand',
        type: 'error',
      };
    }

    const files = args.filter((arg) => !arg.startsWith('-'));

    return {
      success: true,
      output: `Removed ${files.length} item${files.length === 1 ? '' : 's'}: ${files.join(', ')}`,
      type: 'success',
    };
  },
};

/**
 * Copy files (cp)
 */
export const cpCommand: CommandDefinition = {
  name: 'cp',
  aliases: [],
  description: 'Copy files or directories',
  usage: 'cp [options] source destination',
  execute: (args): CommandResult => {
    if (args.length < 2) {
      return {
        success: false,
        output: '',
        error: 'cp: missing destination file operand',
        type: 'error',
      };
    }

    const source = args[args.length - 2];
    const dest = args[args.length - 1];

    return {
      success: true,
      output: `Copied '${source}' to '${dest}'`,
      type: 'success',
    };
  },
};

/**
 * Move/rename files (mv)
 */
export const mvCommand: CommandDefinition = {
  name: 'mv',
  aliases: [],
  description: 'Move/rename files or directories',
  usage: 'mv source destination',
  execute: (args): CommandResult => {
    if (args.length < 2) {
      return {
        success: false,
        output: '',
        error: 'mv: missing destination file operand',
        type: 'error',
      };
    }

    const source = args[0];
    const dest = args[1];

    return {
      success: true,
      output: `Moved '${source}' to '${dest}'`,
      type: 'success',
    };
  },
};

/**
 * Display file contents (cat)
 */
export const catCommand: CommandDefinition = {
  name: 'cat',
  aliases: [],
  description: 'Display file contents',
  usage: 'cat file...',
  execute: (args, context): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'cat: missing file operand',
        type: 'error',
      };
    }

    const results: string[] = [];

    for (const file of args) {
      const filePath = FileSystemUtils.resolvePath(context.currentDirectory, file);

      if (!FileSystemUtils.pathExists(context.fileSystem, filePath)) {
        results.push(`cat: ${file}: No such file or directory`);
        continue;
      }

      if (FileSystemUtils.isDirectory(context.fileSystem, filePath)) {
        results.push(`cat: ${file}: Is a directory`);
        continue;
      }

      const content = FileSystemUtils.getFileContent(context.fileSystem, filePath);
      if (content !== null) {
        results.push(content);
      } else {
        results.push(`cat: ${file}: Permission denied`);
      }
    }

    return {
      success: true,
      output: results.join('\n'),
      type: 'output',
    };
  },
  autocomplete: (partial, _, context) => 
     FileSystemUtils.getPathCompletions(context.fileSystem, context.currentDirectory, partial).filter(
      (path) => !path.endsWith('/')
    ) // Only files
  ,
};

/**
 * Search text in files (grep)
 */
export const grepCommand: CommandDefinition = {
  name: 'grep',
  aliases: [],
  description: 'Search text patterns in files',
  usage: 'grep [options] pattern [file...]',
  execute: (args, context): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'grep: missing pattern',
        type: 'error',
      };
    }

    const pattern = args[0];
    const files = args.slice(1);

    if (files.length === 0) {
      return {
        success: true,
        output: `Searching for pattern '${pattern}' in standard input...`,
        type: 'output',
      };
    }

    const results: string[] = [];

    for (const file of files) {
      const filePath = FileSystemUtils.resolvePath(context.currentDirectory, file);
      const content = FileSystemUtils.getFileContent(context.fileSystem, filePath);

      if (content) {
        const lines = content.split('\n');
        const matches = lines.filter((line) => line.includes(pattern));

        if (matches.length > 0) {
          results.push(`${file}:`);
          results.push(...matches.map((match) => `  ${match}`));
        }
      }
    }

    return {
      success: true,
      output: results.length > 0 ? results.join('\n') : `No matches found for '${pattern}'`,
      type: 'output',
    };
  },
};

/**
 * Find files (find)
 */
export const findCommand: CommandDefinition = {
  name: 'find',
  aliases: [],
  description: 'Search for files and directories',
  usage: 'find [path] [options]',
  execute: (args, context): CommandResult => {
    const searchPath = args.length > 0 && !args[0].startsWith('-') ? args[0] : context.currentDirectory;
    const namePattern = args.find((_, i) => args[i - 1] === '-name');

    if (!namePattern) {
      return {
        success: true,
        output: `Searching in ${searchPath}...`,
        type: 'output',
      };
    }

    // Simulate finding files
    const results = [
      `${searchPath}/example1.txt`,
      `${searchPath}/subfolder/example2.txt`,
      `${searchPath}/documents/readme.md`,
    ].filter((path) => path.includes(namePattern));

    return {
      success: true,
      output: results.join('\n'),
      type: 'output',
    };
  },
};

// Helper function to parse command flags
function parseFlags(args: string[]): Record<string, boolean> {
  const flags: Record<string, boolean> = {};

  args.forEach((arg) => {
    if (arg.startsWith('--')) {
      flags[arg.substring(2)] = true;
    } else if (arg.startsWith('-')) {
      arg
        .substring(1)
        .split('')
        .forEach((flag) => {
          flags[flag] = true;
        });
    }
  });

  return flags;
}

export const linuxCommands: CommandDefinition[] = [
  lsCommand,
  cdCommand,
  pwdCommand,
  mkdirCommand,
  rmdirCommand,
  touchCommand,
  rmCommand,
  cpCommand,
  mvCommand,
  catCommand,
  grepCommand,
  findCommand,
];
