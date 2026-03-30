import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'

export default defineConfig({
  plugins: [
    react() as any,
    federation({
      name: 'remoteReports',
      filename: 'remoteEntry.js',
      exposes: {
        './ReportsPage': './src/pages/ReportsPage',
      },
      shared: ['react', 'react-dom', 'react-router-dom', 'recharts'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 5004,
    strictPort: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    port: 5004,
    strictPort: true,
    cors: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
})