/** @jsxImportSource react */
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  
  const defaultProps = {
    isVisible: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any event listeners
    document.removeEventListener('keydown', jest.fn());
    document.removeEventListener('mousedown', jest.fn());
  });

  test('renders dialog when visible', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  test('does not render when not visible', () => {
    render(<ConfirmDialog {...defaultProps} isVisible={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders with default button text', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('renders with custom button text', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="Delete" cancelText="Keep" />);
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  test('renders details when provided', () => {
    render(<ConfirmDialog {...defaultProps} details="This action cannot be undone." />);
    
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  test('renders custom icon when provided', () => {
    render(<ConfirmDialog {...defaultProps} icon="🗑️" />);
    
    expect(screen.getByText('🗑️')).toBeInTheDocument();
  });

  test('renders default icon for non-destructive actions', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  test('renders warning icon for destructive actions', () => {
    render(<ConfirmDialog {...defaultProps} destructive={true} />);
    
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  test('applies destructive styling when destructive prop is true', () => {
    render(<ConfirmDialog {...defaultProps} destructive={true} />);
    
    const dialog = screen.getByRole('dialog').firstChild;
    expect(dialog).toHaveClass('confirm-dialog', 'destructive');
  });

  test('renders items list when items are provided', () => {
    const items = ['file1.txt', 'file2.txt', 'file3.txt'];
    render(<ConfirmDialog {...defaultProps} items={items} />);
    
    expect(screen.getByText('3 items to be affected:')).toBeInTheDocument();
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('file2.txt')).toBeInTheDocument();
    expect(screen.getByText('file3.txt')).toBeInTheDocument();
  });

  test('renders single item message when one item provided', () => {
    const items = ['file1.txt'];
    render(<ConfirmDialog {...defaultProps} items={items} />);
    
    expect(screen.getByText('Item to be affected:')).toBeInTheDocument();
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
  });

  test('shows truncated list for many items', () => {
    const items = Array.from({ length: 10 }, (_, i) => `file${i + 1}.txt`);
    render(<ConfirmDialog {...defaultProps} items={items} />);
    
    expect(screen.getByText('10 items to be affected:')).toBeInTheDocument();
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('file5.txt')).toBeInTheDocument();
    expect(screen.getByText('...and 5 more items')).toBeInTheDocument();
    expect(screen.queryByText('file6.txt')).not.toBeInTheDocument();
  });

  test('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const confirmButton = screen.getByText('OK');
    fireEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('handles Enter key to confirm', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    fireEvent.keyDown(document, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
  });

  test('handles Escape key to cancel', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  test('handles click outside to cancel', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    // Click outside the dialog
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  test('focuses confirm button when dialog becomes visible', async () => {
    const { rerender } = render(<ConfirmDialog {...defaultProps} isVisible={false} />);
    
    rerender(<ConfirmDialog {...defaultProps} isVisible={true} />);
    
    await waitFor(() => {
      const confirmButton = screen.getByText('OK');
      expect(confirmButton).toHaveFocus();
    });
  });

  test('has proper ARIA attributes', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
  });

  test('renders destructive button when destructive prop is true', () => {
    render(<ConfirmDialog {...defaultProps} destructive={true} confirmText="Delete" />);
    
    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toHaveClass('confirm-dialog-button-destructive');
  });

  test('renders primary button when destructive prop is false', () => {
    render(<ConfirmDialog {...defaultProps} destructive={false} />);
    
    const okButton = screen.getByText('OK');
    expect(okButton).toHaveClass('confirm-dialog-button-primary');
  });

  test('hides icon when empty string is provided', () => {
    render(<ConfirmDialog {...defaultProps} icon="" />);
    
    expect(screen.queryByText('ℹ️')).not.toBeInTheDocument();
    expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
  });

  test('applies secondary styling to cancel button', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toHaveClass('confirm-dialog-button-secondary');
  });
});