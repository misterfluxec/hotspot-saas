import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/register', '/onboarding'];

// Rutas de API que no requieren autenticación
const publicApiRoutes = ['/api/auth/login', '/api/auth/register'];

// Rate limiting específico por endpoint
const rateLimits = {
  '/api/auth/login': { requests: 5, windowMs: 60 * 1000 },    // 5 intentos por minuto
  '/api/auth/register': { requests: 3, windowMs: 5 * 60 * 1000 }, // 3 registros por 5 minutos
  '/api/portal/save': { requests: 20, windowMs: 60 * 1000 },   // 20 guardados por minuto
  '/api/admin/clients': { requests: 10, windowMs: 60 * 1000 },  // 10 creaciones por minuto
};

// Inicializar Redis
const redis = Redis.fromEnv();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas sin autenticación
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir API routes públicas sin autenticación
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    // Aplicar rate limiting a endpoints específicos
    const rateLimitConfig = rateLimits[pathname as keyof typeof rateLimits];
    
    if (rateLimitConfig) {
      const ip = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'anonymous';
      
      // Crear rate limiter específico para este endpoint
      const endpointRatelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(
          rateLimitConfig.requests, 
          rateLimitConfig.windowMs as Duration
        ),
      });
      
      const { success, remaining, reset } = await endpointRatelimit.limit(ip);
      
      if (!success) {
        return NextResponse.json(
          { 
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`,
            retryAfter: Math.ceil((reset - Date.now()) / 1000)
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': rateLimitConfig.requests.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': new Date(reset).toISOString(),
              'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
            }
          }
        );
      }
      
      // Agregar headers informativos
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', rateLimitConfig.requests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());
      
      return response;
    }
    
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
  const payload = await verifyJWT(token);
  
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
  response.headers.set('x-user-role', payload.role);
  response.headers.set('x-tenant-id', payload.tenantId || '');

  return response;
}

// Configurar qué rutas debe manejar el middleware
export const config = {
  matcher: [
    '/api/auth/login',
    '/api/auth/register',
    '/api/portal/save',
    '/api/admin/clients',
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
