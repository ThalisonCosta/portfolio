// @ts-expect-error - React is needed for JSX in Jest
import React from 'react';
import { render } from '@testing-library/react';
import { WindowManager } from '../WindowManager';

// Mock the useDesktopStore hook
const mockWindows = [
  {
    id: 'window-1',
    title: 'Test Window 1',
    component: 'test1',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    isResizable: true,
    position: { x: 100, y: 100 },
    size: { width: 600, height: 400 },
    zIndex: 1000,
  },
  {
    id: 'window-2',
    title: 'Test Window 2',
    component: 'test2',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    isResizable: true,
    position: { x: 200, y: 200 },
    size: { width: 700, height: 500 },
    zIndex: 1001,
  },
];

jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: jest.fn(() => ({
    windows: mockWindows,
  })),
}));

jest.mock('../../Window/Window', () => ({
  Window: ({ windowState }: { windowState: { id: string; title: string } }) => (
    <div data-testid={`window-${windowState.id}`}>{windowState.title}</div>
  ),
}));

describe('WindowManager Component', () => {
  test('renders all windows from store', () => {
    const { getByTestId } = render(<WindowManager />);

    expect(getByTestId('window-window-1')).toBeInTheDocument();
    expect(getByTestId('window-window-2')).toBeInTheDocument();
  });

  test('renders empty when no windows', () => {
    const { useDesktopStore } = jest.requireMock('../../../stores/useDesktopStore');
    useDesktopStore.mockReturnValueOnce({
      windows: [],
    });

    const { container } = render(<WindowManager />);
    expect(container.firstChild).toBeNull();
  });

  test('passes correct windowState props to Window components', () => {
    const { getByTestId } = render(<WindowManager />);

    // The Window component mock should receive the correct windowState
    expect(getByTestId('window-window-1')).toHaveTextContent('Test Window 1');
    expect(getByTestId('window-window-2')).toHaveTextContent('Test Window 2');
  });
});
