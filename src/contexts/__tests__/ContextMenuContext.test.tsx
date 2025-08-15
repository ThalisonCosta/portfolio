/** @jsxImportSource react */
import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { ContextMenuProvider } from '../ContextMenuContext';
import { useContextMenu } from '../../hooks/useContextMenu';
import type { ContextMenuItem } from '../../components/ContextMenu';

// Test component that uses the context
const TestComponent: React.FC = () => {
  const { showContextMenu, hideContextMenu, isVisible } = useContextMenu();

  const handleShowMenu = () => {
    const menuItems: ContextMenuItem[] = [
      {
        id: 'test-item-1',
        label: 'Test Item 1',
        icon: '📄',
        onClick: () => console.log('Item 1 clicked'),
      },
      {
        id: 'test-item-2',
        label: 'Test Item 2',
        icon: '📁',
        shortcut: 'Ctrl+T',
        onClick: () => console.log('Item 2 clicked'),
      },
      {
        id: 'separator',
        label: '',
        separator: true,
      },
      {
        id: 'test-item-3',
        label: 'Delete',
        icon: '🗑️',
        onClick: () => console.log('Delete clicked'),
        destructive: true,
      },
    ];

    showContextMenu({ x: 100, y: 200 }, menuItems);
  };

  return (
    <div>
      <button onClick={handleShowMenu} data-testid="show-menu-btn">
        Show Menu
      </button>
      <button onClick={hideContextMenu} data-testid="hide-menu-btn">
        Hide Menu
      </button>
      <div data-testid="menu-status">{isVisible ? 'Menu Visible' : 'Menu Hidden'}</div>
    </div>
  );
};

describe('ContextMenuProvider', () => {
  test('provides context to child components', () => {
    render(
      <ContextMenuProvider>
        <TestComponent />
      </ContextMenuProvider>
    );

    expect(screen.getByTestId('show-menu-btn')).toBeInTheDocument();
    expect(screen.getByTestId('hide-menu-btn')).toBeInTheDocument();
    expect(screen.getByTestId('menu-status')).toHaveTextContent('Menu Hidden');
  });

  test('initially renders with menu hidden', () => {
    render(
      <ContextMenuProvider>
        <TestComponent />
      </ContextMenuProvider>
    );

    expect(screen.getByTestId('menu-status')).toHaveTextContent('Menu Hidden');
  });

  test('shows context menu when showContextMenu is called', () => {
    render(
      <ContextMenuProvider>
        <TestComponent />
      </ContextMenuProvider>
    );

    const showButton = screen.getByTestId('show-menu-btn');

    act(() => {
      fireEvent.click(showButton);
    });

    expect(screen.getByTestId('menu-status')).toHaveTextContent('Menu Visible');
  });

  test('hides context menu when hideContextMenu is called', () => {
    render(
      <ContextMenuProvider>
        <TestComponent />
      </ContextMenuProvider>
    );

    const showButton = screen.getByTestId('show-menu-btn');
    const hideButton = screen.getByTestId('hide-menu-btn');

    // First show the menu
    act(() => {
      fireEvent.click(showButton);
    });

    expect(screen.getByTestId('menu-status')).toHaveTextContent('Menu Visible');

    // Then hide it
    act(() => {
      fireEvent.click(hideButton);
    });

    expect(screen.getByTestId('menu-status')).toHaveTextContent('Menu Hidden');
  });

  test('renders ContextMenu component when visible', () => {
    render(
      <ContextMenuProvider>
        <TestComponent />
      </ContextMenuProvider>
    );

    const showButton = screen.getByTestId('show-menu-btn');

    act(() => {
      fireEvent.click(showButton);
    });

    // Context menu should be rendered in DOM when visible
    // The actual ContextMenu component structure will be tested in its own test file
    expect(screen.getByTestId('menu-status')).toHaveTextContent('Menu Visible');
  });

  test('maintains correct context state during show/hide cycles', () => {
    render(
      <ContextMenuProvider>
        <TestComponent />
      </ContextMenuProvider>
    );

    const showButton = screen.getByTestId('show-menu-btn');
    const hideButton = screen.getByTestId('hide-menu-btn');

    // Multiple show/hide cycles
    for (let i = 0; i < 3; i++) {
      act(() => {
        fireEvent.click(showButton);
      });
      expect(screen.getByTestId('menu-status')).toHaveTextContent('Menu Visible');

      act(() => {
        fireEvent.click(hideButton);
      });
      expect(screen.getByTestId('menu-status')).toHaveTextContent('Menu Hidden');
    }
  });

  test('handles multiple children correctly', () => {
    const TestComponent2: React.FC = () => {
      const { isVisible } = useContextMenu();
      return <div data-testid="second-component">{isVisible ? 'Visible' : 'Hidden'}</div>;
    };

    render(
      <ContextMenuProvider>
        <TestComponent />
        <TestComponent2 />
      </ContextMenuProvider>
    );

    expect(screen.getByTestId('menu-status')).toHaveTextContent('Menu Hidden');
    expect(screen.getByTestId('second-component')).toHaveTextContent('Hidden');

    const showButton = screen.getByTestId('show-menu-btn');

    act(() => {
      fireEvent.click(showButton);
    });

    expect(screen.getByTestId('menu-status')).toHaveTextContent('Menu Visible');
    expect(screen.getByTestId('second-component')).toHaveTextContent('Visible');
  });
});
