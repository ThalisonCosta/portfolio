import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { useDesktopStore } from '../../stores/useDesktopStore';

// Lazy load application components for better performance
const FileViewerApp = lazy(() =>
  import('../Applications/FileViewerApp').then((module) => ({ default: module.FileViewerApp }))
);
const TextEditorApp = lazy(() =>
  import('../Applications/TextEditorApp').then((module) => ({ default: module.TextEditorApp }))
);
const FileExplorerApp = lazy(() =>
  import('../Applications/FileExplorerApp').then((module) => ({ default: module.FileExplorerApp }))
);
const TerminalApp = lazy(() =>
  import('../Applications/TerminalApp').then((module) => ({ default: module.TerminalApp }))
);
const ContactFormApp = lazy(() =>
  import('../Applications/ContactFormApp').then((module) => ({ default: module.ContactFormApp }))
);
const PDFViewerApp = lazy(() =>
  import('../Applications/PDFViewerApp').then((module) => ({ default: module.PDFViewerApp }))
);
const MarkdownViewerApp = lazy(() =>
  import('../Applications/MarkdownViewerApp').then((module) => ({ default: module.MarkdownViewerApp }))
);
const CalculatorApp = lazy(() =>
  import('../Applications/CalculatorApp').then((module) => ({ default: module.CalculatorApp }))
);
const DefaultApp = lazy(() => import('../Applications/DefaultApp'));
const SettingsApp = lazy(() =>
  import('../Applications/SettingsApp').then((module) => ({ default: module.SettingsApp }))
);

/**
 * Props for the ApplicationManager component
 */
interface ApplicationManagerProps {
  /** The name of the component/application to render */
  component: string;
  /** The unique ID of the window containing this application */
  windowId: string;
}

/**
 * ApplicationManager component that renders different applications based on the component name.
 * Acts as a factory for creating application instances within windows.
 *
 * @param props - The component props
 * @param props.component - The name identifier of the application to render
 * @param props.windowId - The unique ID of the containing window
 */
export const ApplicationManager: React.FC<ApplicationManagerProps> = ({ component, windowId }) => {
  const { windows } = useDesktopStore();
  const window = windows.find((w) => w.id === windowId);
  const filePath = window?.filePath;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate application loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [component]);

  const renderApplication = () => {
    try {
      switch (component) {
        case 'TextEditor':
          return <TextEditorApp filePath={filePath} />;
        case 'FileViewer':
          return <FileViewerApp filePath={filePath} />;
        case 'FileExplorer':
        case 'explorer':
          return <FileExplorerApp />;
        case 'Terminal':
        case 'terminal':
          return <TerminalApp />;
        case 'ContactForm':
        case 'contact':
          return <ContactFormApp />;
        case 'PDFViewer':
          return <PDFViewerApp />;
        case 'MarkdownViewer':
          return <MarkdownViewerApp />;
        case 'calculator':
          return <CalculatorApp />;
        case 'SettingsApp':
        case 'settings':
          return <SettingsApp />;
        default:
          return <DefaultApp component={component} />;
      }
    } catch {
      setError(`Failed to load application: ${component}`);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="application-container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #0078d4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p>Loading {component}...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="application-container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            gap: '12px',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h3 style={{ margin: 0, color: '#d32f2f' }}>Application Error</h3>
          <p style={{ margin: 0, color: '#666' }}>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 300);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0078d4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="application-container">
      <ErrorBoundary>
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #0078d4',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ margin: 0 }}>Loading application...</p>
            </div>
          }
        >
          {renderApplication()}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
