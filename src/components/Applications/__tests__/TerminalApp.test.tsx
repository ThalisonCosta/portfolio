/** @jsxImportSource react */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TerminalApp } from '../TerminalApp';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock scrollIntoView
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
});

// Mock zustand store
jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: () => ({
    fileSystem: [
      {
        id: 'desktop',
        name: 'Desktop',
        type: 'folder',
        path: '/Desktop',
        icon: 'folder',
        children: [
          {
            id: 'test-file',
            name: 'test.txt',
            type: 'file',
            path: '/Desktop/test.txt',
            icon: 'text',
            content: 'Hello World',
          },
        ],
      },
    ],
  }),
}));

describe('TerminalApp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders terminal with welcome messages', () => {
    render(<TerminalApp />);

    expect(screen.getByText('Portfolio Desktop Terminal v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Type "help" for available commands')).toBeInTheDocument();
  });

  test('displays correct initial prompt for Linux mode', () => {
    render(<TerminalApp initialOS="linux" />);

    expect(screen.getByText('portfolio@desktop:~$')).toBeInTheDocument();
  });

  test('displays correct initial prompt for Windows mode', async () => {
    render(<TerminalApp initialOS="windows" />);

    // Wait for the OS switch to complete
    await waitFor(() => {
      expect(screen.getByText('🪟 Windows')).toBeInTheDocument();
    });

    // Check that a Windows prompt appears in the output
    expect(screen.getByText('Switched to Windows mode')).toBeInTheDocument();
  });

  test('shows correct initial OS mode', () => {
    render(<TerminalApp />);

    // Should start with Linux mode by default
    expect(screen.getByText('🐧 Linux')).toBeInTheDocument();
    expect(screen.getByText('Running in Linux mode')).toBeInTheDocument();
  });

  test('terminal input field is present and accessible', () => {
    render(<TerminalApp />);

    const input = screen.getByLabelText('Terminal command input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).not.toBeDisabled();
  });

  test('terminal starts with empty input', () => {
    render(<TerminalApp />);

    const input = screen.getByLabelText('Terminal command input');
    expect(input).toHaveValue('');
  });

  test('shows terminal output area', () => {
    render(<TerminalApp />);

    expect(screen.getByRole('log')).toBeInTheDocument();
    expect(screen.getByLabelText('Terminal output')).toBeInTheDocument();
  });

  test('focuses input when terminal is clicked', async () => {
    const user = userEvent.setup();
    render(<TerminalApp />);

    const input = screen.getByLabelText('Terminal command input');
    const terminal = screen.getByRole('application');

    // Click somewhere on the terminal
    await user.click(terminal);

    // Input should be focused
    expect(input).toHaveFocus();
  });

  test('displays correct theme colors for Linux mode', () => {
    render(<TerminalApp initialOS="linux" />);

    const terminal = screen.getByRole('application');

    // Should have dark theme background (Oh My Zsh style)
    expect(terminal).toHaveStyle({
      backgroundColor: 'rgb(40, 44, 52)', // ohMyZshTheme.background
    });
  });

  test('displays correct theme colors for Windows mode', async () => {
    render(<TerminalApp initialOS="windows" />);

    await waitFor(() => {
      expect(screen.getByText('🪟 Windows')).toBeInTheDocument();
    });

    const terminal = screen.getByRole('application');

    // Should have Windows theme background
    expect(terminal).toHaveStyle({
      backgroundColor: 'rgb(12, 12, 12)', // windowsTheme.background
    });
  });

  test('shows OS switcher buttons', () => {
    render(<TerminalApp />);

    expect(screen.getByRole('button', { name: /Linux/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Windows/i })).toBeInTheDocument();
  });

  test('has proper accessibility attributes', () => {
    render(<TerminalApp />);

    expect(screen.getByRole('application')).toHaveAttribute('aria-label', 'Terminal Application');
    expect(screen.getByRole('log')).toHaveAttribute('aria-label', 'Terminal output');
    expect(screen.getByLabelText('Terminal command input')).toBeInTheDocument();
  });

  test('displays terminal header with title', () => {
    render(<TerminalApp />);

    expect(screen.getByText('📟')).toBeInTheDocument();
    expect(screen.getByText('Terminal')).toBeInTheDocument();
  });

  test('can be rendered without crashing', () => {
    const { container } = render(<TerminalApp />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('shows current directory in status', () => {
    render(<TerminalApp />);

    // Look for the current directory prompt in the status bar
    expect(screen.getByText('portfolio@desktop:~$')).toBeInTheDocument();
  });

  test('terminal input is not disabled initially', () => {
    render(<TerminalApp />);

    const input = screen.getByLabelText('Terminal command input');
    expect(input).not.toBeDisabled();
  });

  test('displays welcome message with proper mode', () => {
    render(<TerminalApp />);

    expect(screen.getByText('Running in Linux mode')).toBeInTheDocument();
  });

  test('displays current OS in header', () => {
    render(<TerminalApp />);

    expect(screen.getByText('🐧 Linux')).toBeInTheDocument();
  });
});
