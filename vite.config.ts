import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/portfolio/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group application components into separate chunks
          applications: [
            'src/components/Applications/CalculatorApp.tsx',
            'src/components/Applications/TerminalApp.tsx',
            'src/components/Applications/FileExplorerApp.tsx',
            'src/components/Applications/TextEditorApp.tsx',
            'src/components/Applications/SettingsApp/SettingsApp.tsx',
            'src/components/Applications/FileViewerApp.tsx',
            'src/components/Applications/ContactFormApp.tsx',
            'src/components/Applications/MarkdownViewerApp.tsx',
            'src/components/Applications/AboutApp.tsx',
            'src/components/Applications/ProjectsApp.tsx',
          ],
          // Group vendor libraries
          vendor: ['react', 'react-dom'],
          // Group zustand store
          store: ['zustand'],
        },
        // Ensure proper asset paths for GitHub Pages
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Improve chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Ensure sourcemaps for debugging
    sourcemap: false,
  },
  // Ensure proper base URL resolution for dynamic imports
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/portfolio/${filename}` };
      }
      return { relative: true };
    },
  },
});
