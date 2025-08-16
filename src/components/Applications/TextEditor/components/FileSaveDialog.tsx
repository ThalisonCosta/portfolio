import React, { useState, useEffect } from 'react';
import { useDesktopStore, FileSystemItem } from '../../../../stores/useDesktopStore';

/**
 * Props for FileSaveDialog component
 */
interface FileSaveDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when save location is selected */
  onSave: (folderPath: string, fileName: string) => void;
  /** Current file name (for default) */
  currentFileName?: string;
  /** Current directory path */
  currentPath?: string;
}

/**
 * Dialog component for saving files with Save As functionality
 * Allows browsing folders and entering file names
 */
export const FileSaveDialog: React.FC<FileSaveDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  currentFileName = 'untitled.txt',
  currentPath = '/Desktop',
}) => {
  const { fileSystem } = useDesktopStore();
  const [selectedPath, setSelectedPath] = useState<string>(currentPath);
  const [currentItems, setCurrentItems] = useState<FileSystemItem[]>([]);
  const [fileName, setFileName] = useState<string>(currentFileName);
  const [error, setError] = useState<string>('');

  /**
   * Validate file name
   */
  const validateFileName = (name: string): string => {
    if (!name.trim()) {
      return 'Nome do arquivo é obrigatório';
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(name)) {
      return 'Nome contém caracteres inválidos: < > : " / \\ | ? *';
    }

    // Check if file already exists
    const existingFile = currentItems.find(
      (item) => item.type === 'file' && item.name.toLowerCase() === name.toLowerCase()
    );
    if (existingFile) {
      return 'Arquivo já existe nesta pasta';
    }

    return '';
  };

  /**
   * Find folder contents by path
   */
  const getFolderContents = (path: string): FileSystemItem[] => {
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
  };

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
    setError('');
  };

  /**
   * Handle folder selection
   */
  const handleFolderSelect = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      navigateToFolder(item.path);
    }
  };

  /**
   * Handle save button click
   */
  const handleSave = () => {
    const validationError = validateFileName(fileName);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSave(selectedPath, fileName);
    onClose();
  };

  /**
   * Handle file name change
   */
  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFileName(newName);

    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  /**
   * Add extension if missing
   */
  const addExtensionIfMissing = (name: string): string => {
    if (!name.includes('.')) {
      return `${name}.txt`;
    }
    return name;
  };

  // Update current items when path changes
  useEffect(() => {
    setCurrentItems(getFolderContents(selectedPath));
  }, [selectedPath, fileSystem]);

  // Update selected path when currentPath prop changes
  useEffect(() => {
    setSelectedPath(currentPath);
  }, [currentPath]);

  // Update file name when currentFileName prop changes
  useEffect(() => {
    setFileName(currentFileName);
  }, [currentFileName]);

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
    maxHeight: '200px',
    marginBottom: '16px',
  };

  const itemStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const fileNameGroupStyle: React.CSSProperties = {
    marginBottom: '12px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: error ? '1px solid #dc3545' : '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  };

  const errorStyle: React.CSSProperties = {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '4px',
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
  const folders = currentItems.filter((item) => item.type === 'folder');

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0 }}>Salvar Como</h3>
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

          {folders.map((item) => (
            <div key={item.id} style={itemStyle} onClick={() => handleFolderSelect(item)}>
              <span>📁</span>
              <span>{item.name}</span>
            </div>
          ))}

          {folders.length === 0 && !parentPath && (
            <div style={{ ...itemStyle, cursor: 'default', opacity: 0.7 }}>
              <span>📂</span>
              <span>Nenhuma subpasta encontrada</span>
            </div>
          )}
        </div>

        <div style={fileNameGroupStyle}>
          <label style={labelStyle} htmlFor="fileName">
            Nome do arquivo:
          </label>
          <input
            id="fileName"
            type="text"
            value={fileName}
            onChange={handleFileNameChange}
            style={inputStyle}
            placeholder="Digite o nome do arquivo..."
            onBlur={() => {
              // Auto-add .txt extension if no extension provided
              if (fileName && !fileName.includes('.')) {
                setFileName(`${fileName}.txt`);
              }
            }}
          />
          {error && <div style={errorStyle}>{error}</div>}
        </div>

        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Arquivo será salvo como: {selectedPath}/{addExtensionIfMissing(fileName)}
        </div>

        <div style={buttonGroupStyle}>
          <button style={secondaryButtonStyle} onClick={onClose}>
            Cancelar
          </button>
          <button style={primaryButtonStyle} onClick={handleSave} disabled={!fileName.trim() || !!error}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
