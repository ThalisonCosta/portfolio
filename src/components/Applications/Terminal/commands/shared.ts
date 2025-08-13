import type { CommandDefinition, CommandResult, NetworkResult, ProcessInfo, SystemInfo } from '../types';
import { AnsiColorizer } from '../utils/colors';

/**
 * Simulate network delay for realistic command behavior
 */
const simulateDelay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Simulate ping command
 */
const simulatePing = async (host: string): Promise<NetworkResult> => {
  await simulateDelay(Math.random() * 500 + 200);

  const success = Math.random() > 0.1; // 90% success rate
  const responseTime = Math.floor(Math.random() * 100) + 10;

  if (success) {
    return {
      success: true,
      data: `PING ${host}: 64 bytes from ${host}: icmp_seq=1 ttl=64 time=${responseTime} ms`,
      responseTime,
    };
  }
  return {
    success: false,
    data: `ping: cannot resolve ${host}: Unknown host`,
    responseTime: 0,
    error: 'Host unreachable',
  };
};

/**
 * Clear terminal command
 */
export const clearCommand: CommandDefinition = {
  name: 'clear',
  aliases: ['cls'],
  description: 'Clear the terminal screen',
  usage: 'clear',
  execute: (): CommandResult => ({
    success: true,
    output: '',
    clear: true,
    type: 'success',
  }),
};

/**
 * Exit terminal command
 */
export const exitCommand: CommandDefinition = {
  name: 'exit',
  aliases: ['quit'],
  description: 'Exit the terminal',
  usage: 'exit',
  execute: (): CommandResult => ({
    success: true,
    output: 'Goodbye!',
    exit: true,
    type: 'info',
  }),
};

/**
 * Help command
 */
export const helpCommand: CommandDefinition = {
  name: 'help',
  aliases: ['?'],
  description: 'Display available commands',
  usage: 'help [command]',
  execute: (args, context): CommandResult => {
    const isWindows = context.osType === 'windows';

    if (args.length > 0) {
      // Help for specific command
      const commandHelp = getCommandHelp(args[0], isWindows);
      return {
        success: true,
        output: commandHelp,
        type: 'info',
      };
    }

    // General help
    const commands = isWindows ? getWindowsCommands() : getLinuxCommands();
    const output = [
      AnsiColorizer.colorize('Available Commands:', 'info'),
      '',
      ...commands.map((cmd) => `  ${AnsiColorizer.colorize(cmd.name.padEnd(12), 'success')} ${cmd.description}`),
      '',
      'Type "help <command>" for more information about a specific command.',
      `Current OS: ${AnsiColorizer.colorize(isWindows ? 'Windows' : 'Linux', 'warning')}`,
    ].join('\n');

    return {
      success: true,
      output,
      type: 'info',
    };
  },
};

/**
 * Echo command
 */
export const echoCommand: CommandDefinition = {
  name: 'echo',
  aliases: [],
  description: 'Display text',
  usage: 'echo [text...]',
  execute: (args): CommandResult => ({
    success: true,
    output: args.join(' '),
    type: 'output',
  }),
};

/**
 * Date command
 */
export const dateCommand: CommandDefinition = {
  name: 'date',
  aliases: [],
  description: 'Display current date and time',
  usage: 'date',
  execute: (): CommandResult => ({
    success: true,
    output: new Date().toString(),
    type: 'output',
  }),
};

/**
 * Whoami command
 */
export const whoamiCommand: CommandDefinition = {
  name: 'whoami',
  aliases: [],
  description: 'Display current username',
  usage: 'whoami',
  execute: (_, context): CommandResult => ({
    success: true,
    output: context.username,
    type: 'output',
  }),
};

/**
 * Ping command
 */
export const pingCommand: CommandDefinition = {
  name: 'ping',
  aliases: [],
  description: 'Send ICMP echo requests to a host',
  usage: 'ping <host>',
  execute: async (args): Promise<CommandResult> => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'ping: missing host argument',
        type: 'error',
      };
    }

    const host = args[0];
    const results: string[] = [];

    results.push(`PING ${host} (${host}): 56 data bytes`);

    for (let i = 1; i <= 4; i++) {
      const result = await simulatePing(host);
      if (result.success) {
        results.push(result.data.replace('icmp_seq=1', `icmp_seq=${i}`));
      } else {
        results.push(result.data);
        break;
      }
    }

    return {
      success: true,
      output: results.join('\n'),
      type: 'output',
    };
  },
};

/**
 * Curl command (simplified)
 */
export const curlCommand: CommandDefinition = {
  name: 'curl',
  aliases: [],
  description: 'Transfer data from servers',
  usage: 'curl <url>',
  execute: async (args): Promise<CommandResult> => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'curl: no URL specified',
        type: 'error',
      };
    }

    const url = args[0];
    await simulateDelay(1000);

    // Simulate HTTP response
    const success = Math.random() > 0.2; // 80% success rate

    if (success) {
      return {
        success: true,
        output: `HTTP/1.1 200 OK\nContent-Type: text/html\n\n<!DOCTYPE html>\n<html>\n<head><title>Example</title></head>\n<body><h1>Hello World!</h1></body>\n</html>`,
        type: 'output',
      };
    }
    return {
      success: false,
      output: '',
      error: `curl: (6) Could not resolve host: ${url}`,
      type: 'error',
    };
  },
};

/**
 * PS command (process list)
 */
export const psCommand: CommandDefinition = {
  name: 'ps',
  aliases: [],
  description: 'Display running processes',
  usage: 'ps [options]',
  execute: (): CommandResult => {
    const processes: ProcessInfo[] = [
      { pid: 1, name: 'init', cpu: 0.0, memory: '1.2M', state: 'S', startTime: '00:00' },
      { pid: 123, name: 'terminal', cpu: 2.5, memory: '15.4M', state: 'R', startTime: '10:30' },
      { pid: 456, name: 'browser', cpu: 5.2, memory: '128.7M', state: 'S', startTime: '09:15' },
      { pid: 789, name: 'editor', cpu: 1.8, memory: '45.3M', state: 'S', startTime: '11:20' },
    ];

    const header = 'PID     NAME        CPU%   MEM     STATE  START';
    const lines = processes.map(
      (p) =>
        `${p.pid.toString().padEnd(8)}${p.name.padEnd(12)}${p.cpu.toFixed(1).padEnd(7)}${p.memory.padEnd(8)}${p.state.padEnd(7)}${p.startTime}`
    );

    return {
      success: true,
      output: [header, ...lines].join('\n'),
      type: 'output',
    };
  },
};

/**
 * Uptime command
 */
export const uptimeCommand: CommandDefinition = {
  name: 'uptime',
  aliases: [],
  description: 'Show system uptime and load',
  usage: 'uptime',
  execute: (): CommandResult => {
    const uptime = '2 days, 14:32';
    const load = '0.15, 0.23, 0.18';
    const users = 1;

    return {
      success: true,
      output: `${new Date().toLocaleTimeString()} up ${uptime}, ${users} user, load average: ${load}`,
      type: 'output',
    };
  },
};

/**
 * Uname command (system information)
 */
export const unameCommand: CommandDefinition = {
  name: 'uname',
  aliases: [],
  description: 'Display system information',
  usage: 'uname [-a]',
  execute: (args): CommandResult => {
    const sysInfo: SystemInfo = {
      os: 'Portfolio-OS',
      version: '1.0.0',
      arch: 'x86_64',
      uptime: '2 days',
      user: 'portfolio',
      hostname: 'desktop',
      datetime: new Date().toISOString(),
    };

    if (args.includes('-a') || args.includes('--all')) {
      return {
        success: true,
        output: `${sysInfo.os} ${sysInfo.hostname} ${sysInfo.version} ${sysInfo.arch}`,
        type: 'output',
      };
    }

    return {
      success: true,
      output: sysInfo.os,
      type: 'output',
    };
  },
};

// Helper functions
function getCommandHelp(commandName: string, _: boolean): string {
  const allCommands = [...getLinuxCommands(), ...getWindowsCommands()];
  const command = allCommands.find((cmd) => cmd.name === commandName || cmd.aliases.includes(commandName));

  if (!command) {
    return `Command '${commandName}' not found.`;
  }

  return [
    AnsiColorizer.colorize(`${command.name}`, 'success'),
    `Description: ${command.description}`,
    `Usage: ${command.usage}`,
    command.aliases.length > 0 ? `Aliases: ${command.aliases.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function getLinuxCommands(): CommandDefinition[] {
  return [
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
  ];
}

function getWindowsCommands(): CommandDefinition[] {
  return [clearCommand, exitCommand, helpCommand, echoCommand, dateCommand, whoamiCommand, pingCommand];
}
