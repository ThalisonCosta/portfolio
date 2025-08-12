import React from 'react';

interface ApplicationManagerProps {
  component: string;
  windowId: string;
}

export const ApplicationManager: React.FC<ApplicationManagerProps> = ({ component }) => {
  const renderApplication = () => {
    switch (component) {
      case 'TextEditor':
        return <TextEditorApp />;
      case 'FileExplorer':
        return <FileExplorerApp />;
      case 'Terminal':
        return <TerminalApp />;
      case 'ContactForm':
        return <ContactFormApp />;
      case 'PDFViewer':
        return <PDFViewerApp />;
      case 'MarkdownViewer':
        return <MarkdownViewerApp />;
      default:
        return <DefaultApp component={component} />;
    }
  };

  return <div className="application-container">{renderApplication()}</div>;
};

const TextEditorApp: React.FC = () => (
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

const FileExplorerApp: React.FC = () => (
  <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
    <h3>File Explorer</h3>
    <p>File explorer functionality coming soon...</p>
    <div style={{ marginTop: '20px' }}>
      <div>📁 Projects</div>
      <div>📁 Documents</div>
      <div>📄 Resume.pdf</div>
      <div>📄 About Me.txt</div>
    </div>
  </div>
);

const TerminalApp: React.FC = () => (
  <div style={{ 
    padding: '16px', 
    height: '100%', 
    backgroundColor: '#000', 
    color: '#00ff00',
    fontFamily: 'monospace',
    overflow: 'auto'
  }}>
    <div>Windows Desktop Portfolio Terminal v1.0</div>
    <div>Type 'help' for available commands</div>
    <div style={{ marginTop: '10px' }}>
      <span style={{ color: '#00ff00' }}>portfolio@desktop:~$ </span>
      <span style={{ color: '#ffffff' }}>|</span>
    </div>
  </div>
);

const ContactFormApp: React.FC = () => (
  <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
    <h3>Contact Me</h3>
    <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input type="text" placeholder="Your Name" style={{ padding: '8px' }} />
      <input type="email" placeholder="Your Email" style={{ padding: '8px' }} />
      <textarea placeholder="Your Message" rows={5} style={{ padding: '8px', resize: 'vertical' }} />
      <button type="submit" style={{ 
        padding: '10px', 
        backgroundColor: '#0078d4', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        Send Message
      </button>
    </form>
  </div>
);

const PDFViewerApp: React.FC = () => (
  <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
    <h3>PDF Viewer - Resume</h3>
    <p>PDF viewing functionality would be implemented here.</p>
    <p>This would display the resume PDF file.</p>
  </div>
);

const MarkdownViewerApp: React.FC = () => (
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

const DefaultApp: React.FC<{ component: string }> = ({ component }) => (
  <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
    <h3>{component}</h3>
    <p>This application is not yet implemented.</p>
  </div>
);