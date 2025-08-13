/** @jsxImportSource react */
import { render, screen } from '@testing-library/react';
import { MarkdownViewerApp } from '../MarkdownViewerApp';

describe('MarkdownViewerApp Component', () => {
  test('renders skills title', () => {
    render(<MarkdownViewerApp />);

    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  test('displays frontend skills section', () => {
    render(<MarkdownViewerApp />);

    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('React/TypeScript')).toBeInTheDocument();
    expect(screen.getByText('JavaScript/HTML/CSS')).toBeInTheDocument();
    expect(screen.getByText('Vue.js')).toBeInTheDocument();
  });

  test('displays backend skills section', () => {
    render(<MarkdownViewerApp />);

    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Express.js')).toBeInTheDocument();
  });

  test('displays tools skills section', () => {
    render(<MarkdownViewerApp />);

    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Git/GitHub')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
  });
});
