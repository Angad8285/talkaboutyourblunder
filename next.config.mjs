/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Allow .wasm files to be imported/loaded
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    // Stockfish runs in Web Worker on client only
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  async headers() {
    return [
      {
        // Enable cross-origin isolation for all routes (required for SharedArrayBuffer)
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
      {
        // Be explicit for engine assets
        source: '/:file*(.:ext)',
        headers: [
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
      {
        // Ensure correct content-type for wasm
        source: '/stockfish-17.1-lite-51f59da.wasm',
        headers: [
          { key: 'Content-Type', value: 'application/wasm' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
