import React from 'react';

/**
 * Markdown Viewer application component that displays skills and experience
 * in a structured markdown-like format.
 */
export const MarkdownViewerApp: React.FC = () => (
  <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
    <h3>Skills</h3>
    <h4>Frontend</h4>
    <ul>
      <li>React/TypeScript</li>
      <li>JavaScript/HTML/CSS</li>
      <li>Vue.js</li>
    </ul>
    <h4>Backend</h4>
    <ul>
      <li>Node.js</li>
      <li>Python</li>
      <li>Express.js</li>
    </ul>
    <h4>Tools</h4>
    <ul>
      <li>Git/GitHub</li>
      <li>Docker</li>
      <li>AWS</li>
    </ul>
  </div>
);
