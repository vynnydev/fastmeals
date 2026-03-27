import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react() as any,
    federation({
      name: 'shell',
      remotes: {
        remoteOrders: process.env.VITE_ORDERS_URL || 'http://localhost:5001/assets/remoteEntry.js',
        remoteProducts: process.env.VITE_PRODUCTS_URL || 'http://localhost:5002/assets/remoteEntry.js',
        remoteDelivery: process.env.VITE_DELIVERY_URL || 'http://localhost:5003/assets/remoteEntry.js',
        remoteReports: process.env.VITE_REPORTS_URL || 'http://localhost:5004/assets/remoteEntry.js',
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
    port: 5000,
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
    port: 5000,
    strictPort: true,
    cors: true,
  },
});