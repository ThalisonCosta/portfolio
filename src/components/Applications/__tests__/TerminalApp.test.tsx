/** @jsxImportSource react */
import { render, screen } from '@testing-library/react';
import { TerminalApp } from '../TerminalApp';

describe('TerminalApp Component', () => {
  test('renders terminal welcome message', () => {
    render(<TerminalApp />);

    expect(screen.getByText('Windows Desktop Portfolio Terminal v1.0')).toBeInTheDocument();
  });

  test('displays help instruction', () => {
    render(<TerminalApp />);

    expect(screen.getByText("Type 'help' for available commands")).toBeInTheDocument();
  });

  test('shows terminal prompt', () => {
    render(<TerminalApp />);

    expect(screen.getByText('portfolio@desktop:~$')).toBeInTheDocument();
  });

  test('has correct terminal styling', () => {
    const { container } = render(<TerminalApp />);
    const terminalDiv = container.firstChild as HTMLElement;

    expect(terminalDiv).toHaveStyle({
      backgroundColor: '#000',
      color: '#00ff00',
      fontFamily: 'monospace',
    });
  });
});
