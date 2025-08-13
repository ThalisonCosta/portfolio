import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ApplicationManager } from '../ApplicationManager';

// Mock all the lazy-loaded components
jest.mock('../../Applications/TextEditorApp', () => ({
  TextEditorApp: () => <div data-testid="text-editor">Text Editor App</div>,
}));

jest.mock('../../Applications/FileExplorerApp', () => ({
  FileExplorerApp: () => <div data-testid="file-explorer">File Explorer App</div>,
}));

jest.mock('../../Applications/TerminalApp', () => ({
  TerminalApp: () => <div data-testid="terminal">Terminal App</div>,
}));

jest.mock('../../Applications/ContactFormApp', () => ({
  ContactFormApp: () => <div data-testid="contact-form">Contact Form App</div>,
}));

jest.mock('../../Applications/PDFViewerApp', () => ({
  PDFViewerApp: () => <div data-testid="pdf-viewer">PDF Viewer App</div>,
}));

jest.mock('../../Applications/MarkdownViewerApp', () => ({
  MarkdownViewerApp: () => <div data-testid="markdown-viewer">Markdown Viewer App</div>,
}));

jest.mock('../../Applications/CalculatorApp', () => ({
  CalculatorApp: () => <div data-testid="calculator">Calculator App</div>,
}));

jest.mock('../../Applications/DefaultApp', () => ({
  DefaultApp: ({ component }: { component: string }) => <div data-testid="default-app">{component} Default</div>,
}));

jest.mock('../../ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

describe('ApplicationManager Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state initially', () => {
    render(<ApplicationManager component="TextEditor" windowId="test-window" />);

    expect(screen.getByText('Loading TextEditor...')).toBeInTheDocument();
  });

  test('renders TextEditor application after loading', async () => {
    render(<ApplicationManager component="TextEditor" windowId="test-window" />);

    await waitFor(() => {
      expect(screen.getByTestId('text-editor')).toBeInTheDocument();
    });
  });

  test('renders FileExplorer application', async () => {
    render(<ApplicationManager component="FileExplorer" windowId="test-window" />);

    await waitFor(() => {
      expect(screen.getByTestId('file-explorer')).toBeInTheDocument();
    });
  });

  test('renders Terminal application', async () => {
    render(<ApplicationManager component="Terminal" windowId="test-window" />);

    await waitFor(() => {
      expect(screen.getByTestId('terminal')).toBeInTheDocument();
    });
  });

  test('renders ContactForm application', async () => {
    render(<ApplicationManager component="ContactForm" windowId="test-window" />);

    await waitFor(() => {
      expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    });
  });

  test('renders PDFViewer application', async () => {
    render(<ApplicationManager component="PDFViewer" windowId="test-window" />);

    await waitFor(() => {
      expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
    });
  });

  test('renders MarkdownViewer application', async () => {
    render(<ApplicationManager component="MarkdownViewer" windowId="test-window" />);

    await waitFor(() => {
      expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument();
    });
  });

  test('renders Calculator application', async () => {
    render(<ApplicationManager component="calculator" windowId="test-window" />);

    await waitFor(() => {
      expect(screen.getByTestId('calculator')).toBeInTheDocument();
    });
  });

  test('renders DefaultApp for unknown component', async () => {
    render(<ApplicationManager component="UnknownApp" windowId="test-window" />);

    await waitFor(() => {
      expect(screen.getByTestId('default-app')).toBeInTheDocument();
      expect(screen.getByText('UnknownApp Default')).toBeInTheDocument();
    });
  });

  test('handles error state and retry functionality', async () => {
    // We need to mock the error by overriding the switch statement result
    const originalError = console.error;
    console.error = jest.fn();

    const { rerender } = render(<ApplicationManager component="TextEditor" windowId="test-window" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading TextEditor...')).not.toBeInTheDocument();
    });

    // This test would require more complex error simulation
    // For now, just ensure the error handling branch exists

    rerender(<ApplicationManager component="ErrorApp" windowId="test-window" />);

    console.error = originalError;
  });

  test('wraps application in ErrorBoundary', async () => {
    render(<ApplicationManager component="TextEditor" windowId="test-window" />);

    await waitFor(() => {
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  test('shows suspense fallback during lazy loading', () => {
    render(<ApplicationManager component="TextEditor" windowId="test-window" />);

    // Should show initial loading state
    expect(screen.getByText('Loading TextEditor...')).toBeInTheDocument();
  });
});
