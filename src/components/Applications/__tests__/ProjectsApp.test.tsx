/** @jsxImportSource react */
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectsApp } from '../ProjectsApp';

// Mock useDesktopStore
const mockUseDesktopStore = {
  theme: 'light',
};

jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: () => mockUseDesktopStore,
}));

describe('ProjectsApp Component', () => {
  beforeEach(() => {
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders projects showcase correctly', () => {
    render(<ProjectsApp />);

    // Check header content
    expect(screen.getByText('My Projects')).toBeInTheDocument();
    expect(screen.getByText('A showcase of my real-world applications and development work')).toBeInTheDocument();

    // Check statistics - use more specific selectors
    const statNumbers = screen.getAllByText('2');
    expect(statNumbers).toHaveLength(3); // Total projects, Live, Featured
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();

    // Check project cards
    expect(screen.getByText('Qualvaiser')).toBeInTheDocument();
    expect(screen.getByText('Windows Desktop Portfolio')).toBeInTheDocument();

    // Check project descriptions
    expect(screen.getByText(/Modern financial management platform/)).toBeInTheDocument();
    expect(screen.getByText(/Interactive Windows 11-inspired portfolio/)).toBeInTheDocument();
  });

  test('displays featured badges correctly', () => {
    render(<ProjectsApp />);

    // Both projects should be featured
    const featuredBadges = screen.getAllByText('⭐ Featured');
    expect(featuredBadges).toHaveLength(2);
  });

  test('displays project status indicators', () => {
    render(<ProjectsApp />);

    // Both projects should be live
    const liveStatuses = screen.getAllByText(/Live/);
    expect(liveStatuses.length).toBeGreaterThanOrEqual(2);
  });

  test('displays technology tags with colors', () => {
    render(<ProjectsApp />);

    // Check for technology tags - there are multiple React and TypeScript tags
    const reactTags = screen.getAllByText('React');
    expect(reactTags.length).toBeGreaterThanOrEqual(1);

    const typescriptTags = screen.getAllByText('TypeScript');
    expect(typescriptTags.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Vite')).toBeInTheDocument();

    // Check that technology tags have style attributes (colors)
    const techTags = document.querySelectorAll('.projects-tech-tag');
    expect(techTags.length).toBeGreaterThan(0);

    techTags.forEach((tag) => {
      expect(tag).toHaveAttribute('style');
    });
  });

  test('handles search functionality correctly', async () => {
    const user = userEvent.setup();
    render(<ProjectsApp />);

    const searchInput = screen.getByPlaceholderText('Search projects, technologies...');
    expect(searchInput).toBeInTheDocument();

    // Search for "Qualvaiser"
    await user.type(searchInput, 'Qualvaiser');

    expect(screen.getByText('Qualvaiser')).toBeInTheDocument();
    expect(screen.queryByText('Windows Desktop Portfolio')).not.toBeInTheDocument();

    // Clear search and search for "React"
    await user.clear(searchInput);
    await user.type(searchInput, 'React');

    // Both projects use React
    expect(screen.getByText('Qualvaiser')).toBeInTheDocument();
    expect(screen.getByText('Windows Desktop Portfolio')).toBeInTheDocument();

    // Search for non-existent term
    await user.clear(searchInput);
    await user.type(searchInput, 'nonexistent');

    expect(screen.getByText('No projects found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument();
  });

  test('handles category filtering correctly', async () => {
    const user = userEvent.setup();
    render(<ProjectsApp />);

    const categorySelect = screen.getByDisplayValue('All Categories');
    expect(categorySelect).toBeInTheDocument();

    // Filter by web category (both projects are web)
    await user.selectOptions(categorySelect, 'web');

    expect(screen.getByText('Qualvaiser')).toBeInTheDocument();
    expect(screen.getByText('Windows Desktop Portfolio')).toBeInTheDocument();
  });

  test('handles sorting functionality correctly', async () => {
    const user = userEvent.setup();
    render(<ProjectsApp />);

    const sortSelect = screen.getByDisplayValue('Sort by Featured');
    expect(sortSelect).toBeInTheDocument();

    // Sort by name
    await user.selectOptions(sortSelect, 'name');

    const projectCards = screen.getAllByText(/Qualvaiser|Windows Desktop Portfolio/);
    // Should be sorted alphabetically: Qualvaiser, Windows Desktop Portfolio
    expect(projectCards[0]).toHaveTextContent('Qualvaiser');

    // Sort by recent
    await user.selectOptions(sortSelect, 'recent');

    // Both projects should still be visible
    expect(screen.getByText('Qualvaiser')).toBeInTheDocument();
    expect(screen.getByText('Windows Desktop Portfolio')).toBeInTheDocument();
  });

  test('opens project website in new tab when clicked', async () => {
    const mockOpen = jest.fn();
    const originalOpen = window.open;
    window.open = mockOpen;

    render(<ProjectsApp />);

    const qualvaiserCard = screen.getByText('Qualvaiser').closest('.projects-project-card');
    expect(qualvaiserCard).toBeInTheDocument();

    fireEvent.click(qualvaiserCard!);

    expect(mockOpen).toHaveBeenCalledWith('https://qualvaiser.com/', '_blank', 'noopener,noreferrer');

    window.open = originalOpen;
  });

  test('opens source code link correctly', async () => {
    const mockOpen = jest.fn();
    const originalOpen = window.open;
    window.open = mockOpen;

    render(<ProjectsApp />);

    // Only Windows Desktop Portfolio has source code URL
    const sourceButtons = screen.getAllByTitle('View Source Code');
    expect(sourceButtons).toHaveLength(1);

    fireEvent.click(sourceButtons[0]);

    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/ThalisonCosta/windows-desktop-portfolio',
      '_blank',
      'noopener,noreferrer'
    );

    window.open = originalOpen;
  });

  test('displays project features correctly', () => {
    render(<ProjectsApp />);

    // Check for key features sections
    const featuresHeaders = screen.getAllByText('Key Features:');
    expect(featuresHeaders).toHaveLength(2);

    // Check for specific features
    expect(screen.getByText('Real-time expense tracking')).toBeInTheDocument();
    expect(screen.getByText('Windows 11-style interface')).toBeInTheDocument();
    expect(screen.getByText('Interactive desktop environment')).toBeInTheDocument();
  });

  test('displays updated dates correctly', () => {
    render(<ProjectsApp />);

    // Check that updated dates are displayed - use getAllByText for multiple elements
    const updatedTexts = screen.getAllByText(/Updated.*2024/);
    expect(updatedTexts.length).toBe(2);

    // Check that there are update date elements
    const updatedElements = document.querySelectorAll('.projects-project-updated');
    expect(updatedElements.length).toBe(2);
  });

  test('applies theme classes correctly', () => {
    render(<ProjectsApp />);

    const appContainer = screen.getByText('My Projects').closest('.projects-app');
    expect(appContainer).toHaveClass('light');
  });

  test('displays website preview placeholders', () => {
    render(<ProjectsApp />);

    const previewPlaceholders = screen.getAllByText('🌐 Click to visit website');
    expect(previewPlaceholders).toHaveLength(2);
  });

  test('shows project categories correctly', () => {
    render(<ProjectsApp />);

    const categoryTags = screen.getAllByText('web');
    expect(categoryTags).toHaveLength(2); // Both projects are web category
  });

  test('handles accessibility attributes correctly', () => {
    render(<ProjectsApp />);

    // Check search input accessibility
    const searchInput = screen.getByPlaceholderText('Search projects, technologies...');
    expect(searchInput).toHaveAttribute('type', 'text');

    // Check source code button accessibility
    const sourceButton = screen.getByTitle('View Source Code');
    expect(sourceButton).toBeInTheDocument();
  });
});
