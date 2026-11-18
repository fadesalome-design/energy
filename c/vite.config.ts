import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Version C (experiments): its own build, a copy of D, separate from D and the main app.
// Relative base + hash links, so it runs from any folder (GitHub Pages: /energy/c/).
// Output goes to ../public/c, which the main build copies to the site as-is,
// so publishing C needs no change to the main app, its config or the workflow.
export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  base: './',
  plugins: [react()],
  // Build number for ?frame=phone, so the frame never loads an older cached copy of C
  define: { __D_BUILD__: JSON.stringify(Date.now().toString(36)) },
  build: {
    outDir: '../public/c',
    emptyOutDir: true,
  },
});
