/** @jsxImportSource react */
import { render, screen } from '@testing-library/react';
import { PDFViewerApp } from '../PDFViewerApp';

describe('PDFViewerApp Component', () => {
  test('renders PDF viewer title', () => {
    render(<PDFViewerApp />);

    expect(screen.getByText('PDF Viewer - Resume')).toBeInTheDocument();
  });

  test('displays functionality coming soon message', () => {
    render(<PDFViewerApp />);

    expect(screen.getByText('PDF viewing functionality would be implemented here.')).toBeInTheDocument();
  });

  test('mentions resume PDF display', () => {
    render(<PDFViewerApp />);

    expect(screen.getByText('This would display the resume PDF file.')).toBeInTheDocument();
  });
});
