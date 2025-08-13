/** @jsxImportSource react */
import { render, screen } from '@testing-library/react';
import { FileExplorerApp } from '../FileExplorerApp';

describe('FileExplorerApp Component', () => {
  test('renders file explorer title', () => {
    render(<FileExplorerApp />);

    expect(screen.getByText('File Explorer')).toBeInTheDocument();
  });

  test('displays coming soon message', () => {
    render(<FileExplorerApp />);

    expect(screen.getByText('File explorer functionality coming soon...')).toBeInTheDocument();
  });

  test('shows file and folder structure', () => {
    render(<FileExplorerApp />);

    expect(screen.getByText('📁 Projects')).toBeInTheDocument();
    expect(screen.getByText('📁 Documents')).toBeInTheDocument();
    expect(screen.getByText('📄 Resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('📄 About.txt')).toBeInTheDocument();
  });
});
