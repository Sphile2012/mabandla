import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    host: true, // Allow access from network for testing on other devices
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Reduce bundle size for production
    minify: 'esbuild',
    esbuildOptions: {
      drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
    },
  },
  // Ensure public assets are properly copied
  publicDir: 'public',
});
