import React from 'react';
import { useDesktopStore } from '../../stores/useDesktopStore';
import './AboutApp.css';

/**
 * About application component that displays personal information,
 * social links, and CV download functionality.
 */
export const AboutApp: React.FC = () => {
  const { theme } = useDesktopStore();

  /**
   * Handle CV download
   */
  const handleDownloadCV = () => {
    const link = document.createElement('a');
    link.href = '/cv.pdf';
    link.download = 'Thalison_Costa_CV.pdf';
    link.click();
  };

  /**
   * Handle CV preview in new tab
   */
  const handlePreviewCV = () => {
    window.open('/cv.pdf', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`about-app ${theme}`}>
      <div className="about-container">
        {/* Header Section */}
        <header className="about-header">
          <div className="about-avatar">
            <div className="avatar-placeholder">
              👨‍💻
            </div>
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
            <a 
              href="mailto:thalisoncosta123@gmail.com"
              className="contact-link"
              aria-label="Send email"
            >
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
            <button 
              onClick={handlePreviewCV}
              className="cv-button cv-preview"
              aria-label="Preview CV in browser"
            >
              <span className="button-icon">👁️</span>
              View CV
            </button>
            <button 
              onClick={handleDownloadCV}
              className="cv-button cv-download"
              aria-label="Download CV as PDF"
            >
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
              Passionate software developer with experience in full-stack development.
              I enjoy creating innovative solutions and learning new technologies.
            </p>
            <p>
              Currently working on various projects involving React, TypeScript, and modern web technologies.
              Always eager to collaborate on interesting projects and share knowledge with the community.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};