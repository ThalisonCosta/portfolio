import { AnsiColorizer, SyntaxHighlighter, ohMyZshTheme, windowsTheme } from '../colors';

describe('Colors utilities', () => {
  describe('themes', () => {
    it('should have ohMyZshTheme with all required properties', () => {
      expect(ohMyZshTheme).toHaveProperty('background');
      expect(ohMyZshTheme).toHaveProperty('foreground');
      expect(ohMyZshTheme).toHaveProperty('prompt');
      expect(ohMyZshTheme).toHaveProperty('success');
      expect(ohMyZshTheme).toHaveProperty('error');
      expect(ohMyZshTheme).toHaveProperty('warning');
      expect(ohMyZshTheme).toHaveProperty('directory');
      expect(ohMyZshTheme).toHaveProperty('file');
      expect(ohMyZshTheme).toHaveProperty('executable');
      expect(ohMyZshTheme).toHaveProperty('comment');
      expect(ohMyZshTheme).toHaveProperty('selection');
      expect(ohMyZshTheme).toHaveProperty('cursor');
    });

    it('should have windowsTheme with all required properties', () => {
      expect(windowsTheme).toHaveProperty('background');
      expect(windowsTheme).toHaveProperty('foreground');
      expect(windowsTheme).toHaveProperty('prompt');
      expect(windowsTheme).toHaveProperty('success');
      expect(windowsTheme).toHaveProperty('error');
      expect(windowsTheme).toHaveProperty('warning');
      expect(windowsTheme).toHaveProperty('directory');
      expect(windowsTheme).toHaveProperty('file');
      expect(windowsTheme).toHaveProperty('executable');
      expect(windowsTheme).toHaveProperty('comment');
      expect(windowsTheme).toHaveProperty('selection');
      expect(windowsTheme).toHaveProperty('cursor');
    });
  });

  describe('AnsiColorizer', () => {
    describe('ansiToHtml', () => {
      it('should convert ANSI colors to HTML', () => {
        const text = '\x1b[31mRed text\x1b[0m';
        const result = AnsiColorizer.ansiToHtml(text);
        expect(result).toContain('<span style="color: #e06c75;">Red text</span>');
      });

      it('should handle multiple colors', () => {
        const text = '\x1b[31mRed\x1b[0m \x1b[32mGreen\x1b[0m';
        const result = AnsiColorizer.ansiToHtml(text);
        expect(result).toContain('<span style="color: #e06c75;">Red</span>');
        expect(result).toContain('<span style="color: #98c379;">Green</span>');
      });

      it('should handle bold text', () => {
        const text = '\x1b[1mBold text\x1b[0m';
        const result = AnsiColorizer.ansiToHtml(text);
        expect(result).toContain('<span style="font-weight: bold;">Bold text</span>');
      });

      it('should handle text without ANSI codes', () => {
        const text = 'Plain text';
        const result = AnsiColorizer.ansiToHtml(text);
        expect(result).toBe('Plain text');
      });
    });

    describe('colorize', () => {
      it('should add success color', () => {
        const result = AnsiColorizer.colorize('Success message', 'success');
        expect(result).toBe('\x1b[32mSuccess message\x1b[0m');
      });

      it('should add error color', () => {
        const result = AnsiColorizer.colorize('Error message', 'error');
        expect(result).toBe('\x1b[31mError message\x1b[0m');
      });

      it('should add warning color', () => {
        const result = AnsiColorizer.colorize('Warning message', 'warning');
        expect(result).toBe('\x1b[33mWarning message\x1b[0m');
      });

      it('should add info color', () => {
        const result = AnsiColorizer.colorize('Info message', 'info');
        expect(result).toBe('\x1b[36mInfo message\x1b[0m');
      });

      it('should add directory color', () => {
        const result = AnsiColorizer.colorize('Directory', 'directory');
        expect(result).toBe('\x1b[34mDirectory\x1b[0m');
      });

      it('should add file color', () => {
        const result = AnsiColorizer.colorize('File', 'file');
        expect(result).toBe('\x1b[37mFile\x1b[0m');
      });

      it('should add executable color', () => {
        const result = AnsiColorizer.colorize('Executable', 'executable');
        expect(result).toBe('\x1b[35mExecutable\x1b[0m');
      });
    });

    describe('formatFileList', () => {
      it('should format files with appropriate colors', () => {
        const files = [
          { name: 'directory', isDirectory: true },
          { name: 'file.txt', isDirectory: false },
          { name: 'script', isDirectory: false, isExecutable: true },
        ];

        const result = AnsiColorizer.formatFileList(files);
        expect(result).toContain('\x1b[34mdirectory/\x1b[0m');
        expect(result).toContain('\x1b[37mfile.txt\x1b[0m');
        expect(result).toContain('\x1b[35mscript\x1b[0m');
      });

      it('should handle empty file list', () => {
        const result = AnsiColorizer.formatFileList([]);
        expect(result).toBe('');
      });
    });
  });

  describe('SyntaxHighlighter', () => {
    const mockCommandRegistry = {
      hasCommand: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('highlight', () => {
      it('should highlight valid commands in green', () => {
        mockCommandRegistry.hasCommand.mockReturnValue(true);
        const result = SyntaxHighlighter.highlight('ls -la', mockCommandRegistry);
        expect(result).toContain('<span style="color: #98c379; font-weight: bold;">ls</span>');
        expect(result).toContain('<span style="color: #abb2bf;">-la</span>');
      });

      it('should highlight invalid commands in red', () => {
        mockCommandRegistry.hasCommand.mockReturnValue(false);
        const result = SyntaxHighlighter.highlight('invalidcommand', mockCommandRegistry);
        expect(result).toContain('<span style="color: #e06c75;">invalidcommand</span>');
      });

      it('should handle commands with no arguments', () => {
        mockCommandRegistry.hasCommand.mockReturnValue(true);
        const result = SyntaxHighlighter.highlight('ls', mockCommandRegistry);
        expect(result).toBe('<span style="color: #98c379; font-weight: bold;">ls</span>');
      });

      it('should handle empty input', () => {
        const result = SyntaxHighlighter.highlight('', mockCommandRegistry);
        expect(result).toBe('<span style="color: #98c379; font-weight: bold;"></span>');
      });

      it('should handle null commandRegistry', () => {
        const result = SyntaxHighlighter.highlight('ls', null);
        expect(result).toContain('<span style="color: #e06c75;">ls</span>');
      });
    });

    describe('isValidCommand', () => {
      it('should return true for valid commands', () => {
        mockCommandRegistry.hasCommand.mockReturnValue(true);
        const result = SyntaxHighlighter.isValidCommand('ls', mockCommandRegistry);
        expect(result).toBe(true);
      });

      it('should return false for invalid commands', () => {
        mockCommandRegistry.hasCommand.mockReturnValue(false);
        const result = SyntaxHighlighter.isValidCommand('invalidcommand', mockCommandRegistry);
        expect(result).toBe(false);
      });

      it('should return false when commandRegistry is null', () => {
        const result = SyntaxHighlighter.isValidCommand('ls', null);
        expect(result).toBe(false);
      });

      it('should return false when commandRegistry is undefined', () => {
        const result = SyntaxHighlighter.isValidCommand('ls', undefined);
        expect(result).toBe(false);
      });
    });
  });
});
