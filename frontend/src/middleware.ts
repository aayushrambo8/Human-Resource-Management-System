import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route protection decision (2026-10-28): authentication tokens live in
// sessionStorage (client-side only) and are never sent as cookies, so this
// middleware cannot observe a session. Protection is therefore layered as:
//   1. Client-side gating in the (dashboard) layout (redirects to /login).
//   2. Server-side enforcement in the Spring Boot API (every /api/** route
//      except health/auth/biometric-punch requires a valid JWT).
// This middleware intentionally does not redirect; keep it for future
// server-side concerns (bot filtering, headers) without reintroducing the
// cookie-vs-sessionStorage redirect loop.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
