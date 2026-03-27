import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react() as any,
    tailwindcss() as any,
    federation({
      name: 'remoteOrders',
      filename: 'remoteEntry.js',
      exposes: {
        './OrdersPage': './src/pages/OrdersPage',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
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
    port: 5001,
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
    port: 5001,
    strictPort: true,
    cors: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
});