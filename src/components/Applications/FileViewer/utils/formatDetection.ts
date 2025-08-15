import { DocumentFormat } from '../types/textEditor.types';

/**
 * Format detection utilities for the text editor
 */

/**
 * HTML patterns for detection
 */
const HTML_PATTERNS = [
  /<!DOCTYPE\s+html/i,
  /<html[^>]*>/i,
  /<head[^>]*>/i,
  /<body[^>]*>/i,
  /<title[^>]*>/i,
  /<meta[^>]*>/i,
  /<div[^>]*>/i,
  /<span[^>]*>/i,
  /<p[^>]*>/i,
  /<h[1-6][^>]*>/i,
  /<a[^>]*href/i,
  /<img[^>]*src/i,
  /<script[^>]*>/i,
  /<style[^>]*>/i,
  /<link[^>]*>/i,
];

/**
 * Markdown patterns for detection
 */
const MARKDOWN_PATTERNS = [
  /^#{1,6}\s+/m,           // Headers
  /^\*\s+/m,               // Unordered list
  /^\d+\.\s+/m,            // Ordered list
  /\*\*[^*]+\*\*/,         // Bold
  /\*[^*]+\*/,             // Italic
  /`[^`]+`/,               // Inline code
  /```[\s\S]*?```/,        // Code blocks
  /^>\s+/m,               // Blockquotes
  /\[([^\]]+)\]\(([^)]+)\)/, // Links
  /!\[([^\]]*)\]\(([^)]+)\)/, // Images
  /^-{3,}$/m,             // Horizontal rule
  /^={3,}$/m,             // Horizontal rule alternative
  /\|.+\|/,                // Tables
];

/**
 * Auto-detects document format based on content analysis
 */
export const autoDetectFormat = (content: string): DocumentFormat => {
  if (!content || content.trim().length === 0) {
    return DocumentFormat.PLAIN_TEXT;
  }

  const htmlScore = calculateHTMLScore(content);
  const markdownScore = calculateMarkdownScore(content);

  // If HTML score is significantly higher, it's likely HTML
  if (htmlScore > markdownScore && htmlScore > 2) {
    return DocumentFormat.HTML;
  }

  // If Markdown score is higher, it's likely Markdown
  if (markdownScore > htmlScore && markdownScore > 1) {
    return DocumentFormat.MARKDOWN;
  }

  // Default to plain text if no clear winner
  return DocumentFormat.PLAIN_TEXT;
};

/**
 * Calculates HTML likelihood score
 */
const calculateHTMLScore = (content: string): number => {
  let score = 0;

  // Check for HTML patterns
  for (const pattern of HTML_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      score += matches.length;
    }
  }

  // Bonus for DOCTYPE declaration
  if (content.includes('<!DOCTYPE')) {
    score += 5;
  }

  // Bonus for common HTML structure
  if (content.includes('<html>') && content.includes('</html>')) {
    score += 3;
  }

  // Check tag balance (basic)
  const openTags = (content.match(/<[a-zA-Z][^>]*>/g) || []).length;
  const closeTags = (content.match(/<\/[a-zA-Z][^>]*>/g) || []).length;
  
  if (openTags > 0 && Math.abs(openTags - closeTags) <= 3) {
    score += 2;
  }

  return score;
};

/**
 * Calculates Markdown likelihood score
 */
const calculateMarkdownScore = (content: string): number => {
  let score = 0;

  // Check for Markdown patterns
  for (const pattern of MARKDOWN_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      score += matches.length;
    }
  }

  // Bonus for common Markdown combinations
  if (content.includes('**') && content.includes('*')) {
    score += 1;
  }

  if (content.includes('```') && content.includes('`')) {
    score += 2;
  }

  if (content.includes('[') && content.includes('](') && content.includes(')')) {
    score += 2;
  }

  return score;
};

/**
 * Suggests format based on content analysis
 */
export const suggestFormat = (content: string): {
  suggested: DocumentFormat;
  confidence: number;
  reasons: string[];
} => {
  const htmlScore = calculateHTMLScore(content);
  const markdownScore = calculateMarkdownScore(content);
  const totalScore = htmlScore + markdownScore;
  
  const reasons: string[] = [];

  if (htmlScore > markdownScore) {
    const confidence = totalScore > 0 ? (htmlScore / totalScore) * 100 : 0;
    
    if (htmlScore > 0) {
      reasons.push(`HTML tags detected (${htmlScore} matches)`);
      if (content.includes('<!DOCTYPE')) reasons.push('DOCTYPE declaration found');
      if (content.includes('<html>')) reasons.push('HTML structure detected');
    }

    return {
      suggested: DocumentFormat.HTML,
      confidence: Math.min(confidence, 95),
      reasons,
    };
  }
  
  if (markdownScore > 0) {
    const confidence = totalScore > 0 ? (markdownScore / totalScore) * 100 : 0;
    
    reasons.push(`Markdown syntax detected (${markdownScore} matches)`);
    if (content.includes('#')) reasons.push('Markdown headers found');
    if (content.includes('**') || content.includes('*')) reasons.push('Markdown formatting found');
    if (content.includes('```')) reasons.push('Code blocks found');

    return {
      suggested: DocumentFormat.MARKDOWN,
      confidence: Math.min(confidence, 95),
      reasons,
    };
  }

  return {
    suggested: DocumentFormat.PLAIN_TEXT,
    confidence: 100,
    reasons: ['No specific formatting detected'],
  };
};

/**
 * Gets syntax highlighting class based on format
 */
export const getSyntaxClass = (format: DocumentFormat): string => {
  switch (format) {
    case DocumentFormat.HTML:
      return 'language-html';
    case DocumentFormat.MARKDOWN:
      return 'language-markdown';
    default:
      return 'language-text';
  }
};

/**
 * Gets file extension for format
 */
export const getFileExtension = (format: DocumentFormat): string => {
  switch (format) {
    case DocumentFormat.HTML:
      return '.html';
    case DocumentFormat.MARKDOWN:
      return '.md';
    default:
      return '.txt';
  }
};

/**
 * Gets MIME type for format
 */
export const getMimeType = (format: DocumentFormat): string => {
  switch (format) {
    case DocumentFormat.HTML:
      return 'text/html';
    case DocumentFormat.MARKDOWN:
      return 'text/markdown';
    default:
      return 'text/plain';
  }
};