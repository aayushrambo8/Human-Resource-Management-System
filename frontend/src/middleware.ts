import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BLOCKED_BOT_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /python-requests/i,
  /scrapy/i,
];

function isLocalHost(host: string): boolean {
  const hostname = host.split(':')[0]?.toLowerCase() ?? '';
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
}

// Route protection decision (2026-10-28): authentication tokens live in
// sessionStorage (client-side only) and are never sent as cookies, so this
// middleware cannot observe a session. Protection is therefore layered as:
//   1. Client-side gating in the (dashboard) layout (redirects to /login).
//   2. Server-side enforcement in the Spring Boot API (every /api/** route
//      except health/auth/biometric-punch requires a valid JWT).
export function middleware(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const proto = request.headers.get('x-forwarded-proto');

  // Force HTTPS in production behind a reverse proxy / load balancer
  if (
    process.env.NODE_ENV === 'production' &&
    proto === 'http' &&
    host &&
    !isLocalHost(host)
  ) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = 'https:';
    httpsUrl.host = host;
    return NextResponse.redirect(httpsUrl, 301);
  }

  // Basic automated scanner / malicious bot filtering
  const ua = request.headers.get('user-agent') || '';
  if (BLOCKED_BOT_PATTERNS.some((pattern) => pattern.test(ua))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const response = NextResponse.next();
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
