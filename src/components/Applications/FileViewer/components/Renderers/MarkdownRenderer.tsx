import React from 'react';

/**
 * Props for MarkdownRenderer component
 */
interface MarkdownRendererProps {
  content: string;
  theme: 'light' | 'dark';
}

/**
 * Simple markdown parser for basic formatting
 */
const parseMarkdown = (markdown: string): string => {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />');

  // Code blocks
  html = html.replace(
    /```([^`]+)```/g,
    '<pre style="background: #f4f4f4; padding: 12px; border-radius: 4px; overflow-x: auto;"><code>$1</code></pre>'
  );

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code style="background: #f4f4f4; padding: 2px 4px; border-radius: 2px;">$1</code>'
  );

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraphs
  html = `<p>${html}</p>`;

  // Lists
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Blockquotes
  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote style="border-left: 4px solid #ccc; margin: 0; padding-left: 16px; color: #666;">$1</blockquote>'
  );

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;" />');

  return html;
};

/**
 * Renders Markdown files with formatting
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, theme }) => {
  const markdownStyle: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '16px',
    lineHeight: '1.6',
    padding: '24px',
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    color: theme === 'dark' ? '#f8f8f2' : '#2f3337',
    border: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
    borderRadius: '4px',
    minHeight: 'calc(100vh - 100px)',
    overflow: 'auto',
  };

  const parsedHtml = parseMarkdown(content);

  return <div style={markdownStyle} dangerouslySetInnerHTML={{ __html: parsedHtml }} />;
};

export default MarkdownRenderer;
