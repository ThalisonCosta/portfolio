/** @jsxImportSource react */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectsApp, type GitHubRepository, type GitHubUser, type PinnedRepository } from '../ProjectsApp';

// Mock useDesktopStore
const mockUseDesktopStore = {
  theme: 'light',
};

jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: () => mockUseDesktopStore,
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock data
const mockGitHubUser: GitHubUser = {
  login: 'ThalisonCosta',
  name: 'Thalison Costa',
  bio: 'Full Stack Developer',
  avatar_url: 'https://avatars.githubusercontent.com/u/123456',
  public_repos: 25,
  followers: 100,
  following: 50,
  company: 'Tech Company',
  location: 'Brazil',
  blog: 'https://example.com',
  html_url: 'https://github.com/ThalisonCosta',
};

const mockRepositories: GitHubRepository[] = [
  {
    id: 1,
    name: 'awesome-project',
    full_name: 'ThalisonCosta/awesome-project',
    description: 'An awesome React project',
    html_url: 'https://github.com/ThalisonCosta/awesome-project',
    stargazers_count: 50,
    forks_count: 10,
    language: 'TypeScript',
    topics: ['react', 'typescript', 'frontend'],
    updated_at: '2024-01-15T10:00:00Z',
    created_at: '2023-12-01T10:00:00Z',
    pushed_at: '2024-01-15T10:00:00Z',
    homepage: 'https://awesome-project.com',
    archived: false,
    disabled: false,
    fork: false,
  },
  {
    id: 2,
    name: 'backend-api',
    full_name: 'ThalisonCosta/backend-api',
    description: 'Node.js API server',
    html_url: 'https://github.com/ThalisonCosta/backend-api',
    stargazers_count: 25,
    forks_count: 5,
    language: 'JavaScript',
    topics: ['nodejs', 'api', 'backend'],
    updated_at: '2024-01-10T10:00:00Z',
    created_at: '2023-11-01T10:00:00Z',
    pushed_at: '2024-01-10T10:00:00Z',
    homepage: null,
    archived: false,
    disabled: false,
    fork: false,
  },
  {
    id: 3,
    name: 'fork-project',
    full_name: 'ThalisonCosta/fork-project',
    description: 'Forked repository',
    html_url: 'https://github.com/ThalisonCosta/fork-project',
    stargazers_count: 0,
    forks_count: 0,
    language: 'Python',
    topics: [],
    updated_at: '2024-01-05T10:00:00Z',
    created_at: '2023-10-01T10:00:00Z',
    pushed_at: '2024-01-05T10:00:00Z',
    homepage: null,
    archived: false,
    disabled: false,
    fork: true, // This should be filtered out
  },
];

const mockPinnedRepos: PinnedRepository[] = [
  {
    owner: 'ThalisonCosta',
    repo: 'awesome-project',
    description: 'An awesome React project',
    language: 'TypeScript',
    languageColor: '#2b7489',
    stars: 50,
    forks: 10,
    link: 'https://github.com/ThalisonCosta/awesome-project',
  },
];

describe('ProjectsApp Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setupSuccessfulFetch = () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGitHubUser),
      }) // User profile
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPinnedRepos),
      }) // Pinned repos
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepositories),
      }); // Repositories
  };

  test('displays loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<ProjectsApp />);

    expect(screen.getByText('Loading GitHub repositories...')).toBeInTheDocument();
    expect(document.querySelector('.projects-loading-spinner')).toBeInTheDocument();
  });

  test('renders user profile and repositories after loading', async () => {
    setupSuccessfulFetch();
    render(<ProjectsApp />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading GitHub repositories...')).not.toBeInTheDocument();
    });

    // Check user profile
    expect(screen.getByText('Thalison Costa')).toBeInTheDocument();
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => {
        return !!(element?.className === 'projects-stat' && element?.textContent?.includes('25 repositories'));
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => {
        return !!(element?.className === 'projects-stat' && element?.textContent?.includes('100 followers'));
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => {
        return !!(element?.className === 'projects-stat' && element?.textContent?.includes('50 following'));
      })
    ).toBeInTheDocument();

    // Check repository cards (should exclude forks)
    expect(screen.getByText('awesome-project')).toBeInTheDocument();
    expect(screen.getByText('backend-api')).toBeInTheDocument();
    expect(screen.queryByText('fork-project')).not.toBeInTheDocument();

    // Check pinned badge
    expect(screen.getByText('📌 Pinned')).toBeInTheDocument();
  });

  test('displays error state when API calls fail', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'));
    render(<ProjectsApp />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Projects')).toBeInTheDocument();
      expect(screen.getByText(/API Error/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  test('handles search functionality correctly', async () => {
    setupSuccessfulFetch();
    const user = userEvent.setup();
    render(<ProjectsApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading GitHub repositories...')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search repositories...');
    expect(searchInput).toBeInTheDocument();

    // Search for "awesome"
    await user.type(searchInput, 'awesome');

    await waitFor(() => {
      expect(screen.getByText('awesome-project')).toBeInTheDocument();
      expect(screen.queryByText('backend-api')).not.toBeInTheDocument();
    });

    // Clear search
    await user.clear(searchInput);
    await user.type(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText('No repositories found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument();
    });
  });

  test('handles language filtering correctly', async () => {
    setupSuccessfulFetch();
    const user = userEvent.setup();
    render(<ProjectsApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading GitHub repositories...')).not.toBeInTheDocument();
    });

    const languageSelect = screen.getByDisplayValue('All Languages');
    expect(languageSelect).toBeInTheDocument();

    // Filter by TypeScript
    await user.selectOptions(languageSelect, 'TypeScript');

    await waitFor(() => {
      expect(screen.getByText('awesome-project')).toBeInTheDocument();
      expect(screen.queryByText('backend-api')).not.toBeInTheDocument();
    });

    // Filter by JavaScript
    await user.selectOptions(languageSelect, 'JavaScript');

    await waitFor(() => {
      expect(screen.queryByText('awesome-project')).not.toBeInTheDocument();
      expect(screen.getByText('backend-api')).toBeInTheDocument();
    });
  });

  test('handles sorting functionality correctly', async () => {
    setupSuccessfulFetch();
    const user = userEvent.setup();
    render(<ProjectsApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading GitHub repositories...')).not.toBeInTheDocument();
    });

    const sortSelect = screen.getByDisplayValue('Sort by Stars');
    expect(sortSelect).toBeInTheDocument();

    // Sort by name
    await user.selectOptions(sortSelect, 'name');

    await waitFor(() => {
      const repoCards = screen.getAllByText(/awesome-project|backend-api/);
      expect(repoCards[0]).toHaveTextContent('awesome-project'); // Should be first alphabetically
    });

    // Sort by forks
    await user.selectOptions(sortSelect, 'forks');

    await waitFor(() => {
      const repoCards = screen.getAllByText(/awesome-project|backend-api/);
      expect(repoCards[0]).toHaveTextContent('awesome-project'); // Has more forks
    });
  });

  test('opens repository in new tab when clicked', async () => {
    setupSuccessfulFetch();
    const mockOpen = jest.fn();
    const originalOpen = window.open;
    window.open = mockOpen;

    render(<ProjectsApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading GitHub repositories...')).not.toBeInTheDocument();
    });

    const repoCard = screen.getByText('awesome-project').closest('.projects-repo-card');
    expect(repoCard).toBeInTheDocument();

    fireEvent.click(repoCard!);

    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/ThalisonCosta/awesome-project',
      '_blank',
      'noopener,noreferrer'
    );

    window.open = originalOpen;
  });

  test('refresh button triggers data reload', async () => {
    setupSuccessfulFetch();
    const user = userEvent.setup();
    render(<ProjectsApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading GitHub repositories...')).not.toBeInTheDocument();
    });

    // Setup second fetch call for refresh
    setupSuccessfulFetch();

    const refreshButton = screen.getByTitle('Refresh repositories');
    expect(refreshButton).toBeInTheDocument();

    await user.click(refreshButton);

    // Should call API again
    expect(mockFetch).toHaveBeenCalledTimes(6); // 3 initial + 3 refresh
  });

  test('displays repository statistics correctly', async () => {
    setupSuccessfulFetch();
    render(<ProjectsApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading GitHub repositories...')).not.toBeInTheDocument();
    });

    // Check statistics in header (should exclude forks) - uses total repo count from API
    expect(
      screen.getByText((_, element) => {
        return !!(element?.className === 'projects-subtitle' && element?.textContent?.includes('3 repositories'));
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => {
        return !!(element?.className === 'projects-subtitle' && element?.textContent?.includes('75 stars'));
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => {
        return !!(element?.className === 'projects-subtitle' && element?.textContent?.includes('1 pinned'));
      })
    ).toBeInTheDocument();
  });

  test('handles repository topics display', async () => {
    setupSuccessfulFetch();
    render(<ProjectsApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading GitHub repositories...')).not.toBeInTheDocument();
    });

    // Check topics are displayed
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('nodejs')).toBeInTheDocument();
    expect(screen.getByText('api')).toBeInTheDocument();
    expect(screen.getByText('backend')).toBeInTheDocument();
  });

  test('handles language colors correctly', async () => {
    setupSuccessfulFetch();
    render(<ProjectsApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading GitHub repositories...')).not.toBeInTheDocument();
    });

    // Check that language dots exist and have colors
    const languageDots = document.querySelectorAll('.projects-language-dot');
    expect(languageDots.length).toBeGreaterThan(0);

    // Check that dots have background colors
    languageDots.forEach((dot) => {
      const style = window.getComputedStyle(dot);
      expect(style.backgroundColor).toBeTruthy();
    });
  });

  test('displays correct updated dates', async () => {
    setupSuccessfulFetch();
    render(<ProjectsApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading GitHub repositories...')).not.toBeInTheDocument();
    });

    // Check that updated dates are displayed
    expect(screen.getByText(/Updated 1\/15\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/Updated 1\/10\/2024/)).toBeInTheDocument();
  });

  test('applies theme classes correctly', async () => {
    setupSuccessfulFetch();
    render(<ProjectsApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading GitHub repositories...')).not.toBeInTheDocument();
    });

    const appContainer = screen.getByText('Projects').closest('.projects-app');
    expect(appContainer).toHaveClass('light');
  });

  test('handles accessibility attributes correctly', async () => {
    setupSuccessfulFetch();
    render(<ProjectsApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading GitHub repositories...')).not.toBeInTheDocument();
    });

    // Check search input accessibility
    const searchInput = screen.getByPlaceholderText('Search repositories...');
    expect(searchInput).toHaveAttribute('type', 'text');

    // Check refresh button accessibility
    const refreshButton = screen.getByTitle('Refresh repositories');
    expect(refreshButton).toBeInTheDocument();

    // Check avatar accessibility
    const avatar = screen.getByAltText('Thalison Costa avatar');
    expect(avatar).toBeInTheDocument();
  });
});
