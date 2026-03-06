import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Fix WebSocket/HMR issues
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Ensure WebSocket connection uses correct host
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // Explicit dev server configuration
  experimental: {
    // webpackBuildWorker: true, // Disabled due to build errors
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // Use port 3001 instead of 3000
  devIndicators: {
    position: 'bottom-right',
  },
  // Increase API body size limit for file uploads
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

export default nextConfig;
