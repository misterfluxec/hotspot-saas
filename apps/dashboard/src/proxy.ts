import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-netfly-2026');

export default async function proxy(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // Rutas exentas
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const res = NextResponse.next();
    // Inyectar tenantId en cabeceras para que las APIs filtren automáticamente
    res.headers.set('x-tenant-id', payload.tenantId as string);
    res.headers.set('x-user-role', payload.role as string);
    return res;
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
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
