import React from 'react';

/**
 * Terminal application component that simulates a command-line interface.
 */
export const TerminalApp: React.FC = () => (
  <div
    style={{
      padding: '16px',
      height: '100%',
      backgroundColor: '#000',
      color: '#00ff00',
      fontFamily: 'monospace',
      overflow: 'auto',
    }}
  >
    <div>Windows Desktop Portfolio Terminal v1.0</div>
    <div>Type 'help' for available commands</div>
    <div style={{ marginTop: '10px' }}>
      <span style={{ color: '#00ff00' }}>portfolio@desktop:~$ </span>
      <span style={{ color: '#ffffff' }}>|</span>
    </div>
  </div>
);
