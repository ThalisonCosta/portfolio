import React from 'react';

/**
 * Props for ViewerToolbar component
 */
interface ViewerToolbarProps {
  fileName: string;
  fileType: string;
  zoom: number;
  theme: 'light' | 'dark';
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onThemeToggle: () => void;
  fileSize: number;
}

/**
 * Format file size in human readable format
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get file type display name
 */
const getFileTypeDisplayName = (fileType: string): string => {
  switch (fileType) {
    case 'html':
      return 'HTML';
    case 'markdown':
      return 'Markdown';
    case 'text':
      return 'Text';
    default:
      return fileType.toUpperCase();
  }
};

/**
 * Toolbar component for the file viewer
 */
export const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  fileName,
  fileType,
  zoom,
  theme,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onThemeToggle,
  fileSize,
}) => {
  const toolbarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
    borderBottom: `1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'}`,
    fontSize: '12px',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
    color: theme === 'dark' ? '#cccccc' : '#666666',
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const buttonStyle: React.CSSProperties = {
    fontSize: '11px',
    fontFamily: 'inherit',
    backgroundColor: 'transparent',
    color: 'inherit',
    border: '1px solid transparent',
    outline: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '2px',
    transition: 'all 0.1s ease',
  };

  const zoomStyle: React.CSSProperties = {
    ...buttonStyle,
    border: `1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'}`,
    minWidth: '40px',
    textAlign: 'center',
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean) => {
    if (isEnter) {
      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#404040' : '#e0e0e0';
    } else {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  return (
    <div style={toolbarStyle}>
      {/* Left section - File info */}
      <div style={sectionStyle}>
        <span>{fileName}</span>
        <span>•</span>
        <span>{getFileTypeDisplayName(fileType)}</span>
        <span>•</span>
        <span>{formatFileSize(fileSize)}</span>
      </div>

      {/* Right section - Controls */}
      <div style={sectionStyle}>
        <span>Zoom:</span>
        <button
          style={buttonStyle}
          onClick={onZoomOut}
          onMouseEnter={(e) => handleButtonHover(e, true)}
          onMouseLeave={(e) => handleButtonHover(e, false)}
          title="Zoom Out"
        >
          -
        </button>
        <span style={zoomStyle}>{zoom}%</span>
        <button
          style={buttonStyle}
          onClick={onZoomIn}
          onMouseEnter={(e) => handleButtonHover(e, true)}
          onMouseLeave={(e) => handleButtonHover(e, false)}
          title="Zoom In"
        >
          +
        </button>
        <button
          style={buttonStyle}
          onClick={onZoomReset}
          onMouseEnter={(e) => handleButtonHover(e, true)}
          onMouseLeave={(e) => handleButtonHover(e, false)}
          title="Reset Zoom"
        >
          Reset
        </button>
        <span>•</span>
        <button
          style={buttonStyle}
          onClick={onThemeToggle}
          onMouseEnter={(e) => handleButtonHover(e, true)}
          onMouseLeave={(e) => handleButtonHover(e, false)}
          title="Toggle Theme"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  );
};

export default ViewerToolbar;
