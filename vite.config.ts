import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3000,           // Changer le port si 5173 pose problème
    strictPort: false,    // Permet de trouver un port libre automatiquement
    open: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});