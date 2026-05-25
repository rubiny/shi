import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = ['/admin', '/api/admin'];

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // max requests per window
const RATE_LIMIT_MAP_SIZE = 10_000; // max tracked IPs

// Bounded LRU-like rate limit map — evicts oldest entries when full
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    // Evict expired entries when map gets large
    if (rateLimitMap.size >= RATE_LIMIT_MAP_SIZE) {
      const keysToDelete: string[] = [];
      for (const [key, val] of rateLimitMap) {
        if (now > val.resetAt) keysToDelete.push(key);
        if (keysToDelete.length >= RATE_LIMIT_MAP_SIZE / 2) break;
      }
      for (const key of keysToDelete) rateLimitMap.delete(key);
      // If still too large, evict oldest (first in Map iteration order)
      if (rateLimitMap.size >= RATE_LIMIT_MAP_SIZE) {
        const oldest = rateLimitMap.keys().next().value;
        if (oldest) rateLimitMap.delete(oldest);
      }
    }

    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  // Re-insert to refresh LRU position
  rateLimitMap.delete(ip);
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > RATE_LIMIT_MAX;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // Rate limiting on API routes
  if (pathname.startsWith('/api/')) {
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  // Create response for cookie manipulation
  let supabaseResponse = NextResponse.next({ request });

  // Refresh Supabase auth session via cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh session — IMPORTANT: do not remove this
    const { data: { user } } = await supabase.auth.getUser();

    // Admin route protection
    if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
      if (!user) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // Security headers
  supabaseResponse.headers.set('X-Frame-Options', 'DENY');
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    supabaseResponse.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.onesignal.com https://hcaptcha.com https://*.hcaptcha.com https://accounts.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.offertoro.com https://api.adgem.com https://adscendmedia.com https://*.sentry.io https://*.onesignal.com https://*.google-analytics.com https://*.posthog.com https://*.mixpanel.com https://hcaptcha.com https://*.hcaptcha.com https://accounts.google.com",
        "frame-src 'self' https://www.offertoro.com https://wall.adgem.com https://adscendmedia.com https://hcaptcha.com https://*.hcaptcha.com https://accounts.google.com",
        "worker-src 'self' blob:",
      ].join('; ')
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|screenshots/|og-image|manifest.json|sw.js|white-shit-logo).*)',
  ],
};
