import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        // Client requests are `/api/backend/api/...` (axios baseURL `/api/backend`
        // + endpoint paths like `/api/health`), so `:path*` already contains the
        // `api/` segment. Do NOT prepend another `/api/` here or the backend
        // receives `/api/api/...` and rejects it as unauthenticated (401).
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/:path*`,
      },
    ]
  },
}

export default nextConfig