/** @jsxImportSource react */
import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Child components to wrap with error boundary */
  children: ReactNode;
  /** Optional fallback component to display when an error occurs */
  fallback?: ReactNode;
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that occurred */
  error?: Error;
  /** Additional error information */
  errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * This follows React's error boundary pattern to provide better error handling and user experience
 * when components fail to render properly.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error for debugging purposes
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error information
    this.setState({
      error,
      errorInfo,
    });

    // You could also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  /**
   * Resets the error boundary state to retry rendering
   */
  private handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: '20px',
            margin: '20px',
            border: '2px solid #ff6b6b',
            borderRadius: '8px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <h2 style={{ marginTop: 0, color: '#c62828' }}>⚠️ Something went wrong</h2>
          <p>An error occurred while rendering this component.</p>
          <details style={{ marginTop: '16px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>View Error Details</summary>
            <pre
              style={{
                backgroundColor: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                color: '#333',
              }}
            >
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button
            onClick={this.handleRetry}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
