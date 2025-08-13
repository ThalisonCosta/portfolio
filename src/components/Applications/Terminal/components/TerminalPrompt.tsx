import React, { memo } from 'react';
import type { TerminalTheme, OSType } from '../types';

/**
 * Props for TerminalPrompt component
 */
interface TerminalPromptProps {
  /** Current working directory */
  currentDirectory: string;
  /** Operating system type */
  osType: OSType;
  /** Username */
  username: string;
  /** Hostname */
  hostname: string;
  /** Terminal theme */
  theme: TerminalTheme;
  /** Whether the terminal is executing a command */
  isExecuting?: boolean;
}

/**
 * Terminal prompt component that shows the command prompt
 * Displays different formats for Linux vs Windows
 */
export const TerminalPrompt: React.FC<TerminalPromptProps> = memo(
  ({ currentDirectory, osType, username, hostname, theme, isExecuting = false }) => {
    /**
     * Generate the prompt string based on OS type
     */
    const getPromptString = (): React.ReactNode => {
      if (osType === 'windows') {
        const windowsPath = `C:\\${currentDirectory.replace(/\//g, '\\')}`;
        return <span style={{ color: theme.prompt }}>{windowsPath}&gt; </span>;
      }
      // Linux/Unix style prompt with colors
      const displayDir = currentDirectory === '/Desktop' ? '~' : currentDirectory;

      return (
        <>
          <span style={{ color: theme.success, fontWeight: 'bold' }}>{username}</span>
          <span style={{ color: theme.foreground }}>@</span>
          <span style={{ color: theme.directory, fontWeight: 'bold' }}>{hostname}</span>
          <span style={{ color: theme.foreground }}>:</span>
          <span style={{ color: theme.directory, fontWeight: 'bold' }}>{displayDir}</span>
          <span style={{ color: theme.prompt, fontWeight: 'bold' }}>$ </span>
        </>
      );
    };

    const promptStyle: React.CSSProperties = {
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
      fontSize: '14px',
      lineHeight: '1.4',
      display: 'inline-flex',
      alignItems: 'center',
      userSelect: 'none',
      opacity: isExecuting ? 0.7 : 1,
    };

    return (
      <span style={promptStyle} className="terminal-prompt">
        {getPromptString()}
      </span>
    );
  }
);

TerminalPrompt.displayName = 'TerminalPrompt';
