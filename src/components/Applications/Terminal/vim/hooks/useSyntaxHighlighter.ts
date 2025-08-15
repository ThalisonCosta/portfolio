import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { HighlightedLine, SyntaxToken } from '../types';
import { syntaxTokenPool } from '../../utils/objectPools';

/**
 * TypeScript/JavaScript keywords
 */
const KEYWORDS = new Set([
  'abstract',
  'any',
  'as',
  'async',
  'await',
  'boolean',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'constructor',
  'continue',
  'debugger',
  'declare',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'from',
  'function',
  'get',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'is',
  'keyof',
  'let',
  'module',
  'namespace',
  'never',
  'new',
  'null',
  'number',
  'object',
  'of',
  'package',
  'private',
  'protected',
  'public',
  'readonly',
  'require',
  'return',
  'set',
  'static',
  'string',
  'super',
  'switch',
  'symbol',
  'this',
  'throw',
  'true',
  'try',
  'type',
  'typeof',
  'undefined',
  'union',
  'unique',
  'unknown',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);

/**
 * TypeScript/JavaScript types
 */
const TYPES = new Set([
  'Array',
  'Boolean',
  'Date',
  'Error',
  'Function',
  'Map',
  'Number',
  'Object',
  'Promise',
  'RegExp',
  'Set',
  'String',
  'Symbol',
  'WeakMap',
  'WeakSet',
  'React',
  'Component',
  'Element',
  'HTMLElement',
  'Node',
  'NodeList',
  'EventTarget',
]);

/**
 * Operators and punctuation
 */
const OPERATORS = new Set([
  '+',
  '-',
  '*',
  '/',
  '%',
  '**',
  '++',
  '--',
  '=',
  '+=',
  '-=',
  '*=',
  '/=',
  '%=',
  '==',
  '===',
  '!=',
  '!==',
  '<',
  '>',
  '<=',
  '>=',
  '&&',
  '||',
  '!',
  '&',
  '|',
  '^',
  '~',
  '<<',
  '>>',
  '>>>',
  '?',
  ':',
  '=>',
  '...',
  '??',
  '?.',
  '??=',
]);

/**
 * Get file language from filename
 */
function getLanguage(filename?: string): string {
  if (!filename) return 'text';

  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'md':
      return 'markdown';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'html':
    case 'htm':
      return 'html';
    default:
      return 'text';
  }
}

/**
 * Helper function to create token from pool
 */
function createToken(start: number, end: number, type: SyntaxToken['type']): SyntaxToken {
  const token = syntaxTokenPool.acquire();
  token.start = start;
  token.end = end;
  token.type = type;
  return token;
}

/**
 * Tokenize a line of TypeScript/JavaScript code using object pooling
 */
function tokenizeTypeScript(line: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // String literals
    if (char === '"' || char === "'" || char === '`') {
      const start = i;
      const quote = char;
      i++; // Skip opening quote

      while (i < line.length && line[i] !== quote) {
        if (line[i] === '\\') i++; // Skip escaped character
        i++;
      }
      if (i < line.length) i++; // Skip closing quote

      tokens.push(createToken(start, i, 'string'));
      continue;
    }

    // Single-line comments
    if (char === '/' && line[i + 1] === '/') {
      tokens.push(createToken(i, line.length, 'comment'));
      break;
    }

    // Multi-line comment start
    if (char === '/' && line[i + 1] === '*') {
      const start = i;
      i += 2;
      while (i < line.length - 1 && !(line[i] === '*' && line[i + 1] === '/')) {
        i++;
      }
      if (i < line.length - 1) i += 2; // Skip closing */
      tokens.push(createToken(start, i, 'comment'));
      continue;
    }

    // Numbers
    if (/\d/.test(char)) {
      const start = i;
      while (i < line.length && /[\d.]/.test(line[i])) {
        i++;
      }
      tokens.push(createToken(start, i, 'number'));
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(char)) {
      const start = i;
      while (i < line.length && /[a-zA-Z0-9_$]/.test(line[i])) {
        i++;
      }

      const word = line.slice(start, i);
      let type: SyntaxToken['type'] = 'identifier';

      if (KEYWORDS.has(word)) {
        type = 'keyword';
      } else if (TYPES.has(word)) {
        type = 'type';
      }

      tokens.push(createToken(start, i, type));
      continue;
    }

    // Operators
    if (OPERATORS.has(char) || OPERATORS.has(line.slice(i, i + 2)) || OPERATORS.has(line.slice(i, i + 3))) {
      const start = i;

      // Check for multi-character operators
      if (OPERATORS.has(line.slice(i, i + 3))) {
        i += 3;
      } else if (OPERATORS.has(line.slice(i, i + 2))) {
        i += 2;
      } else {
        i++;
      }

      tokens.push(createToken(start, i, 'operator'));
      continue;
    }

    // Single character (punctuation, etc.)
    i++;
  }

  return tokens;
}

/**
 * Tokenize a line of Markdown
 */
function tokenizeMarkdown(line: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];

  // Headers
  if (line.startsWith('#')) {
    tokens.push(createToken(0, line.length, 'keyword'));
    return tokens;
  }

  // Code blocks
  if (line.startsWith('```')) {
    tokens.push(createToken(0, line.length, 'string'));
    return tokens;
  }

  // Inline code
  let i = 0;
  while (i < line.length) {
    if (line[i] === '`') {
      const start = i;
      i++;
      while (i < line.length && line[i] !== '`') {
        i++;
      }
      if (i < line.length) i++;
      tokens.push(createToken(start, i, 'string'));
    } else {
      i++;
    }
  }

  return tokens;
}

/**
 * Tokenize a line of JSON
 */
function tokenizeJson(line: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // String literals (including keys)
    if (char === '"') {
      const start = i;
      i++; // Skip opening quote

      while (i < line.length && line[i] !== '"') {
        if (line[i] === '\\') i++; // Skip escaped character
        i++;
      }
      if (i < line.length) i++; // Skip closing quote

      tokens.push(createToken(start, i, 'string'));
      continue;
    }

    // Numbers
    if (/\d/.test(char) || char === '-') {
      const start = i;
      if (char === '-') i++;
      while (i < line.length && /[\d.]/.test(line[i])) {
        i++;
      }
      tokens.push(createToken(start, i, 'number'));
      continue;
    }

    // Keywords (true, false, null)
    if (/[a-z]/.test(char)) {
      const start = i;
      while (i < line.length && /[a-z]/.test(line[i])) {
        i++;
      }

      const word = line.slice(start, i);
      if (['true', 'false', 'null'].includes(word)) {
        tokens.push(createToken(start, i, 'keyword'));
      }
      continue;
    }

    i++;
  }

  return tokens;
}

/**
 * Custom hook for syntax highlighting with caching and debouncing
 */
export function useSyntaxHighlighter() {
  // Cache for highlighted lines to avoid re-computation with strict limits
  const cacheRef = useRef<Map<string, HighlightedLine>>(new Map());
  const maxCacheSize = 500; // Reduced limit to prevent memory leaks

  // Memoize language detection
  const languageCache = useMemo(() => new Map<string, string>(), []);

  const getLanguageFromCache = useCallback(
    (filename?: string): string => {
      if (!filename) return 'text';

      if (languageCache.has(filename)) {
        return languageCache.get(filename)!;
      }

      const language = getLanguage(filename);
      languageCache.set(filename, language);
      return language;
    },
    [languageCache]
  );

  /**
   * Highlight a single line based on file type with caching
   * Memoized to prevent constant recreation that causes infinite re-renders
   */
  const highlightLine = useCallback(
    (line: string, filename?: string): HighlightedLine => {
      // Create cache key
      const cacheKey = `${filename || 'text'}:${line}`;

      // Check cache first
      if (cacheRef.current.has(cacheKey)) {
        return cacheRef.current.get(cacheKey)!;
      }

      // Performance guards: skip highlighting for very long lines or files
      if (line.length > 5000) {
        // Reduced from 10000 for better performance
        const result = { text: line, tokens: [] };
        return result; // Don't cache extremely long lines
      }

      // Emergency cache clearing if cache grows too large
      if (cacheRef.current.size > maxCacheSize * 1.2) {
        console.warn('Vim Syntax: Emergency cache clear, size:', cacheRef.current.size);
        cacheRef.current.clear();
        languageCache.clear();
      }

      const language = getLanguageFromCache(filename);
      let tokens: SyntaxToken[] = [];

      try {
        switch (language) {
          case 'typescript':
          case 'javascript':
            tokens = tokenizeTypeScript(line);
            break;
          case 'markdown':
            tokens = tokenizeMarkdown(line);
            break;
          case 'json':
            tokens = tokenizeJson(line);
            break;
          default:
            // No highlighting for plain text
            break;
        }
      } catch (error) {
        console.warn('Syntax highlighting error:', error);
        tokens = []; // Fallback to no highlighting
      }

      const result = { text: line, tokens };

      // Cache the result with strict size limits
      if (cacheRef.current.size >= maxCacheSize) {
        // Use LRU-style cache eviction - clear old entries more aggressively
        const keysToDelete = Array.from(cacheRef.current.keys()).slice(0, Math.floor(maxCacheSize * 0.7));
        keysToDelete.forEach((key) => cacheRef.current.delete(key));
        console.log(`Vim Syntax: Aggressive cache cleanup, removed ${keysToDelete.length} entries`);
      }

      cacheRef.current.set(cacheKey, result);
      return result;
    },
    [getLanguageFromCache]
  );

  // Clear cache method for memory management
  const clearCache = useCallback(() => {
    console.log(`Vim Syntax: Clearing cache with ${cacheRef.current.size} entries`);

    // Return tokens from cache to pool before clearing
    cacheRef.current.forEach((line) => {
      line.tokens.forEach((token) => syntaxTokenPool.release(token));
    });

    cacheRef.current.clear();
    languageCache.clear();
  }, [languageCache]);

  // Get cache statistics for debugging
  const getCacheStats = useCallback(
    () => ({
      syntaxCacheSize: cacheRef.current.size,
      languageCacheSize: languageCache.size,
      maxCacheSize,
    }),
    [languageCache]
  );

  // Aggressive periodic cache cleanup to prevent memory leaks
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const currentSize = cacheRef.current.size;
      const languageSize = languageCache.size;

      // More aggressive cleanup thresholds
      if (currentSize > maxCacheSize * 0.6) {
        // Clear more entries more frequently
        const entries = Array.from(cacheRef.current.entries());
        const keepCount = Math.floor(maxCacheSize * 0.3); // Keep only 30% instead of 50%
        cacheRef.current.clear();

        // Keep most recent entries (LRU style)
        entries.slice(-keepCount).forEach(([key, value]) => {
          cacheRef.current.set(key, value);
        });

        console.log(`Vim Syntax: Periodic cleanup, ${currentSize} -> ${keepCount} entries`);
      }

      // Also clean language cache if it gets too large
      if (languageSize > 50) {
        languageCache.clear();
        console.log(`Vim Syntax: Cleared language cache (${languageSize} entries)`);
      }
    }, 30000); // Check every 30 seconds instead of 60

    return () => clearInterval(cleanupInterval);
  }, [languageCache]);

  return { highlightLine, clearCache, getCacheStats };
}
