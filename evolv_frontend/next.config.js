/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
    NEXT_PUBLIC_API_URL: 'https://evolv-backend-e3fgbka2d2dmapcv.westeurope-01.azurewebsites.net/api/v1',
  },
  trailingSlash: true,
}

module.exports = nextConfig
