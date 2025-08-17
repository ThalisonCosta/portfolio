import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDesktopStore } from '../../stores/useDesktopStore';
import './ProjectsApp.css';

/**
 * GitHub Repository interface
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  created_at: string;
  pushed_at: string;
  homepage: string | null;
  archived: boolean;
  disabled: boolean;
  fork: boolean;
}

/**
 * Pinned Repository interface (from pinned API)
 */
export interface PinnedRepository {
  owner: string;
  repo: string;
  description: string | null;
  language: string | null;
  languageColor: string | null;
  stars: number;
  forks: number;
  link: string;
}

/**
 * GitHub User Profile interface
 */
export interface GitHubUser {
  login: string;
  name: string;
  bio: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  company: string | null;
  location: string | null;
  blog: string | null;
  html_url: string;
}

/**
 * Combined Repository with pinned flag
 */
export interface Repository extends GitHubRepository {
  isPinned?: boolean;
  languageColor?: string;
}

/**
 * Projects application component that displays GitHub repositories
 * with pinned repositories highlighted and comprehensive filtering options.
 */
export const ProjectsApp: React.FC = () => {
  const { theme } = useDesktopStore();

  // State management
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [_pinnedRepos, setPinnedRepos] = useState<PinnedRepository[]>([]);
  const [userProfile, setUserProfile] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'updated' | 'name'>('stars');
  const [_, setRefreshing] = useState(false);

  const USERNAME = 'ThalisonCosta';
  const GITHUB_API_BASE = 'https://api.github.com';
  const PINNED_API_BASE = 'https://api.pinned.dev';

  /**
   * Fetch user profile data
   */
  const fetchUserProfile = useCallback(async (): Promise<GitHubUser | null> => {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/users/${USERNAME}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  /**
   * Fetch pinned repositories
   */
  const fetchPinnedRepositories = useCallback(async (): Promise<PinnedRepository[]> => {
    try {
      const response = await fetch(`${PINNED_API_BASE}/${USERNAME}`);
      if (!response.ok) {
        console.warn('Pinned repositories API unavailable, continuing without pinned data');
        return [];
      }
      return await response.json();
    } catch (error) {
      console.warn('Error fetching pinned repositories:', error);
      return [];
    }
  }, []);

  /**
   * Fetch all public repositories
   */
  const fetchRepositories = useCallback(async (): Promise<GitHubRepository[]> => {
    try {
      const allRepos: GitHubRepository[] = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const response = await fetch(
          `${GITHUB_API_BASE}/users/${USERNAME}/repos?type=public&sort=updated&per_page=${perPage}&page=${page}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch repositories: ${response.status}`);
        }

        const repos: GitHubRepository[] = await response.json();

        if (repos.length === 0) break;

        allRepos.push(...repos);

        if (repos.length < perPage) break;

        page++;
      }

      return allRepos;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }, []);

  /**
   * Get language color mapping
   */
  const getLanguageColor = useCallback((language: string | null): string => {
    const languageColors: Record<string, string> = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      'C#': '#239120',
      'C++': '#f34b7d',
      C: '#555555',
      PHP: '#4F5D95',
      Ruby: '#701516',
      Go: '#00ADD8',
      Rust: '#dea584',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
      Dart: '#00B4AB',
      HTML: '#e34c26',
      CSS: '#1572B6',
      Vue: '#4FC08D',
      React: '#61DAFB',
      Angular: '#DD0031',
      Svelte: '#ff3e00',
      Shell: '#89e051',
      PowerShell: '#012456',
      Dockerfile: '#384d54',
      YAML: '#cb171e',
      JSON: '#292929',
      Markdown: '#083fa1',
    };

    return language ? languageColors[language] || '#586069' : '#586069';
  }, []);

  /**
   * Combine repositories with pinned data
   */
  const combineRepositoryData = useCallback(
    (repos: GitHubRepository[], pinned: PinnedRepository[]): Repository[] =>
      repos.map((repo) => {
        const pinnedRepo = pinned.find((p) => p.repo === repo.name);
        return {
          ...repo,
          isPinned: !!pinnedRepo,
          languageColor: getLanguageColor(repo.language),
        };
      }),
    [getLanguageColor]
  );

  /**
   * Load all GitHub data
   */
  const loadGitHubData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        // Fetch data in parallel
        const [userProfileData, pinnedReposData, repositoriesData] = await Promise.all([
          fetchUserProfile(),
          fetchPinnedRepositories(),
          fetchRepositories(),
        ]);

        setUserProfile(userProfileData);
        setPinnedRepos(pinnedReposData);

        const combinedRepos = combineRepositoryData(repositoriesData, pinnedReposData);
        setRepositories(combinedRepos);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load GitHub data';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchUserProfile, fetchPinnedRepositories, fetchRepositories, combineRepositoryData]
  );

  /**
   * Initial data load
   */
  useEffect(() => {
    loadGitHubData();
  }, [loadGitHubData]);

  /**
   * Get unique languages for filter
   */
  const availableLanguages = useMemo(() => {
    const languages = repositories
      .map((repo) => repo.language)
      .filter((language): language is string => language !== null);

    return Array.from(new Set(languages)).sort();
  }, [repositories]);

  /**
   * Filter and sort repositories
   */
  const filteredRepositories = useMemo(() => {
    const filtered = repositories.filter((repo) => {
      // Search filter
      const matchesSearch =
        searchTerm === '' ||
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Language filter
      const matchesLanguage = selectedLanguage === 'all' || repo.language === selectedLanguage;

      return matchesSearch && matchesLanguage && !repo.fork;
    });

    // Sort repositories
    filtered.sort((a, b) => {
      // Always put pinned repositories first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then sort by selected criteria
      switch (sortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'forks':
          return b.forks_count - a.forks_count;
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [repositories, searchTerm, selectedLanguage, sortBy]);

  /**
   * Calculate repository statistics
   */
  useMemo(() => {
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
    const languageCount = availableLanguages.length;
    const pinnedCount = repositories.filter((repo) => repo.isPinned).length;

    return {
      totalRepos: repositories.length,
      totalStars,
      totalForks,
      languageCount,
      pinnedCount,
    };
  }, [repositories, availableLanguages]);

  /**
   * Handle repository card click
   */
  const handleRepositoryClick = useCallback((repo: Repository) => {
    window.open(repo.html_url, '_blank', 'noopener,noreferrer');
  }, []);

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(() => {
    loadGitHubData(true);
  }, [loadGitHubData]);

  if (loading) {
    return (
      <div className={`projects-app ${theme}`}>
        <div className="projects-loading">
          <div className="projects-loading-spinner"></div>
          <div className="projects-loading-text">Loading GitHub repositories...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`projects-app ${theme}`}>
        <div className="projects-error">
          <div className="projects-error-icon">😞</div>
          <div className="projects-error-title">Failed to Load Projects</div>
          <div className="projects-error-message">{error}</div>
          <button className="projects-error-retry" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`projects-app ${theme}`}>
      {/* Profile Section */}
      {userProfile && (
        <div className="projects-profile">
          <img
            src={userProfile.avatar_url}
            alt={`${userProfile.name || userProfile.login} avatar`}
            className="projects-avatar"
          />
          <div className="projects-profile-info">
            <h2 className="projects-profile-name">{userProfile.name || userProfile.login}</h2>
            {userProfile.bio && <p className="projects-profile-bio">{userProfile.bio}</p>}
            <div className="projects-profile-stats">
              <span className="projects-stat">
                <strong>{userProfile.public_repos}</strong> repositories
              </span>
              <span className="projects-stat">
                <strong>{userProfile.followers}</strong> followers
              </span>
              <span className="projects-stat">
                <strong>{userProfile.following}</strong> following
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="projects-controls">
        <div className="projects-search-section">
          <div className="projects-search-container">
            <span className="projects-search-icon">🔍</span>
            <input
              type="text"
              className="projects-search-input"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="projects-filters">
          <select
            className="projects-filter-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="all">All Languages</option>
            {availableLanguages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>

          <select
            className="projects-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="stars">Sort by Stars</option>
            <option value="forks">Sort by Forks</option>
            <option value="updated">Sort by Updated</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Repository Grid */}
      <div className="projects-grid">
        {filteredRepositories.length === 0 ? (
          <div className="projects-no-results">
            <div className="projects-no-results-icon">📁</div>
            <div className="projects-no-results-title">No repositories found</div>
            <div className="projects-no-results-message">Try adjusting your search or filter criteria</div>
          </div>
        ) : (
          filteredRepositories.map((repo) => (
            <div
              key={repo.id}
              className={`projects-repo-card ${repo.isPinned ? 'pinned' : ''}`}
              onClick={() => handleRepositoryClick(repo)}
            >
              {repo.isPinned && <div className="projects-pinned-badge">📌 Pinned</div>}

              <div className="projects-repo-header">
                <h3 className="projects-repo-name">{repo.name}</h3>
                <div className="projects-repo-stats">
                  <span className="projects-repo-stat">⭐ {repo.stargazers_count}</span>
                  <span className="projects-repo-stat">🍴 {repo.forks_count}</span>
                </div>
              </div>

              <p className="projects-repo-description">{repo.description || 'No description available'}</p>

              <div className="projects-repo-footer">
                {repo.language && (
                  <div className="projects-repo-language">
                    <span className="projects-language-dot" style={{ backgroundColor: repo.languageColor }}></span>
                    {repo.language}
                  </div>
                )}

                <div className="projects-repo-updated">Updated {new Date(repo.updated_at).toLocaleDateString()}</div>
              </div>

              {repo.topics.length > 0 && (
                <div className="projects-repo-topics">
                  {repo.topics.slice(0, 3).map((topic) => (
                    <span key={topic} className="projects-topic-tag">
                      {topic}
                    </span>
                  ))}
                  {repo.topics.length > 3 && (
                    <span className="projects-topic-more">+{repo.topics.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
