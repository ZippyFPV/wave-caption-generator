// VITE CONFIGURATION FILE
// Vite is a fast build tool and development server for modern web projects
// It provides hot reload, fast builds, and optimized production bundling

import { defineConfig } from 'vite' // Vite's configuration helper function
import react from '@vitejs/plugin-react' // Plugin to enable React support in Vite

// Official Vite documentation: https://vite.dev/config/
export default defineConfig({
  // PLUGINS ARRAY - Vite plugins extend functionality
  // The React plugin enables JSX parsing, hot reload, and React-specific optimizations
  plugins: [react()],
  
  // Additional configuration options you might see in larger projects:
  // - server: { port: 3000 } - Change development server port
  // - build: { outDir: 'build' } - Change build output directory
  // - define: { } - Define global constants
  // - resolve: { alias: { } } - Create path aliases for imports
})
