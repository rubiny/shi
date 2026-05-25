import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const startTime = Date.now();

  const services: Array<{ name: string; status: string; latency: string }> = [];

  // Check Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const t0 = Date.now();
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' },
        signal: AbortSignal.timeout(5000),
      });
      services.push({ name: 'Supabase', status: res.ok ? 'operational' : 'degraded', latency: `${Date.now() - t0}ms` });
    } catch {
      services.push({ name: 'Supabase', status: 'down', latency: '-' });
    }
  } else {
    services.push({ name: 'Supabase', status: 'not_configured', latency: '-' });
  }

  const responseTime = Date.now() - startTime;

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV,
    response_time_ms: responseTime,
    services,
    uptime: null,
  });
}
