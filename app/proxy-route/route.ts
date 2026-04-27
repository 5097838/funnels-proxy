const PLATFORM_URL = process.env.PLATFORM_URL || 'https://funnels.by';
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const FILE_WITH_EXTENSION = /\/[^/]+\.[^/]+$/;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

function buildRequestHeaders(request: Request) {
  const headers = new Headers();
  const passthroughHeaders = ['accept', 'accept-language', 'content-type', 'user-agent'];

  for (const key of passthroughHeaders) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }

  return headers;
}

function buildResponseHeaders(headers: Headers) {
  const nextHeaders = new Headers(headers);
  nextHeaders.delete('content-length');
  nextHeaders.delete('content-encoding');
  nextHeaders.delete('transfer-encoding');
  return nextHeaders;
}

async function proxyRequest(request: Request) {
  const url = new URL(request.url);
  const pathname = url.searchParams.get('pathname') || '/';
  const search = url.searchParams.get('search') || '';
  const hostname = (request.headers.get('host') || '').split(':')[0];
  const isAssetRequest = pathname.startsWith('/assets/') || FILE_WITH_EXTENSION.test(pathname);

  let upstreamPath = pathname;

  if (!isAssetRequest) {
    const slug = await getLandingSlug(hostname);
    if (!slug) {
      return new Response('Domain not configured', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    upstreamPath = pathname === '/' ? '/p/' + slug : pathname;
  }

  const upstreamUrl = new URL(upstreamPath + search, PLATFORM_URL);
  const upstreamResponse = await fetch(upstreamUrl.toString(), {
    headers: buildRequestHeaders(request),
    cache: 'no-store',
    redirect: 'follow',
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: buildResponseHeaders(upstreamResponse.headers),
  });
}

export async function GET(request: Request) {
  return proxyRequest(request);
}

export async function HEAD(request: Request) {
  return proxyRequest(request);
}