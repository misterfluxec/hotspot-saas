import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/auth';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login'];

// Rutas de API que no requieren autenticación
const publicApiRoutes = ['/api/auth/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas sin autenticación
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir API routes públicas sin autenticación
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Para rutas estáticas y recursos, permitir acceso
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') || // archivos con extensión (css, js, images)
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Verificar el token JWT en las cookies
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // No hay token, redirigir al login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar el token
  const payload = verifyJWT(token);
  
  if (!payload) {
    // Token inválido, redirigir al login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token válido, permitir acceso
  // Agregar información del usuario a los headers para uso en las páginas
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.userId);
  response.headers.set('x-user-email', payload.email);
  response.headers.set('x-user-name', payload.name);
  response.headers.set('x-user-role', payload.role);
  response.headers.set('x-tenant-id', payload.tenantId);

  return response;
}

// Configurar qué rutas debe manejar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
