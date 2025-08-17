/** @jsxImportSource react */
import { render, screen, fireEvent } from '@testing-library/react';
import { AboutApp } from '../AboutApp';

// Mock the useDesktopStore hook
jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: () => ({
    theme: 'light',
  }),
}));

// Mock window.open for CV preview functionality
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
});

// Mock document.createElement for CV download functionality
const mockClick = jest.fn();
const mockCreateElement = jest.fn(() => ({
  href: '',
  download: '',
  click: mockClick,
}));
Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
});

describe('AboutApp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders about app with correct basic information', () => {
    render(<AboutApp />);

    expect(screen.getByText('Thalison Costa')).toBeInTheDocument();
    expect(screen.getByText('Software Developer')).toBeInTheDocument();
    expect(screen.getByText('📍 Location')).toBeInTheDocument();
  });

  test('renders all main sections', () => {
    render(<AboutApp />);

    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Curriculum Vitae')).toBeInTheDocument();
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('About Me')).toBeInTheDocument();
  });

  test('renders contact links with correct attributes', () => {
    render(<AboutApp />);

    // Check email link
    const emailLink = screen.getByRole('link', { name: /send email/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:your.email@example.com');

    // Check GitHub link
    const githubLink = screen.getByRole('link', { name: /visit github profile/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/ThalisonCosta');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Check LinkedIn link
    const linkedinLink = screen.getByRole('link', { name: /visit linkedin profile/i });
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/your-profile');
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders CV action buttons', () => {
    render(<AboutApp />);

    const viewButton = screen.getByRole('button', { name: /preview cv in browser/i });
    const downloadButton = screen.getByRole('button', { name: /download cv as pdf/i });

    expect(viewButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
  });

  test('handles CV preview functionality', () => {
    render(<AboutApp />);

    const viewButton = screen.getByRole('button', { name: /preview cv in browser/i });
    fireEvent.click(viewButton);

    expect(mockWindowOpen).toHaveBeenCalledWith('/cv.pdf', '_blank', 'noopener,noreferrer');
  });

  test('handles CV download functionality', () => {
    render(<AboutApp />);

    const downloadButton = screen.getByRole('button', { name: /download cv as pdf/i });
    fireEvent.click(downloadButton);

    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
  });

  test('renders technical skills sections', () => {
    render(<AboutApp />);

    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Tools & Other')).toBeInTheDocument();

    // Check some skill tags
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Git')).toBeInTheDocument();
  });

  test('renders about description', () => {
    render(<AboutApp />);

    expect(screen.getByText(/Passionate software developer/)).toBeInTheDocument();
    expect(screen.getByText(/Currently working on various projects/)).toBeInTheDocument();
  });

  test('applies correct CSS classes for theming', () => {
    render(<AboutApp />);

    const aboutApp = screen.getByText('Thalison Costa').closest('.about-app');
    expect(aboutApp).toHaveClass('about-app', 'light');
  });

  test('has proper accessibility attributes', () => {
    render(<AboutApp />);

    // Check aria-labels are present
    const emailLink = screen.getByLabelText('Send email');
    const githubLink = screen.getByLabelText('Visit GitHub profile');
    const linkedinLink = screen.getByLabelText('Visit LinkedIn profile');
    const viewButton = screen.getByLabelText('Preview CV in browser');
    const downloadButton = screen.getByLabelText('Download CV as PDF');

    expect(emailLink).toBeInTheDocument();
    expect(githubLink).toBeInTheDocument();
    expect(linkedinLink).toBeInTheDocument();
    expect(viewButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
  });
});