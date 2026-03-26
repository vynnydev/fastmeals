import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remoteDelivery',
      filename: 'remoteEntry.js',
      exposes: {
        './DeliveryPage': './src/components/DeliveryPage',
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
  preview: {
    port: 5001,
    strictPort: true,
    cors: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
});