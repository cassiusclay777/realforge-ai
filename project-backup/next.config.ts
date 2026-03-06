import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use port 3001
  devIndicators: {
    position: 'bottom-right',
  },
  
  // WebSocket/HMR fix
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  
  // ✅ Správný způsob pro Next.js 15 - body size limit
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Tohle stačí pro upload
    },
  },
};

export default nextConfig;
