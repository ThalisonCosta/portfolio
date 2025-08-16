import React from 'react';

/**
 * Props for TextRenderer component
 */
interface TextRendererProps {
  content: string;
  theme: 'light' | 'dark';
}

/**
 * Renders plain text files with proper formatting
 */
export const TextRenderer: React.FC<TextRendererProps> = ({ content, theme }) => {
  const textStyle: React.CSSProperties = {
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    padding: '16px',
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    color: theme === 'dark' ? '#f8f8f2' : '#2f3337',
    border: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
    borderRadius: '4px',
    minHeight: 'calc(100vh - 100px)',
    overflow: 'auto',
  };

  return <div style={textStyle}>{content || 'Empty file'}</div>;
};

export default TextRenderer;
