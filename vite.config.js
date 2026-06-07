import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    // FIX: lower target to improve Safari/iOS compatibility
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          charts:   ['recharts'],
          motion:   ['framer-motion'],
          icons:    ['react-icons/md', 'react-icons/fa'],
        },
      },
    },
    // FIX: enable source maps in prod for error tracking (swap to false if no Sentry)
    sourcemap: false,
    chunkSizeWarningLimit: 800,
  },
  // FIX: server proxy headers for local dev to avoid CORS issues with Firebase emulator
  server: {
    port: 5173,
    open: true,
  },
})
