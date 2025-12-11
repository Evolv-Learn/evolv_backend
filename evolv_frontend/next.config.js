/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Skip dynamic routes during static export
  exportPathMap: async function (defaultPathMap) {
    const pathMap = {};
    
    // Include all static routes
    Object.keys(defaultPathMap).forEach((path) => {
      // Skip dynamic routes (those with [id] or similar)
      if (!path.includes('[') && !path.includes(']')) {
        pathMap[path] = defaultPathMap[path];
      }
    });
    
    return pathMap;
  },
}

module.exports = nextConfig
