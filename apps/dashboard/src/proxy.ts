import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  const payload = await verifyJWT(token);
  
  if (!payload || !payload.tenantId) { // ← VALIDAR tenantId
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Agregar tenantId a headers para usar en APIs
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', payload.tenantId);
  
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/cliente/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/portal/:path*',
    '/api/stats/:path*',
  ],
};
