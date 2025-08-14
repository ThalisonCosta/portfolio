import React from 'react';
import type { VimState, VimTheme } from '../types';

/**
 * Props for StatusBar component
 */
interface StatusBarProps {
  /** Current vim state */
  state: VimState;
  /** Vim theme for styling */
  theme: VimTheme;
  /** Current filename */
  filename?: string;
  /** Current working directory */
  currentDirectory: string;
}

/**
 * StatusBar - Enhanced status bar for vim editor
 * 
 * Shows current mode, filename, cursor position, and messages
 * Inspired by LunarVim's modern status bar design
 */
export const StatusBar: React.FC<StatusBarProps> = ({
  state,
  theme,
  filename,
}) => {
  // Get mode display text and color
  const getModeDisplay = () => {
    switch (state.mode) {
      case 'normal':
        return { text: 'NORMAL', color: theme.syntax.keyword };
      case 'insert':
        return { text: 'INSERT', color: theme.syntax.string };
      case 'visual':
        return { text: 'VISUAL', color: theme.syntax.number };
      case 'command':
        return { text: 'COMMAND', color: theme.syntax.type };
      default:
        return { text: 'NORMAL', color: theme.syntax.keyword };
    }
  };

  const modeDisplay = getModeDisplay();

  // Get file status indicators
  const getFileStatus = () => {
    let status = '';
    if (state.isModified) status += '[+] ';
    if (!filename) status += '[No Name] ';
    return status;
  };

  // Get cursor position display
  const getCursorPosition = () => {
    const line = state.cursor.line + 1; // 1-based for display
    const col = state.cursor.column + 1; // 1-based for display
    const totalLines = state.buffer.length;
    const percentage = Math.round((line / totalLines) * 100);
    return `${line},${col} ${percentage}%`;
  };

  // Get file type from filename
  const getFileType = () => {
    if (!filename) return '';
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'TypeScript';
      case 'js':
      case 'jsx':
        return 'JavaScript';
      case 'md':
        return 'Markdown';
      case 'json':
        return 'JSON';
      case 'txt':
        return 'Text';
      default:
        return ext ? ext.toUpperCase() : '';
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 12px',
    backgroundColor: theme.statusBackground,
    color: theme.statusForeground,
    fontSize: '12px',
    fontWeight: 'bold',
    borderTop: `1px solid ${theme.currentLineBackground}`,
    minHeight: '24px',
  };

  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const modeStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: '3px',
    backgroundColor: modeDisplay.color,
    color: theme.background,
    fontSize: '11px',
    fontWeight: 'bold',
  };

  const fileInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const messageStyle: React.CSSProperties = {
    color: state.messageType === 'error' ? theme.syntax.string : 
           state.messageType === 'warning' ? theme.syntax.number : theme.statusForeground,
    fontStyle: state.messageType === 'info' ? 'italic' : 'normal',
  };

  const fileTypeStyle: React.CSSProperties = {
    color: theme.syntax.comment,
    fontSize: '11px',
  };

  return (
    <>
      {/* Main status bar */}
      <div style={containerStyle} className="vim-status-bar">
        <div style={leftSectionStyle}>
          <div style={modeStyle}>
            {modeDisplay.text}
          </div>
          
          <div style={fileInfoStyle}>
            <span>{filename || '[No Name]'}</span>
            <span>{getFileStatus()}</span>
            {state.message && (
              <span style={messageStyle}>
                {state.message}
              </span>
            )}
          </div>
        </div>

        <div style={rightSectionStyle}>
          {getFileType() && (
            <span style={fileTypeStyle}>
              {getFileType()}
            </span>
          )}
          <span>{getCursorPosition()}</span>
          <span>{state.buffer.length} lines</span>
        </div>
      </div>

      {/* Command line (only visible in command mode) */}
      {state.mode === 'command' && (
        <div
          style={{
            padding: '2px 12px',
            backgroundColor: theme.background,
            color: theme.foreground,
            fontSize: '14px',
            borderTop: `1px solid ${theme.currentLineBackground}`,
            fontFamily: 'inherit',
          }}
          className="vim-command-line"
        >
          :{state.commandInput}
          <span 
            style={{
              animation: 'vim-blink 1s infinite',
              marginLeft: '1px',
            }}
          >
            █
          </span>
        </div>
      )}
    </>
  );
};