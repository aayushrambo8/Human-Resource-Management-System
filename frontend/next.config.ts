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
      {
        source: '/employee',
        destination: '/employees',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        // Client requests are `/api/backend/api/...` (axios baseURL `/api/backend`
        // + endpoint paths like `/api/health`), so `:path*` already contains the
        // `api/` segment. Do NOT prepend another `/api/` here or the backend
        // receives `/api/api/...` and rejects it as unauthenticated (401).
        // This config is evaluated by the server at STARTUP, so a plain env var
        // (API_PROXY_TARGET) can point at e.g. http://backend:8080 inside
        // Docker without rebuilding. The client bundle is untouched: axios
        // keeps the same-origin `/api/backend` prefix baked in at build time.
        // Order matters: this specific route is listed before the generic
        // /api/:path* fallback below.
        source: '/api/backend/:path*',
        destination: `${process.env.API_PROXY_TARGET || 'http://localhost:8080'}/:path*`,
      },
      {
        // Operational convenience: the backend publishes no host port in
        // docker-compose, so tooling on the host (e.g. scripts/setup-self-hosted.sh
        // calling /api/auth/bootstrap) reaches it through this same-origin proxy.
        // Here `:path*` does NOT include the `api/` segment, so it is re-added.
        source: '/api/:path*',
        destination: `${process.env.API_PROXY_TARGET || 'http://localhost:8080'}/api/:path*`,
      },
    ]
  },
}

export default nextConfig