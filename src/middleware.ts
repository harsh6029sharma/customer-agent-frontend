import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add authentication or route protection logic here
  // e.g. checking token/cookies and redirecting to /login if unauthenticated
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tickets/:path*',
  ],
};
