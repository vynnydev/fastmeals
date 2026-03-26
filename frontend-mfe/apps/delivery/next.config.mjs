import { NextFederationPlugin } from '@module-federation/nextjs-mf';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@fastmeals/ui', '@fastmeals/shared'],
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'delivery',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './DeliveryPage': './components/DeliveryPage',
        },
        shared: {},
      })
    );
    return config;
  },
};

export default nextConfig;