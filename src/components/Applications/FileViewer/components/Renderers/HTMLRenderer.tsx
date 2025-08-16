import React from 'react';

/**
 * Props for HTMLRenderer component
 */
interface HTMLRendererProps {
  content: string;
  theme: 'light' | 'dark';
}

/**
 * Renders HTML files as rendered webpages
 */
export const HTMLRenderer: React.FC<HTMLRendererProps> = ({ content, theme }) => {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    border: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
  };

  const iframeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: '#ffffff',
  };

  // Create a blob URL for the HTML content
  const htmlBlob = new Blob([content], { type: 'text/html' });
  const htmlUrl = URL.createObjectURL(htmlBlob);

  // Clean up blob URL when component unmounts
  React.useEffect(
    () => () => {
      URL.revokeObjectURL(htmlUrl);
    },
    [htmlUrl]
  );

  return (
    <div style={containerStyle}>
      <iframe src={htmlUrl} style={iframeStyle} title="HTML Content" sandbox="allow-same-origin allow-scripts" />
    </div>
  );
};

export default HTMLRenderer;
