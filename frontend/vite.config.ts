import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    fs: {
      // Allow serving files from parent directory (for results folder)
      allow: ['..'],
    },
  },
})
