import { NextFederationPlugin } from '@module-federation/nextjs-mf';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@fastmeals/ui', '@fastmeals/shared'],
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'orders',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './OrdersPage': './components/OrdersPage',
        },
        shared: {},
      })
    );
    return config;
  },
};

export default nextConfig;