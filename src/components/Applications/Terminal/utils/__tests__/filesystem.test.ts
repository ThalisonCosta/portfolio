import { FileSystemUtils } from '../filesystem';
import type { FileSystemItem } from '../../../../../stores/useDesktopStore';

const mockFileSystem: FileSystemItem[] = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    path: '/Documents',
    icon: 'folder',
    children: [
      {
        id: '2',
        name: 'file.txt',
        type: 'file',
        path: '/Documents/file.txt',
        content: 'Hello World',
        icon: 'file',
      },
      {
        id: '3',
        name: 'script.py',
        type: 'file',
        path: '/Documents/script.py',
        content: 'print("Hello")',
        icon: 'file',
      },
      {
        id: '4',
        name: 'SubFolder',
        type: 'folder',
        path: '/Documents/SubFolder',
        icon: 'folder',
        children: [
          {
            id: '5',
            name: 'nested.txt',
            type: 'file',
            path: '/Documents/SubFolder/nested.txt',
            content: 'Nested file content',
            icon: 'file',
          },
        ],
      },
    ],
  },
  {
    id: '6',
    name: 'empty.txt',
    type: 'file',
    path: '/empty.txt',
    content: '',
    icon: 'file',
  },
];

describe('FileSystemUtils', () => {
  describe('convertToTerminalItem', () => {
    it('should convert folder to terminal item', () => {
      const folder = mockFileSystem[0];
      const result = FileSystemUtils.convertToTerminalItem(folder);

      expect(result).toEqual({
        name: 'Documents',
        isDirectory: true,
        path: '/Documents',
        permissions: 'rwxr-xr-x',
        size: 0,
        modified: expect.any(Date),
      });
    });

    it('should convert file to terminal item', () => {
      const file = mockFileSystem[0].children![0];
      const result = FileSystemUtils.convertToTerminalItem(file);

      expect(result).toEqual({
        name: 'file.txt',
        isDirectory: false,
        path: '/Documents/file.txt',
        permissions: 'rwxr-xr-x',
        size: 11,
        modified: expect.any(Date),
      });
    });
  });

  describe('resolvePath', () => {
    it('should resolve absolute paths', () => {
      const result = FileSystemUtils.resolvePath('/current', '/absolute');
      expect(result).toBe('/absolute');
    });

    it('should resolve current directory', () => {
      const result = FileSystemUtils.resolvePath('/current', '.');
      expect(result).toBe('/current');
    });

    it('should resolve parent directory', () => {
      const result = FileSystemUtils.resolvePath('/current/sub', '..');
      expect(result).toBe('/current');
    });

    it('should resolve relative paths starting with ./', () => {
      const result = FileSystemUtils.resolvePath('/current', './file.txt');
      expect(result).toBe('/current/file.txt');
    });

    it('should resolve paths with multiple ../', () => {
      const result = FileSystemUtils.resolvePath('/current/sub/deep', '../../file.txt');
      expect(result).toBe('/current/file.txt');
    });

    it('should resolve simple relative paths', () => {
      const result = FileSystemUtils.resolvePath('/current', 'file.txt');
      expect(result).toBe('/current/file.txt');
    });
  });

  describe('normalizePath', () => {
    it('should remove duplicate slashes', () => {
      const result = FileSystemUtils.normalizePath('/path//to///file');
      expect(result).toBe('/path/to/file');
    });

    it('should resolve . references', () => {
      const result = FileSystemUtils.normalizePath('/path/./to/file');
      expect(result).toBe('/path/to/file');
    });

    it('should resolve .. references', () => {
      const result = FileSystemUtils.normalizePath('/path/to/../file');
      expect(result).toBe('/path/file');
    });

    it('should handle root path', () => {
      const result = FileSystemUtils.normalizePath('/');
      expect(result).toBe('/');
    });
  });

  describe('getParentDirectory', () => {
    it('should return parent directory', () => {
      const result = FileSystemUtils.getParentDirectory('/path/to/file');
      expect(result).toBe('/path/to');
    });

    it('should handle root directory', () => {
      const result = FileSystemUtils.getParentDirectory('/file');
      expect(result).toBe('/');
    });
  });

  describe('getFilename', () => {
    it('should extract filename from path', () => {
      const result = FileSystemUtils.getFilename('/path/to/file.txt');
      expect(result).toBe('file.txt');
    });

    it('should handle root path', () => {
      const result = FileSystemUtils.getFilename('/');
      expect(result).toBe('');
    });
  });

  describe('isSubdirectory', () => {
    it('should identify subdirectory', () => {
      const result = FileSystemUtils.isSubdirectory('/parent', '/parent/child');
      expect(result).toBe(true);
    });

    it('should not identify same directory as subdirectory', () => {
      const result = FileSystemUtils.isSubdirectory('/path', '/path');
      expect(result).toBe(false);
    });

    it('should not identify unrelated paths as subdirectory', () => {
      const result = FileSystemUtils.isSubdirectory('/parent', '/other');
      expect(result).toBe(false);
    });
  });

  describe('findItemByPath', () => {
    it('should find top-level item', () => {
      const result = FileSystemUtils.findItemByPath(mockFileSystem, '/Documents');
      expect(result?.name).toBe('Documents');
    });

    it('should find nested item', () => {
      const result = FileSystemUtils.findItemByPath(mockFileSystem, '/Documents/file.txt');
      expect(result?.name).toBe('file.txt');
    });

    it('should return null for non-existent path', () => {
      const result = FileSystemUtils.findItemByPath(mockFileSystem, '/nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getDirectoryContents', () => {
    it('should return directory contents', () => {
      const result = FileSystemUtils.getDirectoryContents(mockFileSystem, '/Documents');
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('file.txt');
      expect(result[1].name).toBe('script.py');
      expect(result[2].name).toBe('SubFolder');
    });

    it('should return empty array for non-existent directory', () => {
      const result = FileSystemUtils.getDirectoryContents(mockFileSystem, '/nonexistent');
      expect(result).toEqual([]);
    });

    it('should return empty array for file path', () => {
      const result = FileSystemUtils.getDirectoryContents(mockFileSystem, '/Documents/file.txt');
      expect(result).toEqual([]);
    });
  });

  describe('pathExists', () => {
    it('should return true for existing path', () => {
      const result = FileSystemUtils.pathExists(mockFileSystem, '/Documents/file.txt');
      expect(result).toBe(true);
    });

    it('should return false for non-existent path', () => {
      const result = FileSystemUtils.pathExists(mockFileSystem, '/nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('isDirectory', () => {
    it('should return true for directory', () => {
      const result = FileSystemUtils.isDirectory(mockFileSystem, '/Documents');
      expect(result).toBe(true);
    });

    it('should return false for file', () => {
      const result = FileSystemUtils.isDirectory(mockFileSystem, '/Documents/file.txt');
      expect(result).toBe(false);
    });
  });

  describe('getFileContent', () => {
    it('should return file content', () => {
      const result = FileSystemUtils.getFileContent(mockFileSystem, '/Documents/file.txt');
      expect(result).toBe('Hello World');
    });

    it('should return empty string for empty file', () => {
      const result = FileSystemUtils.getFileContent(mockFileSystem, '/empty.txt');
      expect(result).toBe('');
    });

    it('should return null for directory', () => {
      const result = FileSystemUtils.getFileContent(mockFileSystem, '/Documents');
      expect(result).toBeNull();
    });

    it('should return null for non-existent file', () => {
      const result = FileSystemUtils.getFileContent(mockFileSystem, '/nonexistent.txt');
      expect(result).toBeNull();
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(FileSystemUtils.formatFileSize(0)).toBe('0 B');
      expect(FileSystemUtils.formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(FileSystemUtils.formatFileSize(1024)).toBe('1 KB');
      expect(FileSystemUtils.formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(FileSystemUtils.formatFileSize(1048576)).toBe('1 MB');
    });
  });

  describe('getFileExtension', () => {
    it('should return file extension', () => {
      expect(FileSystemUtils.getFileExtension('file.txt')).toBe('txt');
      expect(FileSystemUtils.getFileExtension('script.py')).toBe('py');
    });

    it('should handle files with no extension', () => {
      expect(FileSystemUtils.getFileExtension('README')).toBe('');
    });

    it('should handle files starting with dot', () => {
      expect(FileSystemUtils.getFileExtension('.gitignore')).toBe('');
    });
  });

  describe('isExecutable', () => {
    it('should identify executable files', () => {
      expect(FileSystemUtils.isExecutable('script.py')).toBe(true);
      expect(FileSystemUtils.isExecutable('app.exe')).toBe(true);
      expect(FileSystemUtils.isExecutable('script.sh')).toBe(true);
    });

    it('should not identify non-executable files', () => {
      expect(FileSystemUtils.isExecutable('file.txt')).toBe(false);
      expect(FileSystemUtils.isExecutable('README')).toBe(false);
    });
  });

  describe('getPathCompletions', () => {
    it('should return completions for current directory', () => {
      const result = FileSystemUtils.getPathCompletions(mockFileSystem, '/Documents', 'f');
      expect(result).toContain('file.txt');
      expect(result).not.toContain('script.py');
    });

    it('should return all items for empty pattern', () => {
      const result = FileSystemUtils.getPathCompletions(mockFileSystem, '/Documents', '');
      expect(result).toHaveLength(3);
    });

    it('should handle absolute paths', () => {
      const result = FileSystemUtils.getPathCompletions(mockFileSystem, '/Documents', '/Documents/');
      expect(result).toContain('/Documents/file.txt');
    });

    it('should handle relative paths with directories', () => {
      const result = FileSystemUtils.getPathCompletions(mockFileSystem, '/', 'Documents/S');
      expect(result).toContain('Documents/SubFolder/');
    });

    it('should sort directories before files', () => {
      const result = FileSystemUtils.getPathCompletions(mockFileSystem, '/Documents', '');
      expect(result[0]).toBe('SubFolder/');
    });
  });
});
