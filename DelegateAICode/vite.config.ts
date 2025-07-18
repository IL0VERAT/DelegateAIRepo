//NOTE TO SELF: Make bundler actually resolve figma:asset/*

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Define the entry point
  root: '.',
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 5173,
    host: true,
    open: true
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, 'components'),
      '@/services': path.resolve(__dirname, 'services'),
      '@/utils': path.resolve(__dirname, 'utils'),
      '@/types': path.resolve(__dirname, 'types'),
      '@/config': path.resolve(__dirname, 'config'),
      '@/styles': path.resolve(__dirname, 'styles')
    }
  },
  
  // Environment variables
  envPrefix: 'VITE_',
  
  // CSS configuration
  css: {
    postcss: './postcss.config.js'
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      'recharts',
      '@stripe/stripe-js'
    ]
  }
})