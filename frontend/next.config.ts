import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Self-contained production server: `next build` emits .next/standalone with
  // a minimal server.js (used by the Dockerfile). Dev and `next start` are
  // unaffected.
  output: 'standalone',
  images: { unoptimized: true },
  async redirects() {
    return [
      {
        source: '/employee/new',
        destination: '/employees/new',
        permanent: false,
      },
      {
        source: '/employee/:id',
        destination: '/employees/:id',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const rawTarget = process.env.API_PROXY_TARGET || 'http://127.0.0.1:8080';
    // Normalize target:
    // 1. Strip trailing slash to avoid double slashes.
    // 2. Resolve 'localhost' to '127.0.0.1' so Node.js on Windows does not attempt IPv6 (::1) connections
    //    which fail with ECONNREFUSED against IPv4-bound backend services.
    const target = rawTarget.replace(/\/+$/, '').replace('://localhost:', '://127.0.0.1:');

    return [
      {
        // Client requests made via axios default baseURL /api/backend + endpoint /api/...
        source: '/api/backend/api/:path*',
        destination: `${target}/api/:path*`,
      },
      {
        // Client requests made to /api/backend/:path*
        source: '/api/backend/:path*',
        destination: `${target}/:path*`,
      },
      {
        // Handle accidental double /api/api/:path* (e.g. if baseURL is /api and endpoint starts with /api)
        source: '/api/api/:path*',
        destination: `${target}/api/:path*`,
      },
      {
        // Direct /api/:path* calls
        source: '/api/:path*',
        destination: `${target}/api/:path*`,
      },
      {
        // Direct root /api call
        source: '/api',
        destination: `${target}/api`,
      },
      {
        // Actuator management endpoints
        source: '/actuator/:path*',
        destination: `${target}/actuator/:path*`,
      },
    ];
  },
}

export default nextConfig