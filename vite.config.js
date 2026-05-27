import { cpSync } from 'node:fs';
import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'spa',
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    open: true,
  },
  plugins: [
    {
      name: 'spa-404',
      closeBundle() {
        cpSync('dist/index.html', 'dist/404.html');
      },
    },
  ],
});
