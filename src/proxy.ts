import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, getSession } from '@/lib/session';

export async function proxy(request: NextRequest) {
  // Update session expiration if present
  const res = await updateSession(request);

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Exclude login page
    if (request.nextUrl.pathname === '/admin/login') {
      return res || NextResponse.next();
    }

    const session = request.cookies.get('session')?.value;
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return res || NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
