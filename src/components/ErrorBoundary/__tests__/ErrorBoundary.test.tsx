/** @jsxImportSource react */
import { render, fireEvent, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Mock console.error to prevent error output during tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child component')).toBeInTheDocument();
  });

  test('renders error fallback UI when child component throws error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An error occurred while rendering this component.')).toBeInTheDocument();
  });

  test('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('⚠️ Something went wrong')).not.toBeInTheDocument();
  });

  test('displays error details in collapsible section', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const detailsElement = screen.getByText('View Error Details');
    expect(detailsElement).toBeInTheDocument();

    // Click to expand details
    fireEvent.click(detailsElement);

    // Check that error message is displayed
    expect(screen.getByText(/Test error message/)).toBeInTheDocument();
  });

  test('retry button resets error state', () => {
    let throwError = true;

    // Component that can be controlled externally
    const ControllableComponent = () => {
      if (throwError) {
        throw new Error('Controlled test error');
      }
      return <div>No error</div>;
    };

    render(
      <ErrorBoundary>
        <ControllableComponent />
      </ErrorBoundary>
    );

    // Error boundary should show error UI
    expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();

    // Change the external state so component won't throw next time
    throwError = false;

    // Click retry button to reset the error boundary
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // After retry, the component should render successfully
    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('⚠️ Something went wrong')).not.toBeInTheDocument();
  });

  test('logs error to console when error occurs', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith('ErrorBoundary caught an error:', expect.any(Error), expect.any(Object));

    consoleSpy.mockRestore();
  });

  test('error boundary catches errors from deeply nested components', () => {
    const DeepChild = () => <ThrowError shouldThrow={true} />;
    const MiddleChild = () => <DeepChild />;

    render(
      <ErrorBoundary>
        <div>
          <MiddleChild />
        </div>
      </ErrorBoundary>
    );

    expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();
  });

  test('multiple error boundaries work independently', () => {
    render(
      <div>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
        <ErrorBoundary>
          <div>Working component</div>
        </ErrorBoundary>
      </div>
    );

    // First boundary should show error
    expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();

    // Second boundary should show working component
    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  test('error boundary preserves component tree structure', () => {
    render(
      <div data-testid="parent">
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
        <div data-testid="sibling">Sibling component</div>
      </div>
    );

    // Parent and sibling should still be rendered
    expect(screen.getByTestId('parent')).toBeInTheDocument();
    expect(screen.getByTestId('sibling')).toBeInTheDocument();

    // Error boundary should show error UI
    expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();
  });

  test('error boundary has proper styling and accessibility', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByText('⚠️ Something went wrong').parentElement;

    // Check that it has error styling
    expect(errorContainer).toHaveStyle({
      color: '#c62828',
      textAlign: 'center',
    });

    // Check that retry button has proper styling
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toHaveStyle({
      backgroundColor: '#1976d2',
      color: 'white',
      cursor: 'pointer',
    });
  });
});
