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
  autocomplete: (partial, _, context) =>
    FileSystemUtils.getPathCompletions(context.fileSystem, context.currentDirectory, partial),
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
    ), // Only directories
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
  execute: (args, context): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'mkdir: missing operand',
        type: 'error',
      };
    }

    // Helper function to validate directory name
    const validateDirectoryName = (name: string): string | null => {
      if (!name || name.trim() === '') {
        return 'Empty name not allowed';
      }

      // Check for illegal characters
      const illegalChars = /[<>:"|?*\x00-\x1f]/;
      if (illegalChars.test(name)) {
        return 'Name contains illegal characters';
      }

      // Check for reserved names
      const reservedNames = [
        'CON',
        'PRN',
        'AUX',
        'NUL',
        'COM1',
        'COM2',
        'COM3',
        'COM4',
        'COM5',
        'COM6',
        'COM7',
        'COM8',
        'COM9',
        'LPT1',
        'LPT2',
        'LPT3',
        'LPT4',
        'LPT5',
        'LPT6',
        'LPT7',
        'LPT8',
        'LPT9',
      ];
      if (reservedNames.includes(name.toUpperCase())) {
        return 'Reserved name not allowed';
      }

      // Check for names that start or end with dots or spaces
      if (name.startsWith('.') || name.endsWith('.') || name.startsWith(' ') || name.endsWith(' ')) {
        return 'Name cannot start or end with dots or spaces';
      }

      return null;
    };

    const directories = args.filter((arg) => !arg.startsWith('-'));
    const created: string[] = [];
    const failed: string[] = [];

    for (const dir of directories) {
      // Validate directory name
      const validationError = validateDirectoryName(dir);
      if (validationError) {
        failed.push(`mkdir: cannot create directory '${dir}': ${validationError}`);
        continue;
      }

      // Resolve path to handle nested directories
      const targetPath = FileSystemUtils.resolvePath(context.currentDirectory, dir);
      const parentPath = FileSystemUtils.getParentDirectory(targetPath);
      const dirName = FileSystemUtils.getFilename(targetPath);

      // Check if parent directory exists
      if (!FileSystemUtils.pathExists(context.fileSystem, parentPath)) {
        failed.push(`mkdir: cannot create directory '${dir}': No such file or directory`);
        continue;
      }

      if (context.createFolder) {
        const success = context.createFolder(parentPath, dirName);
        if (success) {
          created.push(dir);
        } else {
          failed.push(`mkdir: cannot create directory '${dir}': File exists or permission denied`);
        }
      } else {
        failed.push(`mkdir: cannot create directory '${dir}': Operation not supported`);
      }
    }

    let output = '';
    if (created.length > 0) {
      output += `Created ${created.length} director${created.length === 1 ? 'y' : 'ies'}: ${created.join(', ')}`;
    }

    let error = '';
    if (failed.length > 0) {
      error = failed.join('\n');
    }

    return {
      success: created.length > 0,
      output,
      error: failed.length > 0 ? error : undefined,
      type: created.length > 0 ? 'success' : 'error',
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
  execute: (args, context): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'rmdir: missing operand',
        type: 'error',
      };
    }

    const removed: string[] = [];
    const failed: string[] = [];

    for (const dir of args) {
      const dirPath = FileSystemUtils.resolvePath(context.currentDirectory, dir);

      // Check if directory exists
      if (!FileSystemUtils.pathExists(context.fileSystem, dirPath)) {
        failed.push(`rmdir: failed to remove '${dir}': No such file or directory`);
        continue;
      }

      // Check if it's actually a directory
      if (!FileSystemUtils.isDirectory(context.fileSystem, dirPath)) {
        failed.push(`rmdir: failed to remove '${dir}': Not a directory`);
        continue;
      }

      // Check if directory is empty
      const contents = FileSystemUtils.getDirectoryContents(context.fileSystem, dirPath);
      if (contents.length > 0) {
        failed.push(`rmdir: failed to remove '${dir}': Directory not empty`);
        continue;
      }

      // Actually remove the directory using the desktop store
      if (context.removeFileSystemItem) {
        const success = context.removeFileSystemItem(dirPath);
        if (success) {
          removed.push(dir);
        } else {
          failed.push(`rmdir: failed to remove '${dir}': Permission denied`);
        }
      } else {
        failed.push(`rmdir: failed to remove '${dir}': Operation not supported`);
      }
    }

    let output = '';
    let error = '';

    if (removed.length > 0) {
      output = `Removed ${removed.length} director${removed.length === 1 ? 'y' : 'ies'}: ${removed.join(', ')}`;
    }

    if (failed.length > 0) {
      error = failed.join('\n');
    }

    return {
      success: removed.length > 0,
      output,
      error: failed.length > 0 ? error : undefined,
      type: removed.length > 0 ? 'success' : 'error',
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
  execute: (args, context): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'touch: missing file operand',
        type: 'error',
      };
    }

    // Helper function to validate file name
    const validateFileName = (name: string): string | null => {
      if (!name || name.trim() === '') {
        return 'Empty name not allowed';
      }

      // Check for illegal characters
      const illegalChars = /[<>:"|?*\x00-\x1f]/;
      if (illegalChars.test(name)) {
        return 'Name contains illegal characters';
      }

      // Check for reserved names
      const reservedNames = [
        'CON',
        'PRN',
        'AUX',
        'NUL',
        'COM1',
        'COM2',
        'COM3',
        'COM4',
        'COM5',
        'COM6',
        'COM7',
        'COM8',
        'COM9',
        'LPT1',
        'LPT2',
        'LPT3',
        'LPT4',
        'LPT5',
        'LPT6',
        'LPT7',
        'LPT8',
        'LPT9',
      ];
      const nameWithoutExt = name.split('.')[0];
      if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
        return 'Reserved name not allowed';
      }

      // Check for names that start or end with spaces
      if (name.startsWith(' ') || name.endsWith(' ')) {
        return 'Name cannot start or end with spaces';
      }

      return null;
    };

    const created: string[] = [];
    const failed: string[] = [];

    for (const fileName of args) {
      // Validate file name
      const validationError = validateFileName(fileName);
      if (validationError) {
        failed.push(`touch: cannot create file '${fileName}': ${validationError}`);
        continue;
      }

      // Resolve path to handle nested files
      const targetPath = FileSystemUtils.resolvePath(context.currentDirectory, fileName);
      const parentPath = FileSystemUtils.getParentDirectory(targetPath);
      const actualFileName = FileSystemUtils.getFilename(targetPath);

      // Check if parent directory exists
      if (!FileSystemUtils.pathExists(context.fileSystem, parentPath)) {
        failed.push(`touch: cannot create file '${fileName}': No such file or directory`);
        continue;
      }

      if (context.createFile) {
        const success = context.createFile(parentPath, actualFileName, '');
        if (success) {
          created.push(fileName);
        } else {
          failed.push(`touch: cannot create file '${fileName}': File exists or permission denied`);
        }
      } else {
        failed.push(`touch: cannot create file '${fileName}': Operation not supported`);
      }
    }

    let output = '';
    if (created.length > 0) {
      output += `Created/updated ${created.length} file${created.length === 1 ? '' : 's'}: ${created.join(', ')}`;
    }

    let error = '';
    if (failed.length > 0) {
      error = failed.join('\n');
    }

    return {
      success: created.length > 0,
      output,
      error: failed.length > 0 ? error : undefined,
      type: created.length > 0 ? 'success' : 'error',
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
  execute: (args, context): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'rm: missing operand',
        type: 'error',
      };
    }

    const flags = parseFlags(args);
    const files = args.filter((arg) => !arg.startsWith('-'));
    const removed: string[] = [];
    const failed: string[] = [];

    for (const file of files) {
      const filePath = FileSystemUtils.resolvePath(context.currentDirectory, file);

      if (!FileSystemUtils.pathExists(context.fileSystem, filePath)) {
        if (!flags.f && !flags.force) {
          failed.push(`rm: cannot remove '${file}': No such file or directory`);
        }
        // With -f flag, silently ignore missing files
        continue;
      }

      // Check if it's a directory and we don't have -r flag
      if (FileSystemUtils.isDirectory(context.fileSystem, filePath) && !flags.r && !flags.recursive) {
        if (!flags.f && !flags.force) {
          failed.push(`rm: cannot remove '${file}': Is a directory`);
        }
        continue;
      }

      // Check if directory is not empty and we have -r but need to handle recursion
      if (FileSystemUtils.isDirectory(context.fileSystem, filePath) && (flags.r || flags.recursive)) {
        const contents = FileSystemUtils.getDirectoryContents(context.fileSystem, filePath);
        if (contents.length > 0 && !flags.f && !flags.force) {
          // For -r without -f, we still remove directories with contents
          // This is the expected Unix behavior
        }
      }

      // Actually remove the file/directory using the desktop store
      if (context.removeFileSystemItem) {
        const success = context.removeFileSystemItem(filePath);
        if (success) {
          removed.push(file);
        } else {
          if (!flags.f && !flags.force) {
            failed.push(`rm: cannot remove '${file}': Permission denied`);
          }
          // With -f flag, silently ignore permission errors
        }
      } else {
        if (!flags.f && !flags.force) {
          failed.push(`rm: cannot remove '${file}': Operation not supported`);
        }
      }
    }

    let output = '';
    let error = '';

    if (removed.length > 0) {
      output = `Removed ${removed.length} item${removed.length === 1 ? '' : 's'}: ${removed.join(', ')}`;
    }

    if (failed.length > 0) {
      error = failed.join('\n');
    }

    return {
      success: removed.length > 0,
      output,
      error: failed.length > 0 ? error : undefined,
      type: removed.length > 0 ? 'success' : 'error',
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
  execute: (args, context): CommandResult => {
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

    const sourcePath = FileSystemUtils.resolvePath(context.currentDirectory, source);

    // Check if source exists
    if (!FileSystemUtils.pathExists(context.fileSystem, sourcePath)) {
      return {
        success: false,
        output: '',
        error: `cp: cannot stat '${source}': No such file or directory`,
        type: 'error',
      };
    }

    // Check if source is a directory (basic cp doesn't handle directories without -r)
    if (FileSystemUtils.isDirectory(context.fileSystem, sourcePath)) {
      return {
        success: false,
        output: '',
        error: `cp: -r not specified; omitting directory '${source}'`,
        type: 'error',
      };
    }

    // Get source file content
    const content = FileSystemUtils.getFileContent(context.fileSystem, sourcePath);
    if (content === null) {
      return {
        success: false,
        output: '',
        error: `cp: cannot open '${source}' for reading: Permission denied`,
        type: 'error',
      };
    }

    // Determine destination path and filename
    let destPath: string;
    let destName: string;

    if (dest.includes('/') || dest === '.') {
      // Destination is a path
      destPath = FileSystemUtils.resolvePath(context.currentDirectory, dest);

      // If destination is a directory, use source filename
      if (
        FileSystemUtils.pathExists(context.fileSystem, destPath) &&
        FileSystemUtils.isDirectory(context.fileSystem, destPath)
      ) {
        destName = FileSystemUtils.getFilename(sourcePath);
      } else {
        destName = FileSystemUtils.getFilename(destPath);
        destPath = FileSystemUtils.getParentDirectory(destPath);
      }
    } else {
      // Destination is just a filename in current directory
      destPath = context.currentDirectory;
      destName = dest;
    }

    // Check if destination parent directory exists
    if (!FileSystemUtils.pathExists(context.fileSystem, destPath)) {
      return {
        success: false,
        output: '',
        error: `cp: cannot create regular file '${dest}': No such file or directory`,
        type: 'error',
      };
    }

    // Create the copied file
    if (context.createFile) {
      const success = context.createFile(destPath, destName, content);
      if (success) {
        return {
          success: true,
          output: `Copied '${source}' to '${dest}'`,
          type: 'success',
        };
      }
      return {
        success: false,
        output: '',
        error: `cp: cannot create regular file '${dest}': File exists or permission denied`,
        type: 'error',
      };
    }
    return {
      success: false,
      output: '',
      error: 'cp: Operation not supported',
      type: 'error',
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
  execute: (args, context): CommandResult => {
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

    const sourcePath = FileSystemUtils.resolvePath(context.currentDirectory, source);

    // Check if source exists
    if (!FileSystemUtils.pathExists(context.fileSystem, sourcePath)) {
      return {
        success: false,
        output: '',
        error: `mv: cannot stat '${source}': No such file or directory`,
        type: 'error',
      };
    }

    // Get source file content (only for files, not directories)
    let content = '';
    const isSourceDir = FileSystemUtils.isDirectory(context.fileSystem, sourcePath);

    if (!isSourceDir) {
      const fileContent = FileSystemUtils.getFileContent(context.fileSystem, sourcePath);
      if (fileContent === null) {
        return {
          success: false,
          output: '',
          error: `mv: cannot open '${source}' for reading: Permission denied`,
          type: 'error',
        };
      }
      content = fileContent;
    }

    // Determine destination path and filename
    let destPath: string;
    let destName: string;

    if (dest.includes('/') || dest === '.') {
      // Destination is a path
      destPath = FileSystemUtils.resolvePath(context.currentDirectory, dest);

      // If destination is a directory, use source filename
      if (
        FileSystemUtils.pathExists(context.fileSystem, destPath) &&
        FileSystemUtils.isDirectory(context.fileSystem, destPath)
      ) {
        destName = FileSystemUtils.getFilename(sourcePath);
      } else {
        destName = FileSystemUtils.getFilename(destPath);
        destPath = FileSystemUtils.getParentDirectory(destPath);
      }
    } else {
      // Destination is just a filename in current directory
      destPath = context.currentDirectory;
      destName = dest;
    }

    // Check if destination parent directory exists
    if (!FileSystemUtils.pathExists(context.fileSystem, destPath)) {
      return {
        success: false,
        output: '',
        error: `mv: cannot move '${source}' to '${dest}': No such file or directory`,
        type: 'error',
      };
    }

    // For move operation: first create the file/folder at destination, then remove source
    let createSuccess = false;

    if (isSourceDir) {
      // Moving a directory
      if (context.createFolder) {
        createSuccess = context.createFolder(destPath, destName);
      }
    } else {
      // Moving a file
      if (context.createFile) {
        createSuccess = context.createFile(destPath, destName, content);
      }
    }

    if (!createSuccess) {
      return {
        success: false,
        output: '',
        error: `mv: cannot create '${dest}': File exists or permission denied`,
        type: 'error',
      };
    }

    // Remove the source file/directory
    if (context.removeFileSystemItem) {
      const removeSuccess = context.removeFileSystemItem(sourcePath);
      if (!removeSuccess) {
        // If we can't remove source, we should probably remove the destination we just created
        // But for simplicity, we'll just report the error
        return {
          success: false,
          output: '',
          error: `mv: cannot remove '${source}': Permission denied`,
          type: 'error',
        };
      }
    } else {
      return {
        success: false,
        output: '',
        error: 'mv: Operation not supported',
        type: 'error',
      };
    }

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
    ), // Only files
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
