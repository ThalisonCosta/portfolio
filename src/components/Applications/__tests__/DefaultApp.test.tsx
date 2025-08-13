/** @jsxImportSource react */
import { render, screen } from '@testing-library/react';
import { DefaultApp } from '../DefaultApp';

describe('DefaultApp Component', () => {
  test('renders component name as title', () => {
    const component = 'TestComponent';
    render(<DefaultApp component={component} />);

    expect(screen.getByText(component)).toBeInTheDocument();
  });

  test('displays not implemented message', () => {
    const component = 'SomeApp';
    render(<DefaultApp component={component} />);

    expect(screen.getByText('This application is not yet implemented.')).toBeInTheDocument();
  });

  test('handles different component names correctly', () => {
    const { rerender } = render(<DefaultApp component="FirstApp" />);
    expect(screen.getByText('FirstApp')).toBeInTheDocument();

    rerender(<DefaultApp component="SecondApp" />);
    expect(screen.getByText('SecondApp')).toBeInTheDocument();
  });
});
