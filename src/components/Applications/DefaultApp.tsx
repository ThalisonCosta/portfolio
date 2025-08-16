import React from 'react';

/**
 * Props for the DefaultApp component
 */
interface DefaultAppProps {
  /** The name of the component that was requested but not implemented */
  component: string;
}

/**
 * Default application component shown when a requested application is not implemented.
 *
 * @param props - The component props
 * @param props.component - The name of the requested component
 */
export const DefaultApp: React.FC<DefaultAppProps> = ({ component }) => (
  <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
    <h3>{component}</h3>
    <p>This application is not yet implemented.</p>
  </div>
);

export default DefaultApp;
