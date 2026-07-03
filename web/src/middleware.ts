import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If an external tab from a previous project aggressively polls /messages on port 3000,
  // we intercept it here and return a silent 200 OK to prevent 404 logs from spamming the console.
  if (request.nextUrl.pathname.startsWith('/messages')) {
    return NextResponse.json({});
  }
}

export const config = {
  matcher: '/messages/:path*',
};
