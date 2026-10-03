/** @type {import('next').NextConfig} */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/playground/:path*',
        destination: `${BACKEND_URL}/api/playground/:path*`,
      },
    ];
  },
};

export default nextConfig;