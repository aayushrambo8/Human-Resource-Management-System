# Next.js standalone production image.
#
# The old Vite-era Dockerfile (index.html / vite.config.ts / nginx + dist) was
# dead after the Next.js migration; this replaces it with the official
# multi-stage standalone pattern (see next.config.ts `output: 'standalone'`).

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# No NEXT_PUBLIC_* build arg: the browser talks to the same-origin
# `/api/backend` proxy prefix (inlined at build time). The proxy TARGET is a
# runtime concern — set API_PROXY_TARGET in the container environment
# (docker-compose.yml does: http://backend:8080).
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# next.config.ts reads API_PROXY_TARGET when the standalone server starts.
ENV API_PROXY_TARGET=http://backend:8080
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
# The standalone server honours PORT/HOSTNAME (default 3000/0.0.0.0).
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --retries=12 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/ || exit 1
CMD ["node", "server.js"]
