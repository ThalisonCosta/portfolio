import React from 'react';

/**
 * Text Editor application component that displays portfolio information
 * and developer skills in a text editor-like interface.
 */
export const TextEditorApp: React.FC = () => (
  <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
    <h3>Text Editor</h3>
    <p>Welcome to my portfolio! I'm a passionate developer with experience in:</p>
    <ul>
      <li>React & TypeScript</li>
      <li>Node.js & Python</li>
      <li>Modern web technologies</li>
      <li>UI/UX Design</li>
    </ul>
    <p>This desktop environment showcases my skills in creating interactive web applications.</p>
  </div>
);
