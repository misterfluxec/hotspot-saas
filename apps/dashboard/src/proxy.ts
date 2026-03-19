import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-netfly-2026'
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. LISTA BLANCA ABSOLUTA (Rutas que NUNCA deben dar 401)
  const isPublicApi = pathname.startsWith('/api/auth/login') || 
                      pathname.startsWith('/api/auth/register') ||
                      pathname.startsWith('/api/test');
  
  const isPublicPage = pathname === '/login' || pathname === '/register';

  if (isPublicApi || isPublicPage) {
    return NextResponse.next(); // Pasa sin pedir token
  }

  // 2. VERIFICACIÓN DE TOKEN (Solo para el resto de rutas)
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // Si es una API, devolvemos JSON. Si es una página, redirigimos a login.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const response = NextResponse.next();
    
    // Inyectamos info del usuario para que los endpoints la usen
    response.headers.set('x-user-id', payload.userId as string);
    response.headers.set('x-tenant-id', payload.tenantId as string);
    
    return response;
  } catch (err) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// 3. CONFIGURACIÓN DEL MATCHER
// Esto le dice a Next.js qué rutas procesar. 
// Excluimos estáticos para no ralentizar el sistema.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
