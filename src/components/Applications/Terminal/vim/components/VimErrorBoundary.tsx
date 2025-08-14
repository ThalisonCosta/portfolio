import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import type { VimTheme } from '../types';

interface VimErrorBoundaryProps {
  children: ReactNode;
  theme: VimTheme;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface VimErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error boundary to catch and handle vim editor crashes
 * Provides graceful fallback UI instead of white screen
 */
export class VimErrorBoundary extends Component<VimErrorBoundaryProps, VimErrorBoundaryState> {
  constructor(props: VimErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): VimErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Vim Editor Error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({ error, errorInfo });
    
    // Report error to parent component if callback provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { theme } = this.props;
      
      const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: theme.background,
        color: theme.foreground,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
        fontSize: '14px',
        padding: '20px',
        textAlign: 'center',
      };

      const errorTitleStyle: React.CSSProperties = {
        color: theme.syntax.keyword,
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '16px',
      };

      const errorMessageStyle: React.CSSProperties = {
        color: theme.foreground,
        marginBottom: '20px',
        maxWidth: '600px',
        wordWrap: 'break-word',
      };

      const buttonStyle: React.CSSProperties = {
        backgroundColor: theme.statusBackground,
        color: theme.statusForeground,
        border: `1px solid ${theme.foreground}`,
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontFamily: 'inherit',
      };

      const detailsStyle: React.CSSProperties = {
        marginTop: '20px',
        padding: '12px',
        backgroundColor: theme.currentLineBackground,
        border: `1px solid ${theme.lineNumber}`,
        borderRadius: '4px',
        fontSize: '12px',
        maxWidth: '800px',
        maxHeight: '200px',
        overflow: 'auto',
        textAlign: 'left',
      };

      return (
        <div style={containerStyle}>
          <div style={errorTitleStyle}>
            🔧 Vim Editor Error
          </div>
          
          <div style={errorMessageStyle}>
            The vim editor encountered an unexpected error and has been safely contained.
            Your work in other applications is not affected.
          </div>
          
          <button 
            style={buttonStyle}
            onClick={this.handleRestart}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = theme.selectionBackground;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = theme.statusBackground;
            }}
          >
            Restart Vim Editor
          </button>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={detailsStyle}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                Error Details (Development Mode)
              </summary>
              <div>
                <strong>Error:</strong> {this.state.error.message}
              </div>
              <div style={{ marginTop: '8px' }}>
                <strong>Stack:</strong>
                <pre style={{ fontSize: '11px', overflow: 'auto' }}>
                  {this.state.error.stack}
                </pre>
              </div>
              {this.state.errorInfo && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Component Stack:</strong>
                  <pre style={{ fontSize: '11px', overflow: 'auto' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}