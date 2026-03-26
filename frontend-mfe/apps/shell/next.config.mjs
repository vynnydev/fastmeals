import { NextFederationPlugin } from '@module-federation/nextjs-mf';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ORDERS_URL = process.env.ORDERS_URL || 'http://localhost:3001';
const PRODUCTS_URL = process.env.PRODUCTS_URL || 'http://localhost:3002';
const DELIVERY_URL = process.env.DELIVERY_URL || 'http://localhost:3003';
const REPORTS_URL = process.env.REPORTS_URL || 'http://localhost:3004';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@fastmeals/ui', '@fastmeals/shared'],
  webpack(config, options) {
    const { isServer } = options;
    const remoteType = isServer ? 'ssr' : 'chunks';

    config.plugins.push(
      new NextFederationPlugin({
        name: 'shell',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          orders: `orders@${ORDERS_URL}/_next/static/${remoteType}/remoteEntry.js`,
          products: `products@${PRODUCTS_URL}/_next/static/${remoteType}/remoteEntry.js`,
          delivery: `delivery@${DELIVERY_URL}/_next/static/${remoteType}/remoteEntry.js`,
          reports: `reports@${REPORTS_URL}/_next/static/${remoteType}/remoteEntry.js`,
        },
        shared: {},
      })
    );

    return config;
  },
};

export default nextConfig;