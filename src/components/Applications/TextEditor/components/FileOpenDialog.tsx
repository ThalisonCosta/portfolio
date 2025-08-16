import React, { useState, useEffect, useCallback } from 'react';
import { useDesktopStore, FileSystemItem } from '../../../../stores/useDesktopStore';

/**
 * Props for FileOpenDialog component
 */
interface FileOpenDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when file is selected */
  onFileSelect: (filePath: string, fileName: string, content: string) => void;
  /** Current directory path */
  currentPath?: string;
}

/**
 * Dialog component for opening files in TextEditor
 * Allows browsing through the virtual file system and selecting text files
 */
export const FileOpenDialog: React.FC<FileOpenDialogProps> = ({
  isOpen,
  onClose,
  onFileSelect,
  currentPath = '/Desktop',
}) => {
  const { fileSystem } = useDesktopStore();
  const [selectedPath, setSelectedPath] = useState<string>(currentPath);
  const [currentItems, setCurrentItems] = useState<FileSystemItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Supported file extensions for text editing
  const supportedExtensions = [
    'txt',
    'html',
    'htm',
    'md',
    'markdown',
    'js',
    'jsx',
    'ts',
    'tsx',
    'css',
    'scss',
    'sass',
    'json',
    'xml',
  ];

  /**
   * Check if file is editable based on extension
   */
  const isEditableFile = (fileName: string): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? supportedExtensions.includes(extension) : false;
  };

  /**
   * Find folder contents by path
   */
  const getFolderContents = useCallback((path: string): FileSystemItem[] => {
    const findFolder = (items: FileSystemItem[], targetPath: string): FileSystemItem | null => {
      for (const item of items) {
        if (item.path === targetPath && item.type === 'folder') {
          return item;
        }
        if (item.children) {
          const found = findFolder(item.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const folder = findFolder(fileSystem, path);
    return folder?.children || [];
  }, [fileSystem]);

  /**
   * Get parent path
   */
  const getParentPath = (path: string): string | null => {
    if (path === '/' || path === '/Desktop') return null;
    const parts = path.split('/');
    parts.pop();
    return parts.join('/') || '/';
  };

  /**
   * Navigate to folder
   */
  const navigateToFolder = (path: string) => {
    setSelectedPath(path);
    setSelectedFile(null);
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      navigateToFolder(item.path);
    } else if (isEditableFile(item.name)) {
      setSelectedFile(item.path);
    }
  };

  /**
   * Handle open button click
   */
  const handleOpen = () => {
    if (!selectedFile) return;

    const findFile = (items: FileSystemItem[], path: string): FileSystemItem | null => {
      for (const item of items) {
        if (item.path === path && item.type === 'file') {
          return item;
        }
        if (item.children) {
          const found = findFile(item.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    const file = findFile(fileSystem, selectedFile);
    if (file) {
      onFileSelect(file.path, file.name, file.content || '');
      onClose();
    }
  };

  // Update current items when path changes
  useEffect(() => {
    setCurrentItems(getFolderContents(selectedPath));
  }, [selectedPath, fileSystem, getFolderContents]);

  // Update selected path when currentPath prop changes
  useEffect(() => {
    setSelectedPath(currentPath);
  }, [currentPath]);

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    width: '500px',
    maxHeight: '600px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '12px',
  };

  const pathStyle: React.CSSProperties = {
    backgroundColor: '#f5f5f5',
    padding: '8px 12px',
    borderRadius: '4px',
    marginBottom: '12px',
    fontSize: '14px',
    fontFamily: 'monospace',
    border: '1px solid #ddd',
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: '4px',
    maxHeight: '300px',
  };

  const itemStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const selectedItemStyle: React.CSSProperties = {
    ...itemStyle,
    backgroundColor: '#e3f2fd',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    justifyContent: 'flex-end',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#0078d4',
    color: 'white',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
  };

  const parentPath = getParentPath(selectedPath);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0 }}>Abrir Arquivo</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={pathStyle}>📁 {selectedPath}</div>

        <div style={listStyle}>
          {parentPath && (
            <div style={itemStyle} onClick={() => navigateToFolder(parentPath)}>
              <span>📁</span>
              <span>..</span>
            </div>
          )}

          {currentItems.map((item) => {
            const isSelected = selectedFile === item.path;
            const isEditable = item.type === 'file' ? isEditableFile(item.name) : true;
            const itemStyleToUse = isSelected ? selectedItemStyle : itemStyle;

            return (
              <div
                key={item.id}
                style={{
                  ...itemStyleToUse,
                  opacity: isEditable ? 1 : 0.5,
                  cursor: isEditable ? 'pointer' : 'not-allowed',
                }}
                onClick={() => isEditable && handleFileSelect(item)}
              >
                <span>
                  {(() => {
                    if (item.type === 'folder') return '📁';
                    if (item.name.endsWith('.txt')) return '📄';
                    if (item.name.endsWith('.html') || item.name.endsWith('.htm')) return '🌐';
                    if (item.name.endsWith('.md')) return 'ℹ️';
                    if (item.name.endsWith('.js') || item.name.endsWith('.jsx')) return '📜';
                    if (item.name.endsWith('.css')) return '🎨';
                    if (item.name.endsWith('.json')) return '🔧';
                    return '📄';
                  })()}
                </span>
                <span>{item.name}</span>
                {item.type === 'file' && !isEditableFile(item.name) && (
                  <span style={{ fontSize: '12px', color: '#999', marginLeft: 'auto' }}>(não editável)</span>
                )}
              </div>
            );
          })}
        </div>

        <div style={buttonGroupStyle}>
          <button style={secondaryButtonStyle} onClick={onClose}>
            Cancelar
          </button>
          <button style={primaryButtonStyle} onClick={handleOpen} disabled={!selectedFile}>
            Abrir
          </button>
        </div>
      </div>
    </div>
  );
};
