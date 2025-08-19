import React, { useState, useMemo } from 'react';
import { useDesktopStore } from '../../stores/useDesktopStore';
import './ProjectsApp.css';

/**
 * Real Project interface for portfolio showcase
 */
export interface RealProject {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  websiteUrl: string;
  previewImage?: string;
  technologies: string[];
  category: 'web' | 'mobile' | 'desktop' | 'api' | 'other';
  featured: boolean;
  status: 'live' | 'development' | 'archived';
  dateCreated: string;
  dateUpdated: string;
  features: string[];
  sourceCodeUrl?: string;
}

/**
 * Real project data for portfolio showcase
 */
const REAL_PROJECTS: RealProject[] = [
  {
    id: 'qualvaiser',
    name: 'QualVaiSer',
    description:
      'Torne seu Chá de Bebê ainda mais especial! Crie um bolão divertido para seu chá de bebê! Seus convidados fazem palpites sobre sexo, data de nascimento, peso e altura do bebê. Uma forma única de tornar a espera ainda mais emocionante! 💕',
    longDescription:
      'QualVaiSer é uma plataforma interativa para criar bolões de chá de bebê, onde os convidados podem fazer seus palpites sobre o bebê que está chegando. A aplicação permite que os organizadores criem apostas divertidas sobre sexo, data de nascimento, peso e altura do bebê, criando uma experiência única e envolvente para todos os participantes.',
    websiteUrl: 'https://qualvaiser.com/',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    category: 'web',
    featured: true,
    status: 'live',
    dateCreated: '2023-01-15',
    dateUpdated: '2024-12-15',
    features: [
      'Criação de bolões personalizados para chá de bebê',
      'Palpites sobre sexo, data, peso e altura do bebê',
      'Interface intuitiva e divertida',
      'Acompanhamento em tempo real dos palpites',
      'Relatórios e ranking dos participantes',
    ],
    sourceCodeUrl: undefined,
  },
  {
    id: 'portfolio-desktop',
    name: 'Windows Desktop Portfolio',
    description: 'Interactive Windows 11-inspired portfolio website with desktop environment simulation',
    longDescription:
      'A unique portfolio website that simulates a Windows 11 desktop environment, complete with applications, file system, terminal, and interactive features. Built with React and TypeScript.',
    websiteUrl: `${window.location.origin}/portfolio`,
    technologies: ['React', 'TypeScript', 'CSS3', 'Vite', 'Playwright'],
    category: 'web',
    featured: true,
    status: 'live',
    dateCreated: '2024-01-01',
    dateUpdated: '2024-12-20',
    features: [
      'Windows 11-style interface',
      'Interactive desktop environment',
      'Multiple applications (Terminal, File Explorer, Text Editor)',
      'Theme support (Light/Dark)',
      'Responsive design',
      'Vim editor integration',
    ],
    sourceCodeUrl: 'https://github.com/ThalisonCosta/windows-desktop-portfolio',
  },
];

/**
 * Projects application component that displays real portfolio projects
 * with project previews, descriptions, and filtering options.
 */
export const ProjectsApp: React.FC = () => {
  const { theme } = useDesktopStore();

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'recent' | 'name'>('featured');

  /**
   * Get unique categories for filter
   */
  const availableCategories = useMemo(() => {
    const categories = REAL_PROJECTS.map((project) => project.category);
    return Array.from(new Set(categories)).sort();
  }, []);

  /**
   * Filter and sort projects
   */
  const filteredProjects = useMemo(() => {
    const filtered = REAL_PROJECTS.filter((project) => {
      // Search filter
      const matchesSearch =
        searchTerm === '' ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort projects
    filtered.sort((a, b) => {
      // Always put featured projects first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;

      // Then sort by selected criteria
      switch (sortBy) {
        case 'featured':
          if (a.featured === b.featured) return 0;
          return a.featured ? -1 : 1;
        case 'recent':
          return new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, sortBy]);

  /**
   * Get technology color mapping
   */
  const getTechnologyColor = (technology: string): string => {
    const techColors: Record<string, string> = {
      React: '#61DAFB',
      TypeScript: '#2b7489',
      JavaScript: '#f1e05a',
      'Node.js': '#339933',
      Python: '#3572A5',
      CSS3: '#1572B6',
      HTML5: '#e34c26',
      PostgreSQL: '#336791',
      AWS: '#FF9900',
      Vite: '#646CFF',
      Playwright: '#2EAD33',
    };
    return techColors[technology] || '#586069';
  };

  /**
   * Handle project card click
   */
  const handleProjectClick = (project: RealProject) => {
    window.open(project.websiteUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * Handle source code link click
   */
  const handleSourceCodeClick = (e: React.MouseEvent, sourceCodeUrl: string) => {
    e.stopPropagation();
    window.open(sourceCodeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`projects-app ${theme}`}>
      {/* Header Section */}
      <div className="projects-header">
        <div className="projects-header-content">
          <h1 className="projects-title">My Projects</h1>
          <p className="projects-subtitle">A showcase of my real-world applications and development work</p>
        </div>
        <div className="projects-stats">
          <div className="projects-stat-item">
            <span className="projects-stat-number">{REAL_PROJECTS.length}</span>
            <span className="projects-stat-label">Projects</span>
          </div>
          <div className="projects-stat-item">
            <span className="projects-stat-number">{REAL_PROJECTS.filter((p) => p.status === 'live').length}</span>
            <span className="projects-stat-label">Live</span>
          </div>
          <div className="projects-stat-item">
            <span className="projects-stat-number">{REAL_PROJECTS.filter((p) => p.featured).length}</span>
            <span className="projects-stat-label">Featured</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="projects-controls">
        <div className="projects-search-section">
          <div className="projects-search-container">
            <span className="projects-search-icon">🔍</span>
            <input
              type="text"
              className="projects-search-input"
              placeholder="Search projects, technologies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="projects-filters">
          <select
            className="projects-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="projects-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="featured">Sort by Featured</option>
            <option value="recent">Sort by Recent</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {filteredProjects.length === 0 ? (
          <div className="projects-no-results">
            <div className="projects-no-results-icon">📁</div>
            <div className="projects-no-results-title">No projects found</div>
            <div className="projects-no-results-message">Try adjusting your search or filter criteria</div>
          </div>
        ) : (
          filteredProjects.map((project: RealProject) => (
            <div
              key={project.id}
              className={`projects-project-card ${project.featured ? 'featured' : ''}`}
              onClick={() => handleProjectClick(project)}
            >
              {project.featured && <div className="projects-featured-badge">⭐ Featured</div>}

              <div className="projects-project-status">
                <span className={`projects-status-indicator ${project.status}`}>
                  {project.status === 'live' && '🟢'}
                  {project.status === 'development' && '🟡'}
                  {project.status === 'archived' && '🔴'}
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>

              <div className="projects-project-header">
                <h3 className="projects-project-name">{project.name}</h3>
                <div className="projects-project-actions">
                  {project.sourceCodeUrl && (
                    <button
                      className="projects-source-btn"
                      onClick={(e) => handleSourceCodeClick(e, project.sourceCodeUrl || '')}
                      title="View Source Code"
                    >
                      💻
                    </button>
                  )}
                </div>
              </div>

              <div className="projects-project-content">
                <p className="projects-project-description">{project.description}</p>

                {project.longDescription && (
                  <div className="projects-project-features">
                    <h4>Key Features:</h4>
                    <ul>
                      {project.features.map((feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="projects-project-bottom">
                <div className="projects-project-footer">
                  <div className="projects-project-category">
                    <span className="projects-category-tag">{project.category}</span>
                  </div>
                  <div className="projects-project-updated">
                    Updated {new Date(project.dateUpdated).toLocaleDateString()}
                  </div>
                </div>

                <div className="projects-project-technologies">
                  {project.technologies.map((tech: string) => (
                    <span
                      key={tech}
                      className="projects-tech-tag"
                      style={{ backgroundColor: `${getTechnologyColor(tech)}20`, color: getTechnologyColor(tech) }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="projects-website-preview">
                  <div className="projects-preview-placeholder">🌐 Click to visit website</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
