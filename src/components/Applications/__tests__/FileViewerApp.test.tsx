/** @jsxImportSource react */
import { render, screen } from '@testing-library/react';
import { TextEditorApp } from '../TextEditorApp';

describe('TextEditorApp Component', () => {
  test('renders text editor content', () => {
    render(<TextEditorApp />);

    expect(screen.getByText('Text Editor')).toBeInTheDocument();
    expect(
      screen.getByText("Welcome to my portfolio! I'm a passionate developer with experience in:")
    ).toBeInTheDocument();
  });

  test('displays developer skills list', () => {
    render(<TextEditorApp />);

    expect(screen.getByText('React & TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js & Python')).toBeInTheDocument();
    expect(screen.getByText('Modern web technologies')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
  });

  test('has proper container styling', () => {
    const { container } = render(<TextEditorApp />);
    const appContainer = container.firstChild;

    expect(appContainer).toHaveStyle({
      padding: '16px',
      height: '100%',
      overflow: 'auto',
    });
  });

  test('includes portfolio description', () => {
    render(<TextEditorApp />);

    expect(
      screen.getByText('This desktop environment showcases my skills in creating interactive web applications.')
    ).toBeInTheDocument();
  });

  test('renders as a list with proper structure', () => {
    render(<TextEditorApp />);

    const skillsList = screen.getByRole('list');
    expect(skillsList).toBeInTheDocument();

    const skillItems = screen.getAllByRole('listitem');
    expect(skillItems).toHaveLength(4);
  });
});
