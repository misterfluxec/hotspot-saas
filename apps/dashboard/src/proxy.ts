import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-netfly-2026');

// En Next.js 16, si el archivo es proxy.ts, la función DEBE llamarse proxy
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 1. Rutas públicas permitidas
  const publicPaths = ['/login', '/register', '/api/auth'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Bloqueo si no hay token
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // 3. Inyectar contexto de tenant para las APIs (Multi-tenancy)
    const response = NextResponse.next();
    response.headers.set('x-tenant-id', payload.tenantId as string);
    response.headers.set('x-user-role', payload.role as string);
    
    return response;
  } catch (err) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configuración de rutas a proteger
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
