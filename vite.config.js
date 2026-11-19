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
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('error', (_error, _request, response) => {
            if (response.headersSent) return;
            response.writeHead(503, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
              error: 'API unavailable',
              message: 'The API server is not running. Start it with "npm run dev:all".',
            }));
          });
        },
      },
    },
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: ['es2015', 'chrome58', 'firefox57', 'safari11', 'edge18'],
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-date': ['date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  publicDir: 'public',
})
