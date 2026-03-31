import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_PROXY_PATH = '/_proxy';

function isInternalHost(hostname: string) {
  return hostname.endsWith('.vercel.app') || hostname === 'localhost' || hostname === '127.0.0.1';
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/__nextjs') ||
    pathname.startsWith(INTERNAL_PROXY_PATH)
  ) {
    return NextResponse.next();
  }

  const hostname = (request.headers.get('host') || '').split(':')[0];
  if (!hostname || isInternalHost(hostname)) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = INTERNAL_PROXY_PATH;
  rewriteUrl.search = '';
  rewriteUrl.searchParams.set('pathname', pathname);
  rewriteUrl.searchParams.set('search', search);

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};