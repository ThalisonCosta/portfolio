import { CommandParser } from '../parser';

describe('CommandParser', () => {
  describe('parse', () => {
    it('should parse empty input', () => {
      const result = CommandParser.parse('');
      expect(result).toEqual({
        command: '',
        args: [],
        raw: '',
        flags: {},
      });
    });

    it('should parse whitespace-only input', () => {
      const result = CommandParser.parse('   ');
      expect(result).toEqual({
        command: '',
        args: [],
        raw: '   ',
        flags: {},
      });
    });

    it('should parse simple command', () => {
      const result = CommandParser.parse('ls');
      expect(result).toEqual({
        command: 'ls',
        args: [],
        raw: 'ls',
        flags: {},
      });
    });

    it('should parse command with arguments', () => {
      const result = CommandParser.parse('ls file1 file2');
      expect(result).toEqual({
        command: 'ls',
        args: ['file1', 'file2'],
        raw: 'ls file1 file2',
        flags: {},
      });
    });

    it('should parse command with long flags', () => {
      const result = CommandParser.parse('ls --long --all');
      expect(result).toEqual({
        command: 'ls',
        args: [],
        raw: 'ls --long --all',
        flags: {
          long: true,
          all: true,
        },
      });
    });

    it('should parse command with long flag with value', () => {
      const result = CommandParser.parse('git commit --message "Initial commit"');
      expect(result).toEqual({
        command: 'git',
        args: ['commit'],
        raw: 'git commit --message "Initial commit"',
        flags: {
          message: 'Initial commit',
        },
      });
    });

    it('should parse command with long flag with equals value', () => {
      const result = CommandParser.parse('ls --format=long');
      expect(result).toEqual({
        command: 'ls',
        args: [],
        raw: 'ls --format=long',
        flags: {
          format: 'long',
        },
      });
    });

    it('should parse command with short flags', () => {
      const result = CommandParser.parse('ls -la');
      expect(result).toEqual({
        command: 'ls',
        args: [],
        raw: 'ls -la',
        flags: {
          l: true,
          a: true,
        },
      });
    });

    it('should parse command with short flag with value', () => {
      const result = CommandParser.parse('tar -f archive.tar');
      expect(result).toEqual({
        command: 'tar',
        args: [],
        raw: 'tar -f archive.tar',
        flags: {
          f: 'archive.tar',
        },
      });
    });

    it('should parse command with mixed flags and arguments', () => {
      const result = CommandParser.parse('cp -r src dest --verbose');
      expect(result).toEqual({
        command: 'cp',
        args: ['dest'],
        raw: 'cp -r src dest --verbose',
        flags: {
          r: 'src',
          verbose: true,
        },
      });
    });

    it('should handle quoted strings', () => {
      const result = CommandParser.parse('echo "hello world" \'test string\'');
      expect(result).toEqual({
        command: 'echo',
        args: ['hello world', 'test string'],
        raw: 'echo "hello world" \'test string\'',
        flags: {},
      });
    });

    it('should handle escaped characters', () => {
      const result = CommandParser.parse('echo "hello \\"world\\""');
      expect(result).toEqual({
        command: 'echo',
        args: ['hello "world"'],
        raw: 'echo "hello \\"world\\""',
        flags: {},
      });
    });

    it('should handle escaped spaces', () => {
      const result = CommandParser.parse('ls file\\ with\\ spaces');
      expect(result).toEqual({
        command: 'ls',
        args: ['file with spaces'],
        raw: 'ls file\\ with\\ spaces',
        flags: {},
      });
    });

    it('should preserve raw input', () => {
      const input = '  ls   -la   file.txt  ';
      const result = CommandParser.parse(input);
      expect(result.raw).toBe(input);
    });
  });

  describe('escape', () => {
    it('should escape special characters', () => {
      expect(CommandParser.escape('hello"world')).toBe('hello\\"world');
      expect(CommandParser.escape("hello'world")).toBe("hello\\'world");
      expect(CommandParser.escape('hello$world')).toBe('hello\\$world');
      expect(CommandParser.escape('hello`world')).toBe('hello\\`world');
      expect(CommandParser.escape('hello\\world')).toBe('hello\\\\world');
    });

    it('should not escape regular characters', () => {
      expect(CommandParser.escape('hello world')).toBe('hello world');
      expect(CommandParser.escape('file.txt')).toBe('file.txt');
    });
  });

  describe('needsQuoting', () => {
    it('should identify strings that need quoting', () => {
      expect(CommandParser.needsQuoting('hello world')).toBe(true);
      expect(CommandParser.needsQuoting('hello"world')).toBe(true);
      expect(CommandParser.needsQuoting("hello'world")).toBe(true);
      expect(CommandParser.needsQuoting('hello$world')).toBe(true);
      expect(CommandParser.needsQuoting('hello`world')).toBe(true);
      expect(CommandParser.needsQuoting('hello\\world')).toBe(true);
    });

    it('should identify strings that do not need quoting', () => {
      expect(CommandParser.needsQuoting('hello')).toBe(false);
      expect(CommandParser.needsQuoting('file.txt')).toBe(false);
      expect(CommandParser.needsQuoting('hello-world')).toBe(false);
    });
  });

  describe('quote', () => {
    it('should quote strings that need quoting', () => {
      expect(CommandParser.quote('hello world')).toBe('"hello world"');
      expect(CommandParser.quote('hello"world')).toBe('"hello\\"world"');
      expect(CommandParser.quote('hello\\world')).toBe('"hello\\\\world"');
    });

    it('should not quote strings that do not need quoting', () => {
      expect(CommandParser.quote('hello')).toBe('hello');
      expect(CommandParser.quote('file.txt')).toBe('file.txt');
    });
  });
});
