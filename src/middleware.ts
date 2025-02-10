import { NextResponse } from 'next/server';

// ✅ Correct middleware structure
interface MiddlewareRequest {
  nextUrl: {
    pathname: string;
  };
  url: string;
}

export function middleware(request: MiddlewareRequest): NextResponse {
  // Example: Redirect logic
  const path = request.nextUrl.pathname;
  if (path === '/old-path') {
    return NextResponse.redirect(new URL('/new-path', request.url));
  }

  return NextResponse.next();
}

// Optional: Configure matcher
export const config = {
  matcher: '/about/:path*', // Match specific routes
};