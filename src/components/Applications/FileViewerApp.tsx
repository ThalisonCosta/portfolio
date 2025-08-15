import React from 'react';
import { FileViewer } from './FileViewer';

/**
 * File Viewer application component that renders different file types
 * in their formatted form: .txt as text, .html as rendered webpage, 
 * .md as formatted markdown.
 */
export const FileViewerApp: React.FC = () => {
  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <FileViewer />
    </div>
  );
};
