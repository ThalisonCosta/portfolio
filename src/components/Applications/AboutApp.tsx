import React, { useState, useCallback, useMemo } from 'react';
import { useDesktopStore } from '../../stores/useDesktopStore';
import './AboutApp.css';

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
 * About application component that displays personal information,
 * social links, CV download functionality, and GitHub repositories.
 */
export const AboutApp: React.FC = () => {
  const { theme } = useDesktopStore();

  // GitHub state management
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [_pinnedRepos, setPinnedRepos] = useState<PinnedRepository[]>([]);
  const [userProfile, setUserProfile] = useState<GitHubUser | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [showGithubSection, setShowGithubSection] = useState(false);

  // GitHub filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

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
  const loadGitHubData = useCallback(async () => {
    setGithubLoading(true);
    setGithubError(null);

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
      setGithubError(errorMessage);
    } finally {
      setGithubLoading(false);
    }
  }, [fetchUserProfile, fetchPinnedRepositories, fetchRepositories, combineRepositoryData]);

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
   * Filter repositories
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

    // Sort repositories (pinned first, then by stars)
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.stargazers_count - a.stargazers_count;
    });

    return filtered.slice(0, 6); // Show only top 6 repositories
  }, [repositories, searchTerm, selectedLanguage]);

  /**
   * Handle repository card click
   */
  const handleRepositoryClick = useCallback((repo: Repository) => {
    window.open(repo.html_url, '_blank', 'noopener,noreferrer');
  }, []);

  /**
   * Handle show more GitHub repositories
   */
  const handleShowGithubRepos = () => {
    if (!showGithubSection && repositories.length === 0) {
      loadGitHubData();
    }
    setShowGithubSection(!showGithubSection);
  };

  /**
   * Handle CV download
   */
  const handleDownloadCV = () => {
    const baseUrl = import.meta.env.BASE_URL;
    const link = document.createElement('a');
    link.href = `${baseUrl}cv.pdf`;
    link.download = 'Thalison_Costa_CV.pdf';
    link.click();
  };

  /**
   * Handle CV preview in new tab
   */
  const handlePreviewCV = () => {
    const baseUrl = import.meta.env.BASE_URL;
    window.open(`${baseUrl}cv.pdf`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`about-app ${theme}`}>
      <div className="about-container">
        {/* Header Section */}
        <header className="about-header">
          <div className="about-avatar">
            <div className="avatar-placeholder">👨‍💻</div>
          </div>
          <div className="about-basic-info">
            <h1 className="about-name">Thalison Costa</h1>
            <p className="about-title">Software Developer</p>
          </div>
        </header>

        {/* Contact Information */}
        <section className="about-section">
          <h2 className="section-title">Contact Information</h2>
          <div className="contact-links">
            <a href="mailto:thalisoncosta123@gmail.com" className="contact-link" aria-label="Send email">
              <span className="contact-icon">📧</span>
              <span>thalisoncosta123@gmail.com</span>
            </a>
            <a
              href="https://github.com/ThalisonCosta"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
              aria-label="Visit GitHub profile"
            >
              <span className="contact-icon">🐙</span>
              <span>GitHub Profile</span>
            </a>
            <a
              href="https://www.linkedin.com/in/thalison-costa/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
              aria-label="Visit LinkedIn profile"
            >
              <span className="contact-icon">💼</span>
              <span>LinkedIn Profile</span>
            </a>
          </div>
        </section>

        {/* CV Section */}
        <section className="about-section">
          <h2 className="section-title">Curriculum Vitae</h2>
          <div className="cv-actions">
            <button onClick={handlePreviewCV} className="cv-button cv-preview" aria-label="Preview CV in browser">
              <span className="button-icon">👁️</span>
              View CV
            </button>
            <button onClick={handleDownloadCV} className="cv-button cv-download" aria-label="Download CV as PDF">
              <span className="button-icon">⬇️</span>
              Download CV
            </button>
          </div>
        </section>

        {/* Skills Section */}
        <section className="about-section">
          <h2 className="section-title">Technical Skills</h2>
          <div className="skills-grid">
            <div className="skill-category">
              <h3>Frontend</h3>
              <div className="skill-tags">
                <span className="skill-tag">React</span>
                <span className="skill-tag">TypeScript</span>
                <span className="skill-tag">JavaScript</span>
                <span className="skill-tag">HTML/CSS</span>
              </div>
            </div>
            <div className="skill-category">
              <h3>Backend</h3>
              <div className="skill-tags">
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">Python</span>
                <span className="skill-tag">APIs</span>
                <span className="skill-tag">Databases</span>
              </div>
            </div>
            <div className="skill-category">
              <h3>Tools & Other</h3>
              <div className="skill-tags">
                <span className="skill-tag">Git</span>
                <span className="skill-tag">Docker</span>
                <span className="skill-tag">Linux</span>
                <span className="skill-tag">AWS</span>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="about-section">
          <h2 className="section-title">About Me</h2>
          <div className="about-description">
            <p>
              Passionate software developer with experience in full-stack development. I enjoy creating innovative
              solutions and learning new technologies.
            </p>
            <p>
              Currently working on various projects involving React, TypeScript, and modern web technologies. Always
              eager to collaborate on interesting projects and share knowledge with the community.
            </p>
          </div>
        </section>

        {/* GitHub Projects Section */}
        <section className="about-section">
          <div className="github-section-header">
            <h2 className="section-title">GitHub Projects</h2>
            <button
              onClick={handleShowGithubRepos}
              className="github-toggle-btn"
              aria-label={showGithubSection ? 'Hide GitHub projects' : 'Show GitHub projects'}
            >
              {showGithubSection ? 'Hide Repositories' : 'Show Repositories'}
            </button>
          </div>

          {showGithubSection && (
            <div className="github-content">
              {githubLoading && (
                <div className="github-loading">
                  <div className="github-loading-spinner"></div>
                  <div className="github-loading-text">Loading GitHub repositories...</div>
                </div>
              )}

              {githubError && (
                <div className="github-error">
                  <div className="github-error-message">{githubError}</div>
                  <button onClick={loadGitHubData} className="github-retry-btn">
                    Try Again
                  </button>
                </div>
              )}

              {!githubLoading && !githubError && repositories.length > 0 && (
                <>
                  {/* GitHub Profile Info */}
                  {userProfile && (
                    <div className="github-profile">
                      <img
                        src={userProfile.avatar_url}
                        alt={`${userProfile.name || userProfile.login} avatar`}
                        className="github-avatar"
                      />
                      <div className="github-profile-info">
                        <h3 className="github-profile-name">{userProfile.name || userProfile.login}</h3>
                        {userProfile.bio && <p className="github-profile-bio">{userProfile.bio}</p>}
                        <div className="github-profile-stats">
                          <span className="github-stat">
                            <strong>{userProfile.public_repos}</strong> repositories
                          </span>
                          <span className="github-stat">
                            <strong>{userProfile.followers}</strong> followers
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search and Filter */}
                  <div className="github-controls">
                    <div className="github-search-container">
                      <span className="github-search-icon">🔍</span>
                      <input
                        type="text"
                        className="github-search-input"
                        placeholder="Search repositories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="github-filter-select"
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
                  </div>

                  {/* Repository Grid */}
                  <div className="github-repos-grid">
                    {filteredRepositories.map((repo) => (
                      <div
                        key={repo.id}
                        className={`github-repo-card ${repo.isPinned ? 'pinned' : ''}`}
                        onClick={() => handleRepositoryClick(repo)}
                      >
                        {repo.isPinned && <div className="github-pinned-badge">📌 Pinned</div>}

                        <div className="github-repo-header">
                          <h4 className="github-repo-name">{repo.name}</h4>
                          <div className="github-repo-stats">
                            <span className="github-repo-stat">⭐ {repo.stargazers_count}</span>
                            <span className="github-repo-stat">🍴 {repo.forks_count}</span>
                          </div>
                        </div>

                        <p className="github-repo-description">{repo.description || 'No description available'}</p>

                        <div className="github-repo-footer">
                          {repo.language && (
                            <div className="github-repo-language">
                              <span
                                className="github-language-dot"
                                style={{ backgroundColor: repo.languageColor }}
                              ></span>
                              {repo.language}
                            </div>
                          )}
                          <div className="github-repo-updated">
                            Updated {new Date(repo.updated_at).toLocaleDateString()}
                          </div>
                        </div>

                        {repo.topics.length > 0 && (
                          <div className="github-repo-topics">
                            {repo.topics.slice(0, 3).map((topic) => (
                              <span key={topic} className="github-topic-tag">
                                {topic}
                              </span>
                            ))}
                            {repo.topics.length > 3 && (
                              <span className="github-topic-more">+{repo.topics.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {repositories.length > 6 && (
                    <div className="github-view-all">
                      <a
                        href={`https://github.com/${USERNAME}?tab=repositories`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-view-all-btn"
                      >
                        View All {repositories.length} Repositories on GitHub
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
