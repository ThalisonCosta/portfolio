import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDesktopStore, type FileSystemItem } from '../../stores/useDesktopStore';
import { TextRenderer } from './FileViewer/components/Renderers/TextRenderer';
import { HTMLRenderer } from './FileViewer/components/Renderers/HTMLRenderer';
import { MarkdownRenderer } from './FileViewer/components/Renderers/MarkdownRenderer';
import { FileOpenDialog } from './TextEditor/components/FileOpenDialog';
import { FileSaveDialog } from './TextEditor/components/FileSaveDialog';

/**
 * Props for TextEditorApp component
 */
interface TextEditorAppProps {
  /** Optional file path to open initially */
  filePath?: string;
}

/**
 * Detect file format from filename extension
 */
const detectFileFormat = (fileName: string): 'text' | 'html' | 'markdown' => {
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
 * TextEditor application component that provides dedicated text editing
 * with format-specific rendering:
 * - .txt files: Plain text editing
 * - .html files: HTML rendering with code view
 * - .md files: Markdown formatting with live preview
 */
export const TextEditorApp: React.FC<TextEditorAppProps> = ({ filePath }) => {
  const { fileSystem, updateFileContent, saveFileAs } = useDesktopStore();
  const [currentFileName, setCurrentFileName] = useState<string>('untitled.txt');
  const [currentContent, setCurrentContent] = useState<string>(
    'Welcome to TextEditor!\n\nCreate a new file or open an existing one to start editing.'
  );
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(filePath || null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showOpenDialog, setShowOpenDialog] = useState<boolean>(false);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initializedRef = useRef<boolean>(false);

  // Load file content when filePath is provided (only once)
  useEffect(() => {
    if (filePath && !initializedRef.current) {
      const findFileInSystem = (items: FileSystemItem[], path: string): FileSystemItem | null => {
        for (const item of items) {
          if (item.path === path && item.type === 'file') {
            return item;
          }
          if (item.children) {
            const found = findFileInSystem(item.children, path);
            if (found) return found;
          }
        }
        return null;
      };

      const file = findFileInSystem(fileSystem, filePath);
      if (file) {
        setCurrentFileName(file.name);
        setCurrentContent(file.content || '');
        setCurrentFilePath(filePath);
      }
      initializedRef.current = true;
    }
  }, [filePath, fileSystem]);

  /**
   * Handle creating a new file
   */
  const handleNewFile = useCallback(() => {
    setCurrentFileName('untitled.txt');
    setCurrentContent('');
    setIsDirty(false);
    setIsEditing(false);
  }, []);

  /**
   * Handle saving the current file
   */
  const handleSave = useCallback(() => {
    if (currentFilePath && isDirty) {
      updateFileContent(currentFilePath, currentContent);
      setIsDirty(false);
    } else if (!currentFilePath) {
      // If no current file, open Save As dialog
      setShowSaveDialog(true);
    }
  }, [currentFilePath, currentContent, isDirty, updateFileContent]);

  /**
   * Handle opening file dialog
   */
  const handleOpenFile = useCallback(() => {
    setShowOpenDialog(true);
  }, []);

  /**
   * Handle Save As dialog
   */
  const handleSaveAs = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  /**
   * Handle file selection from open dialog
   */
  const handleFileSelect = useCallback((filePath: string, fileName: string, content: string) => {
    setCurrentFileName(fileName);
    setCurrentContent(content);
    setCurrentFilePath(filePath);
    setIsDirty(false);
    setIsEditing(false);
  }, []);

  /**
   * Handle save from save dialog
   */
  const handleSaveFile = useCallback(
    (folderPath: string, fileName: string) => {
      const success = saveFileAs(folderPath, fileName, currentContent);
      if (success) {
        const newFilePath = `${folderPath}/${fileName}`;
        setCurrentFileName(fileName);
        setCurrentFilePath(newFilePath);
        setIsDirty(false);
      }
    },
    [saveFileAs, currentContent]
  );

  /**
   * Get current folder path for dialogs
   */
  const getCurrentFolderPath = useCallback((): string => {
    if (currentFilePath) {
      const parts = currentFilePath.split('/');
      parts.pop(); // Remove file name
      return parts.join('/') || '/Desktop';
    }
    return '/Desktop';
  }, [currentFilePath]);

  /**
   * Handle content changes from the textarea
   */
  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setCurrentContent(newContent);
    setIsDirty(true);
  }, []);

  /**
   * Toggle between editing and preview mode
   */
  const toggleEditMode = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);

  /**
   * Toggle theme
   */
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            handleNewFile();
            break;
          case 'o':
            e.preventDefault();
            handleOpenFile();
            break;
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              handleSaveAs();
            } else {
              handleSave();
            }
            break;
          default:
            // No action for other keys
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNewFile, handleOpenFile, handleSave, handleSaveAs]);

  const fileFormat = detectFileFormat(currentFileName);
  const formatDisplayName = {
    text: 'Plain Text',
    html: 'HTML',
    markdown: 'Markdown',
  }[fileFormat];

  const containerStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
    color: theme === 'dark' ? '#f8f8f2' : '#2f3337',
  };

  const toolbarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: theme === 'dark' ? '#2d2d30' : '#ffffff',
    borderBottom: `1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'}`,
    gap: '12px',
    minHeight: '40px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#0078d4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: theme === 'dark' ? '#404040' : '#6c757d',
  };

  const fileInfoStyle: React.CSSProperties = {
    fontSize: '14px',
    color: theme === 'dark' ? '#cccccc' : '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const contentAreaStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  };

  const editorStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '16px',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    color: theme === 'dark' ? '#f8f8f2' : '#2f3337',
    resize: 'none',
  };

  const previewStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    borderLeft: `1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'}`,
  };

  /**
   * Render content based on file type and mode
   */
  const renderContent = () => {
    if (isEditing) {
      return (
        <textarea
          ref={textareaRef}
          style={editorStyle}
          value={currentContent}
          onChange={handleContentChange}
          placeholder="Start typing your content here..."
          spellCheck={false}
        />
      );
    }

    // Preview mode - render based on file type
    switch (fileFormat) {
      case 'html':
        return (
          <div style={previewStyle}>
            <HTMLRenderer content={currentContent} theme={theme} />
          </div>
        );
      case 'markdown':
        return (
          <div style={previewStyle}>
            <MarkdownRenderer content={currentContent} theme={theme} />
          </div>
        );
      case 'text':
      default:
        return (
          <div style={previewStyle}>
            <TextRenderer content={currentContent} theme={theme} />
          </div>
        );
    }
  };

  return (
    <div style={containerStyle}>
      {/* Toolbar */}
      <div style={toolbarStyle}>
        <button style={buttonStyle} onClick={handleNewFile} title="Create new file (Ctrl+N)">
          📄 New
        </button>

        <button style={buttonStyle} onClick={handleOpenFile} title="Open file (Ctrl+O)">
          📁 Open
        </button>

        <button
          style={buttonStyle}
          onClick={handleSave}
          disabled={!isDirty && !!currentFilePath}
          title="Save file (Ctrl+S)"
        >
          💾 Save
        </button>

        <button style={secondaryButtonStyle} onClick={handleSaveAs} title="Save As (Ctrl+Shift+S)">
          💾 Save As
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#ddd', margin: '0 8px' }} />

        <button
          style={secondaryButtonStyle}
          onClick={toggleEditMode}
          title={isEditing ? 'Switch to preview' : 'Switch to edit mode'}
        >
          {isEditing ? '👁️ Preview' : '✏️ Edit'}
        </button>

        <button style={secondaryButtonStyle} onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div style={fileInfoStyle}>
          <span>📄 {currentFileName}</span>
          <span>•</span>
          <span>{formatDisplayName}</span>
          {isDirty && (
            <>
              <span>•</span>
              <span style={{ color: '#d73a49' }}>Modified</span>
            </>
          )}
          {currentFilePath && (
            <>
              <span>•</span>
              <span style={{ fontSize: '12px', opacity: 0.7 }}>{getCurrentFolderPath()}</span>
            </>
          )}
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div style={contentAreaStyle}>{renderContent()}</div>

      {/* File Dialogs */}
      <FileOpenDialog
        isOpen={showOpenDialog}
        onClose={() => setShowOpenDialog(false)}
        onFileSelect={handleFileSelect}
        currentPath={getCurrentFolderPath()}
      />

      <FileSaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveFile}
        currentFileName={currentFileName}
        currentPath={getCurrentFolderPath()}
      />
    </div>
  );
};

export default TextEditorApp;
