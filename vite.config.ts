import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Security headers for development
    headers: {
      // Force HTTPS (HSTS) — 1 year max-age, include subdomains, preload
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      // Prevent clickjacking attacks
      'X-Frame-Options': 'DENY',
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      // XSS protection header
      'X-XSS-Protection': '1; mode=block',
      // Control referrer information
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Content Security Policy: strict default, allow specific sources
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';",
      // Control browser features (disable dangerous APIs)
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
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
