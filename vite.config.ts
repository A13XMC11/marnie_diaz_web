import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Security headers for development
    headers: {
      // Prevent clickjacking attacks
      'X-Frame-Options': 'DENY',
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      // XSS protection header
      'X-XSS-Protection': '1; mode=block',
      // Control referrer information
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Control browser features
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      // Allow development server
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
      'Access-Control-Allow-Credentials': 'true',
    },
  },
  build: {
    // Optimize for production
    rollupOptions: {
      output: {
        // Minify code
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) {
              return '@supabase'
            }
            if (id.includes('react')) {
              return 'react-vendor'
            }
            return 'vendor'
          }
        },
      },
    },
    // Security: don't expose source maps in production
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },
  },
})
