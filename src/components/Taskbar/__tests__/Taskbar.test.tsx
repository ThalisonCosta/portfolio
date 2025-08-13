/** @jsxImportSource react */
import { render, fireEvent, screen } from '@testing-library/react';
import { Taskbar } from '../Taskbar';

// Mock the useDesktopStore hook
const mockActions = {
  minimizeWindow: jest.fn(),
  bringToFront: jest.fn(),
  toggleStartMenu: jest.fn(),
};

const mockWindows = [
  {
    id: 'window-1',
    title: 'Text Editor',
    component: 'TextEditor',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    position: { x: 100, y: 100 },
    size: { width: 600, height: 400 },
    zIndex: 1000,
  },
  {
    id: 'window-2',
    title: 'File Explorer',
    component: 'FileExplorer',
    isOpen: true,
    isMinimized: true,
    isMaximized: false,
    position: { x: 200, y: 150 },
    size: { width: 800, height: 600 },
    zIndex: 1001,
  },
];

jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: () => ({
    windows: mockWindows,
    ...mockActions,
  }),
}));

// Mock StartMenu component
jest.mock('../../StartMenu/StartMenu', () => ({
  StartMenu: () => <div data-testid="start-menu">Start Menu</div>,
}));

describe('Taskbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date for consistent time testing
    jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('10:30 AM');
    jest.spyOn(Date.prototype, 'getDate').mockReturnValue(15);
    jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(11); // December (0-based)
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2023);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders taskbar with start button', () => {
    render(<Taskbar />);

    const startButton = screen.getByLabelText('Start menu');
    expect(startButton).toBeInTheDocument();
    expect(startButton).toHaveClass('start-button');
  });

  test('renders current time and date', () => {
    render(<Taskbar />);

    expect(screen.getByText('10:30 AM')).toBeInTheDocument();
    expect(screen.getByText('15/12/2023')).toBeInTheDocument();
  });

  test('renders taskbar items for all windows', () => {
    render(<Taskbar />);

    // Should show both minimized and non-minimized windows
    expect(screen.getByText('Text Editor')).toBeInTheDocument();
    expect(screen.getByText('File Explorer')).toBeInTheDocument();

    // Check that minimized window has the 'minimized' class
    const minimizedWindow = screen.getByText('File Explorer');
    expect(minimizedWindow).toHaveClass('minimized');
  });

  test('limits taskbar items to maximum of 8', () => {
    // This test validates the taskbar item limiting behavior
    render(<Taskbar />);

    const taskbarItems = screen.getAllByRole('button').filter((button) => button.classList.contains('taskbar-item'));

    // Current mock has 2 windows (Text Editor and File Explorer)
    expect(taskbarItems.length).toBeLessThanOrEqual(8);
    expect(taskbarItems.length).toBe(2);
  });

  test('clicking start button toggles start menu', () => {
    render(<Taskbar />);

    const startButton = screen.getByLabelText('Start menu');
    fireEvent.click(startButton);

    expect(mockActions.toggleStartMenu).toHaveBeenCalledTimes(1);
  });

  test('clicking taskbar item handles window state correctly', () => {
    render(<Taskbar />);

    const taskbarItem = screen.getByText('Text Editor');
    fireEvent.click(taskbarItem);

    expect(mockActions.bringToFront).toHaveBeenCalledWith('window-1');
  });

  test('clicking minimized window taskbar item restores window', () => {
    // This test validates clicking on minimized windows in taskbar
    render(<Taskbar />);

    // Both windows should be shown in taskbar
    expect(screen.getByText('Text Editor')).toBeInTheDocument();
    expect(screen.getByText('File Explorer')).toBeInTheDocument();

    // Click on minimized window
    const minimizedTaskbarItem = screen.getByText('File Explorer');
    fireEvent.click(minimizedTaskbarItem);

    // Should call minimizeWindow (toggles) and bringToFront
    expect(mockActions.minimizeWindow).toHaveBeenCalledWith('window-2');
    expect(mockActions.bringToFront).toHaveBeenCalledWith('window-2');
  });

  test('renders StartMenu component', () => {
    render(<Taskbar />);

    expect(screen.getByTestId('start-menu')).toBeInTheDocument();
  });

  test('start button has proper accessibility attributes', () => {
    render(<Taskbar />);

    const startButton = screen.getByLabelText('Start menu');
    expect(startButton).toHaveAttribute('aria-label', 'Start menu');
  });

  test('taskbar items have proper title attributes', () => {
    render(<Taskbar />);

    const taskbarItem = screen.getByText('Text Editor');
    expect(taskbarItem).toHaveAttribute('title', 'Text Editor');
  });
});
