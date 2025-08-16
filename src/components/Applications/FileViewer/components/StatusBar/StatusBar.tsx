import React from 'react';
import { StatusBarInfo, DocumentFormat, EditorSettings } from '../../types/textEditor.types';

/**
 * Props for StatusBar component
 */
interface StatusBarProps {
  statusInfo: StatusBarInfo;
  settings: EditorSettings;
  onFormatChange?: (format: DocumentFormat) => void;
  onSettingsClick?: () => void;
  className?: string;
}

/**
 * Status bar component showing document information and editor settings
 */
export const StatusBar: React.FC<StatusBarProps> = ({
  statusInfo,
  settings,
  onFormatChange,
  onSettingsClick,
  className = '',
}) => {
  /**
   * Handle format change dropdown
   */
  const handleFormatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = event.target.value as DocumentFormat;
    if (onFormatChange) {
      onFormatChange(newFormat);
    }
  };

  const statusBarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 12px',
    fontSize: '12px',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
    backgroundColor: settings.theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
    color: settings.theme === 'dark' ? '#cccccc' : '#666666',
    borderTop: `1px solid ${settings.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
    height: '28px',
    userSelect: 'none',
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const selectStyle: React.CSSProperties = {
    fontSize: '11px',
    fontFamily: 'inherit',
    backgroundColor: 'transparent',
    color: 'inherit',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
  };

  const buttonStyle: React.CSSProperties = {
    fontSize: '11px',
    fontFamily: 'inherit',
    backgroundColor: 'transparent',
    color: 'inherit',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: '2px',
    transition: 'background-color 0.1s ease',
  };

  const dirtyIndicatorStyle: React.CSSProperties = {
    color: settings.theme === 'dark' ? '#ff6b6b' : '#e74c3c',
    fontWeight: 'bold',
  };

  return (
    <div className={`text-editor-status-bar ${className}`} style={statusBarStyle}>
      {/* Left section - Position and document info */}
      <div style={sectionStyle}>
        <div style={itemStyle}>
          <span>
            Ln {statusInfo.line + 1}, Col {statusInfo.column + 1}
          </span>
        </div>

        <div style={itemStyle}>
          <span>{statusInfo.totalLines} lines</span>
        </div>

        <div style={itemStyle}>
          <span>{statusInfo.wordCount} words</span>
        </div>

        <div style={itemStyle}>
          <span>{statusInfo.characterCount} chars</span>
        </div>

        {statusInfo.isDirty && (
          <div style={dirtyIndicatorStyle}>
            <span>●</span>
          </div>
        )}
      </div>

      {/* Right section - File info and settings */}
      <div style={sectionStyle}>
        <div style={itemStyle}>
          <span>{statusInfo.filename}</span>
        </div>

        <div style={itemStyle}>
          <select
            value={statusInfo.format}
            onChange={handleFormatChange}
            style={selectStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = settings.theme === 'dark' ? '#404040' : '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <option value={DocumentFormat.PLAIN_TEXT}>Plain Text</option>
            <option value={DocumentFormat.MARKDOWN}>Markdown</option>
            <option value={DocumentFormat.HTML}>HTML</option>
          </select>
        </div>

        <div style={itemStyle}>
          <span>UTF-8</span>
        </div>

        <div style={itemStyle}>
          <span>{settings.theme === 'dark' ? '🌙' : '☀️'}</span>
        </div>

        {onSettingsClick && (
          <button
            style={buttonStyle}
            onClick={onSettingsClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = settings.theme === 'dark' ? '#404040' : '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Editor Settings"
          >
            ⚙️
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
