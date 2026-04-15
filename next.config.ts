import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev port is set in package.json (default 3050; avoids clashes with tools on 3001)
  devIndicators: {
    position: 'bottom-right',
  },
  
  // WebSocket/HMR fix + ignore Windows system files (Watchpack EINVAL)
  webpack: (config, { dev }) => {
    if (dev) {
      const prevIgnored = config.watchOptions?.ignored;
      let ignoredList: string[] = [];
      if (Array.isArray(prevIgnored)) {
        ignoredList = prevIgnored.filter((x): x is string => typeof x === 'string');
      } else if (typeof prevIgnored === 'string') {
        ignoredList = [prevIgnored];
      }
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          ...ignoredList,
          '**/pagefile.sys',
          '**/swapfile.sys',
          '**/DumpStack.log.tmp',
        ],
      };
    }
    return config;
  },
  
  // Body size limits: Server Actions + request body pro Route Handlers (upload ZIP)
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
    // Zvýší limit buffered request body (default 10MB) – bez toho velký FormData (např. 11× ZIP) selže s "Failed to parse body as FormData"
    middlewareClientMaxBodySize: '100mb',
  },
};

export default nextConfig;
