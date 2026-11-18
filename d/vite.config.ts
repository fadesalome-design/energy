import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Sandbox D: its own build, separate from the main app.
// Relative base + hash links, so it runs from any folder (GitHub Pages: /energy/d/).
// Output goes to ../public/d, which the main build copies to the site as-is,
// so publishing D needs no change to the main app, its config or the workflow.
export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  base: './',
  plugins: [react()],
  build: {
    outDir: '../public/d',
    emptyOutDir: true,
  },
});
