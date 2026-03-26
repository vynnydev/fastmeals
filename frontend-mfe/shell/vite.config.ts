import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
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
  },
  preview: {
    port: 5000,
    strictPort: true,
    cors: true,
  },
});