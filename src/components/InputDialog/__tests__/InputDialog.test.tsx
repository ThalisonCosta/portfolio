/** @jsxImportSource react */
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { InputDialog } from '../InputDialog';

describe('InputDialog Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    isVisible: true,
    title: 'Test Dialog',
    label: 'Enter name:',
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
    render(<InputDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Enter name:')).toBeInTheDocument();
  });

  test('does not render when not visible', () => {
    render(<InputDialog {...defaultProps} isVisible={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders with initial value', () => {
    render(<InputDialog {...defaultProps} initialValue="test value" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test value');
  });

  test('renders with placeholder', () => {
    render(<InputDialog {...defaultProps} placeholder="Enter text here" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text here');
  });

  test('updates input value when typing', () => {
    render(<InputDialog {...defaultProps} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(input).toHaveValue('new value');
  });

  test('shows character count', () => {
    render(<InputDialog {...defaultProps} maxLength={10} />);

    expect(screen.getByText('10 characters remaining')).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(screen.getByText('6 characters remaining')).toBeInTheDocument();
  });

  test('calls onConfirm when OK button is clicked with valid input', () => {
    render(<InputDialog {...defaultProps} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);

    expect(mockOnConfirm).toHaveBeenCalledWith('test value');
  });

  test('calls onCancel when Cancel button is clicked', () => {
    render(<InputDialog {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('validates required input', () => {
    render(<InputDialog {...defaultProps} required={true} />);

    const okButton = screen.getByText('OK');

    // OK button should be disabled when input is empty and required
    expect(okButton).toBeDisabled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  test('validates max length', () => {
    render(<InputDialog {...defaultProps} maxLength={5} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'toolong' } });

    const okButton = screen.getByText('OK');

    // OK button should be disabled when input exceeds max length
    expect(okButton).toBeDisabled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  test('uses custom validation function', () => {
    const customValidate = jest.fn((value: string) => (value === 'invalid' ? 'Custom error message' : null));

    render(<InputDialog {...defaultProps} validate={customValidate} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'invalid' } });

    const okButton = screen.getByText('OK');

    // OK button should be disabled when custom validation fails
    expect(okButton).toBeDisabled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  test('validates and enables OK button when input becomes valid', () => {
    render(<InputDialog {...defaultProps} required={true} />);

    const okButton = screen.getByText('OK');
    const input = screen.getByRole('textbox');

    // Initially OK button should be disabled for required empty input
    expect(okButton).toBeDisabled();

    // Start typing to make input valid
    fireEvent.change(input, { target: { value: 'valid input' } });

    // OK button should now be enabled
    expect(okButton).toBeEnabled();
  });

  test('handles Enter key to confirm', async () => {
    render(<InputDialog {...defaultProps} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    fireEvent.keyDown(document, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('test value');
    });
  });

  test('handles Escape key to cancel', async () => {
    render(<InputDialog {...defaultProps} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  test('handles click outside to cancel', async () => {
    render(<InputDialog {...defaultProps} />);

    // Click outside the dialog
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  test('focuses input when dialog becomes visible', async () => {
    const { rerender } = render(<InputDialog {...defaultProps} isVisible={false} />);

    rerender(<InputDialog {...defaultProps} isVisible={true} />);

    await waitFor(() => {
      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });
  });

  test('disables OK button when input is invalid', () => {
    render(<InputDialog {...defaultProps} required={true} />);

    const okButton = screen.getByText('OK');
    expect(okButton).toBeDisabled();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'valid input' } });

    expect(okButton).toBeEnabled();
  });

  test('trims whitespace on confirm', () => {
    render(<InputDialog {...defaultProps} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '  test value  ' } });

    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);

    expect(mockOnConfirm).toHaveBeenCalledWith('test value');
  });

  test('has proper ARIA attributes', () => {
    render(<InputDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby');
  });

  test('shows proper ARIA attributes for invalid input', () => {
    render(<InputDialog {...defaultProps} required={true} />);

    const input = screen.getByRole('textbox');

    // Input should have aria-invalid=false initially and when invalid but no error shown
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAttribute('aria-describedby', 'input-hint');
  });

  test('resets state when dialog becomes visible again', () => {
    const { rerender } = render(<InputDialog {...defaultProps} isVisible={true} initialValue="initial" />);

    // Change the input value
    let input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'changed' } });
    expect(input).toHaveValue('changed');

    // Hide and show dialog again
    rerender(<InputDialog {...defaultProps} isVisible={false} initialValue="new initial" />);
    rerender(<InputDialog {...defaultProps} isVisible={true} initialValue="new initial" />);

    // Get the input again after rerender
    input = screen.getByRole('textbox');
    expect(input).toHaveValue('new initial');
  });
});
