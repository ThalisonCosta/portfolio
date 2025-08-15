/** @jsxImportSource react */
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { ContextMenu, type ContextMenuItem } from '../ContextMenu';

describe('ContextMenu Component', () => {
  const mockOnClose = jest.fn();
  
  const defaultProps = {
    isVisible: true,
    position: { x: 100, y: 100 },
    onClose: mockOnClose,
    items: [] as ContextMenuItem[],
  };

  const sampleMenuItems: ContextMenuItem[] = [
    {
      id: 'new-folder',
      label: 'New Folder',
      icon: '📁',
      onClick: jest.fn(),
    },
    {
      id: 'new-file',
      label: 'New Text File',
      icon: '📄',
      onClick: jest.fn(),
    },
    {
      id: 'separator-1',
      label: '',
      separator: true,
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: '📋',
      shortcut: 'Ctrl+V',
      onClick: jest.fn(),
      disabled: true,
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: '🔄',
      shortcut: 'F5',
      onClick: jest.fn(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any event listeners
    document.removeEventListener('mousedown', jest.fn());
    document.removeEventListener('keydown', jest.fn());
  });

  test('renders context menu when visible', () => {
    render(<ContextMenu {...defaultProps} items={sampleMenuItems} />);
    
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveClass('context-menu');
  });

  test('does not render when not visible', () => {
    render(<ContextMenu {...defaultProps} isVisible={false} items={sampleMenuItems} />);
    
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('renders all menu items correctly', () => {
    render(<ContextMenu {...defaultProps} items={sampleMenuItems} />);
    
    expect(screen.getByText('New Folder')).toBeInTheDocument();
    expect(screen.getByText('New Text File')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    
    // Check icons are rendered
    expect(screen.getByText('📁')).toBeInTheDocument();
    expect(screen.getByText('📄')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('🔄')).toBeInTheDocument();
  });

  test('renders separators correctly', () => {
    render(<ContextMenu {...defaultProps} items={sampleMenuItems} />);
    
    const separator = screen.getByRole('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('context-menu-separator');
  });

  test('renders shortcuts correctly', () => {
    render(<ContextMenu {...defaultProps} items={sampleMenuItems} />);
    
    expect(screen.getByText('Ctrl+V')).toBeInTheDocument();
    expect(screen.getByText('F5')).toBeInTheDocument();
  });

  test('handles disabled items correctly', () => {
    render(<ContextMenu {...defaultProps} items={sampleMenuItems} />);
    
    const pasteItem = screen.getByText('Paste').closest('.context-menu-item');
    expect(pasteItem).toHaveClass('disabled');
    expect(pasteItem).toHaveAttribute('aria-disabled', 'true');
  });

  test('calls onClick handler when menu item is clicked', () => {
    const mockClick = jest.fn();
    const items: ContextMenuItem[] = [
      {
        id: 'test-item',
        label: 'Test Item',
        onClick: mockClick,
      },
    ];

    render(<ContextMenu {...defaultProps} items={items} />);
    
    fireEvent.click(screen.getByText('Test Item'));
    
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick for disabled items', () => {
    const mockClick = jest.fn();
    const items: ContextMenuItem[] = [
      {
        id: 'disabled-item',
        label: 'Disabled Item',
        onClick: mockClick,
        disabled: true,
      },
    ];

    render(<ContextMenu {...defaultProps} items={items} />);
    
    fireEvent.click(screen.getByText('Disabled Item'));
    
    expect(mockClick).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('closes menu when clicking outside', async () => {
    render(<ContextMenu {...defaultProps} items={sampleMenuItems} />);
    
    // Click outside the menu
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test('closes menu when pressing Escape key', async () => {
    render(<ContextMenu {...defaultProps} items={sampleMenuItems} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test('handles keyboard navigation', () => {
    const mockClick1 = jest.fn();
    const mockClick2 = jest.fn();
    const items: ContextMenuItem[] = [
      {
        id: 'item1',
        label: 'Item 1',
        onClick: mockClick1,
      },
      {
        id: 'item2',
        label: 'Item 2',
        onClick: mockClick2,
      },
    ];

    render(<ContextMenu {...defaultProps} items={items} />);
    
    // Navigate down and press Enter
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'Enter' });
    
    expect(mockClick1).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('applies correct positioning styles', () => {
    render(<ContextMenu {...defaultProps} position={{ x: 200, y: 300 }} items={sampleMenuItems} />);
    
    const menu = screen.getByRole('menu');
    expect(menu).toHaveStyle({
      left: '200px',
      top: '300px',
    });
  });

  test('applies custom className', () => {
    render(<ContextMenu {...defaultProps} className="custom-menu" items={sampleMenuItems} />);
    
    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('context-menu', 'custom-menu');
  });

  test('has proper ARIA attributes', () => {
    render(<ContextMenu {...defaultProps} items={sampleMenuItems} />);
    
    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('aria-label', 'Context menu');
    expect(menu).toHaveAttribute('tabIndex', '-1');
    
    const menuItems = screen.getAllByRole('menuitem');
    menuItems.forEach(item => {
      expect(item).toHaveAttribute('tabIndex', '-1');
    });
  });

  test('focuses menu when it becomes visible', () => {
    const { rerender } = render(<ContextMenu {...defaultProps} isVisible={false} items={sampleMenuItems} />);
    
    rerender(<ContextMenu {...defaultProps} isVisible={true} items={sampleMenuItems} />);
    
    const menu = screen.getByRole('menu');
    expect(menu).toHaveFocus();
  });
});