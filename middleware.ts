import { NextRequest, NextResponse } from 'next/server';

const PLATFORM_URL = process.env.PLATFORM_URL || 'https://boost-sell-speed.lovable.app';
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const FILE_WITH_EXTENSION = /\/[^/]+\.[^/]+$/;

async function getLandingSlug(hostname: string) {
  const domainUrl = new URL('/rest/v1/custom_domains', SUPABASE_URL);
  domainUrl.searchParams.set('select', 'landing_page_id');
  domainUrl.searchParams.set('domain', 'eq.' + hostname);
  domainUrl.searchParams.set('status', 'eq.active');

  const domainResp = await fetch(domainUrl.toString(), {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
    },
    cache: 'no-store',
  });

  if (!domainResp.ok) return null;

  const [domainData] = await domainResp.json();
  if (!domainData?.landing_page_id) return null;

  const landingUrl = new URL('/rest/v1/landing_pages', SUPABASE_URL);
  landingUrl.searchParams.set('select', 'slug');
  landingUrl.searchParams.set('id', 'eq.' + domainData.landing_page_id);

  const landingResp = await fetch(landingUrl.toString(), {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
    },
    cache: 'no-store',
  });

  if (!landingResp.ok) return null;

  const [landingData] = await landingResp.json();
  return landingData?.slug || null;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/__nextjs')
  ) {
    return NextResponse.next();
  }

  const targetUrl = new URL(PLATFORM_URL);
  const hostname = (request.headers.get('host') || '').split(':')[0];
  const isAssetRequest = pathname.startsWith('/assets/') || FILE_WITH_EXTENSION.test(pathname);

  if (isAssetRequest) {
    return NextResponse.rewrite(new URL(pathname + search, targetUrl));
  }

  const slug = await getLandingSlug(hostname);
  if (!slug) {
    return NextResponse.next();
  }

  const upstreamPath = pathname === '/' ? '/p/' + slug : pathname;
  return NextResponse.rewrite(new URL(upstreamPath + search, targetUrl));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};