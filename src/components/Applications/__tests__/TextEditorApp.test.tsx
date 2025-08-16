// import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextEditorApp } from '../TextEditorApp';

// Mock the useDesktopStore hook
jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: () => ({
    fileSystem: [],
    updateFileContent: jest.fn(),
  }),
}));

describe('TextEditorApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<TextEditorApp />);
      expect(screen.getByText('📄 untitled.txt')).toBeInTheDocument();
    });

    it('displays toolbar buttons', () => {
      render(<TextEditorApp />);

      expect(screen.getByText('📄 New')).toBeInTheDocument();
      expect(screen.getByText('✏️ Edit')).toBeInTheDocument();
      expect(screen.getByText('🌙')).toBeInTheDocument();
    });

    it('shows file format information', () => {
      render(<TextEditorApp />);

      expect(screen.getByText('Plain Text')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('creates new file when New button is clicked', async () => {
      render(<TextEditorApp />);

      const newButton = screen.getByText('📄 New');
      fireEvent.click(newButton);

      // Should still show untitled.txt after creating new file
      expect(screen.getByText('📄 untitled.txt')).toBeInTheDocument();
    });

    it('toggles between edit and preview modes', async () => {
      render(<TextEditorApp />);

      const editButton = screen.getByText('✏️ Edit');

      fireEvent.click(editButton);

      await waitFor(() => {
        const previewButton = screen.getByText('👁️ Preview');
        expect(previewButton).toBeInTheDocument();
      });
    });

    it('toggles theme', async () => {
      render(<TextEditorApp />);

      const themeButton = screen.getByText('🌙');

      fireEvent.click(themeButton);

      await waitFor(() => {
        expect(screen.getByText('☀️')).toBeInTheDocument();
      });
    });
  });

  describe('File Path Handling', () => {
    it('accepts filePath prop', () => {
      render(<TextEditorApp filePath="/test/path.txt" />);

      // Should render even with a filePath prop
      expect(screen.getByText('📄 untitled.txt')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      render(<TextEditorApp />);

      const newButton = screen.getByText('📄 New').closest('button');
      expect(newButton).toHaveAttribute('title', 'Create new file');
    });

    it('provides file information in an accessible way', () => {
      render(<TextEditorApp />);

      expect(screen.getByText('📄 untitled.txt')).toBeInTheDocument();
      expect(screen.getByText('Plain Text')).toBeInTheDocument();
    });
  });
});
