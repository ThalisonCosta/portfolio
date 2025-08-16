import React, { useState } from 'react';
import { TextRenderer } from './Renderers/TextRenderer';
import { HTMLRenderer } from './Renderers/HTMLRenderer';
import { MarkdownRenderer } from './Renderers/MarkdownRenderer';
import { ViewerToolbar } from './ViewerToolbar/ViewerToolbar';

/**
 * Props for FileViewer component
 */
interface FileViewerProps {
  className?: string;
  fileName?: string;
  fileContent?: string;
  fileType?: string;
}

/**
 * Detect file type from filename
 */
const detectFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'html':
    case 'htm':
      return 'html';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'txt':
    default:
      return 'text';
  }
};

/**
 * Main file viewer component that renders different file types
 */
export const FileViewer: React.FC<FileViewerProps> = ({
  className = '',
  fileName = 'sample.txt',
  fileContent = 'Welcome to the File Viewer!\n\nThis is a sample text file. In a real implementation, this content would be loaded from the actual file system.',
  fileType,
}) => {
  const [zoom, setZoom] = useState(100);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const detectedType = fileType || detectFileType(fileName);

  /**
   * Handle zoom changes
   */
  const handleZoom = (newZoom: number) => {
    setZoom(Math.max(25, Math.min(200, newZoom)));
  };

  /**
   * Handle theme toggle
   */
  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const viewerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    color: theme === 'dark' ? '#f8f8f2' : '#2f3337',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top left',
    width: `${100 / (zoom / 100)}%`,
    height: `${100 / (zoom / 100)}%`,
  };

  /**
   * Render content based on file type
   */
  const renderContent = () => {
    switch (detectedType) {
      case 'html':
        return <HTMLRenderer content={fileContent} theme={theme} />;
      case 'markdown':
        return <MarkdownRenderer content={fileContent} theme={theme} />;
      case 'text':
      default:
        return <TextRenderer content={fileContent} theme={theme} />;
    }
  };

  return (
    <div className={`file-viewer ${className}`} style={viewerStyle}>
      {/* Viewer toolbar */}
      <ViewerToolbar
        fileName={fileName}
        fileType={detectedType}
        zoom={zoom}
        theme={theme}
        onZoomIn={() => handleZoom(zoom + 25)}
        onZoomOut={() => handleZoom(zoom - 25)}
        onZoomReset={() => handleZoom(100)}
        onThemeToggle={handleThemeToggle}
        fileSize={fileContent.length}
      />

      {/* File content */}
      <div style={contentStyle}>{renderContent()}</div>
    </div>
  );
};

export default FileViewer;
