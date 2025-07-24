//NOTE TO SELF: Make bundler actually resolve figma:asset/*

import { defineConfig, type ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig((env: ConfigEnv) =>{
const isProduction = env.mode === 'production'

  return {
  plugins: [

    {
      name: 'strip-use-client',
      enforce: 'pre',
      transform(code: string, id: string) {
        if (id.includes('node_modules') && /^\s*['"]use client['"]/.test(code)) {
          return code.replace(/^\s*['"]use client['"];\r?\n?/, '')
        }
      },
    },
    react(),
  ],

  // Define the entry point
  root: '.',

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

  // Development server configuration
  /*server: {
    port: 5173,
    host: true,
    open: true
  },*/
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: !isProduction, //turn off for production!!!
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },

  
  // Environment variables
  envPrefix: 'VITE_',
  
  // CSS configuration
  css: {
    postcss: 'frontend/postcss.config.js'
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
}
})