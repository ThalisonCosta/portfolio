import { DocumentFormat, DocumentInfo } from '../types/textEditor.types';

/**
 * File utility functions for the text editor
 */

/**
 * Creates a new document with default values
 */
export const createNewDocument = (filename: string = 'Untitled'): DocumentInfo => ({
  filename,
  content: '',
  isDirty: false,
  format: DocumentFormat.PLAIN_TEXT,
  lastModified: new Date(),
});

/**
 * Detects document format based on filename or content
 */
export const detectDocumentFormat = (filename: string, content?: string): DocumentFormat => {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'html':
    case 'htm':
      return DocumentFormat.HTML;
    case 'md':
    case 'markdown':
      return DocumentFormat.MARKDOWN;
    default:
      if (content) {
        // Try to detect format from content
        if (content.includes('<html>') || content.includes('<!DOCTYPE') || /<[a-z][\s\S]*>/i.test(content)) {
          return DocumentFormat.HTML;
        }
        if (content.includes('#') || content.includes('**') || content.includes('*') || content.includes('`')) {
          return DocumentFormat.MARKDOWN;
        }
      }
      return DocumentFormat.PLAIN_TEXT;
  }
};

/**
 * Generates a default filename based on format
 */
export const generateDefaultFilename = (format: DocumentFormat): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');

  switch (format) {
    case DocumentFormat.HTML:
      return `document-${timestamp}.html`;
    case DocumentFormat.MARKDOWN:
      return `document-${timestamp}.md`;
    default:
      return `document-${timestamp}.txt`;
  }
};

/**
 * Validates if content is valid for the specified format
 */
export const validateContent = (content: string, format: DocumentFormat): { isValid: boolean; errors: string[] } => {
  switch (format) {
    case DocumentFormat.HTML:
      return validateHTML(content);
    case DocumentFormat.MARKDOWN:
      return validateMarkdown(content);
    default:
      return { isValid: true, errors: [] };
  }
};

/**
 * Basic HTML validation
 */
const validateHTML = (content: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check for basic HTML structure
  if (content.includes('<html>') && !content.includes('</html>')) {
    errors.push('Missing closing </html> tag');
  }

  if (content.includes('<head>') && !content.includes('</head>')) {
    errors.push('Missing closing </head> tag');
  }

  if (content.includes('<body>') && !content.includes('</body>')) {
    errors.push('Missing closing </body> tag');
  }

  // Check for unclosed tags (basic check)
  const openTags = content.match(/<[a-zA-Z][^>]*>/g) || [];
  const closeTags = content.match(/<\/[a-zA-Z][^>]*>/g) || [];

  if (openTags.length > closeTags.length + 5) {
    // Allow some self-closing tags
    errors.push('Potential unclosed HTML tags detected');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Basic Markdown validation
 */
const validateMarkdown = (content: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check for unmatched markdown syntax
  const boldMatches = (content.match(/\*\*/g) || []).length;
  if (boldMatches % 2 !== 0) {
    errors.push('Unmatched bold (**) syntax');
  }

  const italicMatches = (content.match(/(?<!\*)\*(?!\*)/g) || []).length;
  if (italicMatches % 2 !== 0) {
    errors.push('Unmatched italic (*) syntax');
  }

  const codeMatches = (content.match(/`/g) || []).length;
  if (codeMatches % 2 !== 0) {
    errors.push('Unmatched code (`) syntax');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Counts words in text content
 */
export const countWords = (content: string): number =>
  content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

/**
 * Counts characters in text content
 */
export const countCharacters = (content: string): number => content.length;

/**
 * Counts lines in text content
 */
export const countLines = (content: string): number => content.split('\n').length;

/**
 * Formats file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
