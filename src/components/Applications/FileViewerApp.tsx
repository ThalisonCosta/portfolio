import React, { useState, useEffect } from 'react';
import { FileViewer } from './FileViewer';
import { useDesktopStore, type FileSystemItem } from '../../stores/useDesktopStore';

/**
 * Props for FileViewerApp component
 */
interface FileViewerAppProps {
  /** Path to the file to display */
  filePath?: string;
}

/**
 * File Viewer application component that renders different file types
 * in their formatted form: .txt as text, .html as rendered webpage,
 * .md as formatted markdown.
 */
export const FileViewerApp: React.FC<FileViewerAppProps> = ({ filePath }) => {
  const { fileSystem } = useDesktopStore();
  const [fileName, setFileName] = useState<string>('sample.txt');
  const [fileContent, setFileContent] = useState<string>(
    'Welcome to File Viewer!\n\nSelect a file to view its contents.'
  );
  const [fileType, setFileType] = useState<string>('text');

  useEffect(() => {
    if (filePath) {
      // Find file in the file system
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

      const file = findFile(fileSystem, filePath);
      if (file) {
        setFileName(file.name);
        setFileContent(file.content || 'Empty file');

        // Detect file type
        const extension = file.name.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'html':
          case 'htm':
            setFileType('html');
            break;
          case 'md':
          case 'markdown':
            setFileType('markdown');
            break;
          case 'txt':
          default:
            setFileType('text');
            break;
        }
      }
    }
  }, [filePath, fileSystem]);

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <FileViewer fileName={fileName} fileContent={fileContent} fileType={fileType} />
    </div>
  );
};
