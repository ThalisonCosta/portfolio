import type { CommandDefinition, CommandResult } from '../types';
import { FileSystemUtils } from '../utils/filesystem';
import { AnsiColorizer } from '../utils/colors';

/**
 * List directory contents (dir)
 */
export const dirCommand: CommandDefinition = {
  name: 'dir',
  aliases: [],
  description: 'Display directory contents',
  usage: 'dir [path]',
  execute: (args, context): CommandResult => {
    const targetPath =
      args.length > 0 ? FileSystemUtils.resolvePath(context.currentDirectory, args[0]) : context.currentDirectory;

    if (!FileSystemUtils.pathExists(context.fileSystem, targetPath)) {
      return {
        success: false,
        output: '',
        error: `The system cannot find the path specified.`,
        type: 'error',
      };
    }

    if (!FileSystemUtils.isDirectory(context.fileSystem, targetPath)) {
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
        output: 'Directory is empty.',
        type: 'output',
      };
    }

    const header = [
      ` Volume in drive C has no label.`,
      ` Volume Serial Number is 1234-5678`,
      ``,
      ` Directory of ${targetPath}`,
      ``,
    ];

    const lines = items.map((item) => {
      const date = item.modified?.toLocaleDateString('en-US') || new Date().toLocaleDateString('en-US');
      const time =
        item.modified?.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) || '00:00';
      const size = item.isDirectory ? '<DIR>' : (item.size || 0).toString().padStart(15);
      const name = item.isDirectory
        ? AnsiColorizer.colorize(item.name, 'directory')
        : AnsiColorizer.colorize(item.name, 'file');

      return `${date}  ${time}    ${size} ${name}`;
    });

    const totalFiles = items.filter((item) => !item.isDirectory).length;
    const totalDirs = items.filter((item) => item.isDirectory).length;
    const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);

    const footer = [
      ``,
      `               ${totalFiles} File(s)  ${totalSize.toLocaleString()} bytes`,
      `               ${totalDirs} Dir(s)   999,999,999 bytes free`,
    ];

    return {
      success: true,
      output: [...header, ...lines, ...footer].join('\n'),
      type: 'output',
    };
  },
  autocomplete: (partial, _, context) =>
    FileSystemUtils.getPathCompletions(context.fileSystem, context.currentDirectory, partial),
};

/**
 * Change directory (cd)
 */
export const cdWindowsCommand: CommandDefinition = {
  name: 'cd',
  aliases: ['chdir'],
  description: 'Change current directory',
  usage: 'cd [directory]',
  execute: (args, context): CommandResult => {
    if (args.length === 0) {
      // cd with no arguments shows current directory
      return {
        success: true,
        output: context.currentDirectory,
        type: 'output',
      };
    }

    const targetPath = FileSystemUtils.resolvePath(context.currentDirectory, args[0]);

    if (!FileSystemUtils.pathExists(context.fileSystem, targetPath)) {
      return {
        success: false,
        output: '',
        error: `The system cannot find the path specified.`,
        type: 'error',
      };
    }

    if (!FileSystemUtils.isDirectory(context.fileSystem, targetPath)) {
      return {
        success: false,
        output: '',
        error: `The directory name is invalid.`,
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
 * Create directory (md/mkdir)
 */
export const mdCommand: CommandDefinition = {
  name: 'md',
  aliases: ['mkdir'],
  description: 'Create directories',
  usage: 'md directory',
  execute: (args, context): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'The syntax of the command is incorrect.',
        type: 'error',
      };
    }

    const created: string[] = [];
    const failed: string[] = [];

    for (const dir of args) {
      if (context.createFolder) {
        const success = context.createFolder(context.currentDirectory, dir);
        if (success) {
          created.push(dir);
        } else {
          failed.push(dir);
        }
      } else {
        failed.push(dir);
      }
    }

    let output = '';
    if (created.length > 0) {
      output += created.map((dir) => `Directory created: ${dir}`).join('\n');
    }

    let error = '';
    if (failed.length > 0) {
      error = `A subdirectory or file ${failed.join(', ')} already exists.`;
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
 * Remove directory (rd/rmdir)
 */
export const rdCommand: CommandDefinition = {
  name: 'rd',
  aliases: ['rmdir'],
  description: 'Remove directories',
  usage: 'rd directory',
  execute: (args): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'The syntax of the command is incorrect.',
        type: 'error',
      };
    }

    return {
      success: true,
      output: `Directory removed: ${args[0]}`,
      type: 'success',
    };
  },
};

/**
 * Delete files (del)
 */
export const delCommand: CommandDefinition = {
  name: 'del',
  aliases: ['erase'],
  description: 'Delete files',
  usage: 'del filename',
  execute: (args): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'The syntax of the command is incorrect.',
        type: 'error',
      };
    }

    const files = args.filter((arg) => !arg.startsWith('/'));

    return {
      success: true,
      output: `Deleted ${files.length} file${files.length === 1 ? '' : 's'}.`,
      type: 'success',
    };
  },
};

/**
 * Copy files (copy)
 */
export const copyCommand: CommandDefinition = {
  name: 'copy',
  aliases: [],
  description: 'Copy files',
  usage: 'copy source destination',
  execute: (args): CommandResult => {
    if (args.length < 2) {
      return {
        success: false,
        output: '',
        error: 'The syntax of the command is incorrect.',
        type: 'error',
      };
    }

    // Copy operation simulated
    const [source, dest] = args;

    return {
      success: true,
      output: `        1 file(s) copied.\n        ${source} -> ${dest}`,
      type: 'success',
    };
  },
};

/**
 * Move files (move)
 */
export const moveCommand: CommandDefinition = {
  name: 'move',
  aliases: [],
  description: 'Move files and directories',
  usage: 'move source destination',
  execute: (args): CommandResult => {
    if (args.length < 2) {
      return {
        success: false,
        output: '',
        error: 'The syntax of the command is incorrect.',
        type: 'error',
      };
    }

    // Move operation simulated
    const [source, dest] = args;

    return {
      success: true,
      output: `        1 file(s) moved.\n        ${source} -> ${dest}`,
      type: 'success',
    };
  },
};

/**
 * Display file contents (type)
 */
export const typeCommand: CommandDefinition = {
  name: 'type',
  aliases: [],
  description: 'Display file contents',
  usage: 'type filename',
  execute: (args, context): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'The syntax of the command is incorrect.',
        type: 'error',
      };
    }

    const [file] = args;
    const filePath = FileSystemUtils.resolvePath(context.currentDirectory, file);

    if (!FileSystemUtils.pathExists(context.fileSystem, filePath)) {
      return {
        success: false,
        output: '',
        error: `The system cannot find the file specified.`,
        type: 'error',
      };
    }

    if (FileSystemUtils.isDirectory(context.fileSystem, filePath)) {
      return {
        success: false,
        output: '',
        error: `Access is denied.`,
        type: 'error',
      };
    }

    const content = FileSystemUtils.getFileContent(context.fileSystem, filePath);
    if (content !== null) {
      return {
        success: true,
        output: content,
        type: 'output',
      };
    }
    return {
      success: false,
      output: '',
      error: `Access is denied.`,
      type: 'error',
    };
  },
  autocomplete: (partial, _, context) =>
    FileSystemUtils.getPathCompletions(context.fileSystem, context.currentDirectory, partial).filter(
      (path) => !path.endsWith('/')
    ), // Only files
};

/**
 * Set file attributes (attrib)
 */
export const attribCommand: CommandDefinition = {
  name: 'attrib',
  aliases: [],
  description: 'Display or change file attributes',
  usage: 'attrib [+R | -R] [+A | -A] [+S | -S] [+H | -H] [filename]',
  execute: (args, context): CommandResult => {
    if (args.length === 0) {
      // Show attributes for current directory
      const items = FileSystemUtils.getDirectoryContents(context.fileSystem, context.currentDirectory);
      const lines = items.map((item) => {
        const attrs = item.isDirectory ? '    ' : 'A   ';
        return `${attrs} ${item.path}`;
      });

      return {
        success: true,
        output: lines.join('\n'),
        type: 'output',
      };
    }

    const filename = args[args.length - 1];
    const attributes = args.slice(0, -1);

    return {
      success: true,
      output: `Attributes ${attributes.join(' ')} set for ${filename}`,
      type: 'success',
    };
  },
};

/**
 * Display system version (ver)
 */
export const verCommand: CommandDefinition = {
  name: 'ver',
  aliases: [],
  description: 'Display system version',
  usage: 'ver',
  execute: (): CommandResult => ({
    success: true,
    output: 'Portfolio Desktop OS [Version 1.0.0]',
    type: 'output',
  }),
};

/**
 * Display or set system time (time)
 */
export const timeCommand: CommandDefinition = {
  name: 'time',
  aliases: [],
  description: 'Display or set system time',
  usage: 'time [new-time]',
  execute: (args): CommandResult => {
    if (args.length === 0) {
      const now = new Date();
      return {
        success: true,
        output: `The current time is: ${now.toLocaleTimeString()}`,
        type: 'output',
      };
    }

    return {
      success: true,
      output: `Time set to: ${args[0]}`,
      type: 'success',
    };
  },
};

/**
 * Find text in files (findstr)
 */
export const findstrCommand: CommandDefinition = {
  name: 'findstr',
  aliases: [],
  description: 'Search for text in files',
  usage: 'findstr [options] string [filename]',
  execute: (args, context): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'The syntax of the command is incorrect.',
        type: 'error',
      };
    }

    const [pattern] = args;
    const files = args.slice(1);

    if (files.length === 0) {
      return {
        success: true,
        output: `Searching for "${pattern}" in standard input...`,
        type: 'output',
      };
    }

    const results: string[] = [];

    for (const file of files) {
      const filePath = FileSystemUtils.resolvePath(context.currentDirectory, file);
      const content = FileSystemUtils.getFileContent(context.fileSystem, filePath);

      if (content) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(pattern)) {
            results.push(`${file}:${index + 1}:${line}`);
          }
        });
      }
    }

    return {
      success: true,
      output: results.length > 0 ? results.join('\n') : `String not found.`,
      type: 'output',
    };
  },
};

/**
 * Display network configuration (ipconfig)
 */
export const ipconfigCommand: CommandDefinition = {
  name: 'ipconfig',
  aliases: [],
  description: 'Display network configuration',
  usage: 'ipconfig [options]',
  execute: (args): CommandResult => {
    const showAll = args.includes('/all');

    if (showAll) {
      return {
        success: true,
        output: [
          'Windows IP Configuration',
          '',
          '   Host Name . . . . . . . . . . . . : portfolio-desktop',
          '   Primary Dns Suffix  . . . . . . . : ',
          '   Node Type . . . . . . . . . . . . : Hybrid',
          '   IP Routing Enabled. . . . . . . . : No',
          '   WINS Proxy Enabled. . . . . . . . : No',
          '',
          'Ethernet adapter Local Area Connection:',
          '',
          '   Connection-specific DNS Suffix  . : ',
          '   Description . . . . . . . . . . . : Intel(R) Ethernet Connection',
          '   Physical Address. . . . . . . . . : 00-1B-21-12-34-56',
          '   DHCP Enabled. . . . . . . . . . . : Yes',
          '   Autoconfiguration Enabled . . . . : Yes',
          '   IPv4 Address. . . . . . . . . . . : 192.168.1.100(Preferred)',
          '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
          '   Default Gateway . . . . . . . . . : 192.168.1.1',
          '   DHCP Server . . . . . . . . . . . : 192.168.1.1',
          '   DNS Servers . . . . . . . . . . . : 8.8.8.8',
          '                                       8.8.4.4',
        ].join('\n'),
        type: 'output',
      };
    }

    return {
      success: true,
      output: [
        'Windows IP Configuration',
        '',
        'Ethernet adapter Local Area Connection:',
        '',
        '   Connection-specific DNS Suffix  . : ',
        '   IPv4 Address. . . . . . . . . . . : 192.168.1.100',
        '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
        '   Default Gateway . . . . . . . . . : 192.168.1.1',
      ].join('\n'),
      type: 'output',
    };
  },
};

/**
 * DNS lookup (nslookup)
 */
export const nslookupCommand: CommandDefinition = {
  name: 'nslookup',
  aliases: [],
  description: 'Query DNS servers',
  usage: 'nslookup [hostname]',
  execute: async (args): Promise<CommandResult> => {
    if (args.length === 0) {
      return {
        success: true,
        output: ['Default Server:  dns.google', 'Address:  8.8.8.8', '', '>'].join('\n'),
        type: 'output',
      };
    }

    const [hostname] = args;

    // Simulate DNS lookup delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      output: ['Server:  dns.google', 'Address:  8.8.8.8', '', `Name:    ${hostname}`, 'Address:  93.184.216.34'].join(
        '\n'
      ),
      type: 'output',
    };
  },
};

export const windowsCommands: CommandDefinition[] = [
  dirCommand,
  cdWindowsCommand,
  mdCommand,
  rdCommand,
  delCommand,
  copyCommand,
  moveCommand,
  typeCommand,
  attribCommand,
  verCommand,
  timeCommand,
  findstrCommand,
  ipconfigCommand,
  nslookupCommand,
];
