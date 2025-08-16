import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ColorPicker } from '../ColorPicker/ColorPicker';

// Mock the i18n hook
jest.mock('../../../../../i18n/hooks', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('ColorPicker', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ColorPicker color="#ff0000" onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('#ff0000')).toBeInTheDocument();
  });

  it('displays the current color value', () => {
    render(<ColorPicker color="#0078d4" onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('#0078d4')).toBeInTheDocument();
    expect(screen.getByText('#0078D4')).toBeInTheDocument(); // Hex display
  });

  it('calls onChange when color input changes', () => {
    render(<ColorPicker color="#ff0000" onChange={mockOnChange} />);

    const colorInput = screen.getByDisplayValue('#ff0000');
    fireEvent.change(colorInput, { target: { value: '#00ff00' } });

    expect(mockOnChange).toHaveBeenCalledWith('#00ff00');
  });

  it('shows advanced controls when showAdvanced is true', () => {
    render(<ColorPicker color="#ff0000" onChange={mockOnChange} showAdvanced={true} />);

    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('hides advanced controls when showAdvanced is false', () => {
    render(<ColorPicker color="#ff0000" onChange={mockOnChange} showAdvanced={false} />);

    expect(screen.queryByText('Advanced')).not.toBeInTheDocument();
  });

  it('displays label when provided', () => {
    render(<ColorPicker color="#ff0000" onChange={mockOnChange} label="Test Color" />);

    expect(screen.getByText('Test Color')).toBeInTheDocument();
  });

  it('toggles advanced mode when button is clicked', () => {
    render(<ColorPicker color="#ff0000" onChange={mockOnChange} showAdvanced={true} />);

    const advancedButton = screen.getByText(/Advanced/);
    fireEvent.click(advancedButton);

    // Should show RGB and HSL controls
    expect(screen.getByText('RGB')).toBeInTheDocument();
    expect(screen.getByText('HSL')).toBeInTheDocument();
  });
});
