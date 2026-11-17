import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Node's process, without pulling in @types/node for one line
declare const process: { env: Record<string, string | undefined> };

// BASE_PATH lets the same build run at a domain root (Vercel, Netlify: "/")
// or in a subfolder (GitHub Pages project sites: "/<repo-name>/").
// The GitHub Pages workflow sets it automatically.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
});
