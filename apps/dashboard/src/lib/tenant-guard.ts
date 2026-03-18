import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Payload esperado del JWT
export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: 'admin' | 'superadmin';
  email: string;
  iat?: number;
  exp?: number;
}

// Contexto seguro para usar en APIs
export interface TenantContext {
  tenantId: string;
  userId: string;
  role: 'admin' | 'superadmin';
  email: string;
}

// Clave secreta para verificar JWT
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

/**
 * Verifica y decodifica el JWT de la cookie
 * @param token - Token JWT de la cookie
 * @returns Payload decodificado o null si es inválido
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extrae y valida el contexto del tenant desde la request
 * ⚠️ REGLA DE ORO: tenantId SIEMPRE viene del JWT, NUNCA del body/query
 * 
 * @param request - NextRequest con cookies
 * @param allowedRoles - Roles permitidos para acceder (default: ['admin', 'superadmin'])
 * @returns TenantContext validado
 * @throws Error si no hay token, es inválido, o el rol no está permitido
 */
export async function requireTenant(
  request: NextRequest,
  allowedRoles: ('admin' | 'superadmin')[] = ['admin', 'superadmin']
): Promise<TenantContext> {
  // 1. Extraer token de cookies
  const token = request.cookies.get('token')?.value;  
  if (!token) {
    throw new Error('No autorizado: Token no encontrado');
  }

  // 2. Verificar y decodificar JWT
  const payload = await verifyJWT(token);
  
  if (!payload) {
    throw new Error('Token inválido o expirado');
  }

  if (!payload.tenantId) {
    throw new Error('Tenant no identificado: tenantId faltante en JWT');
  }

  // 3. Validar rol
  if (!allowedRoles.includes(payload.role)) {
    throw new Error(`Rol no permitido: ${payload.role}. Requiere: ${allowedRoles.join(', ')}`);
  }

  // 4. Retornar contexto seguro
  return {
    tenantId: payload.tenantId,
    userId: payload.userId,
    role: payload.role,
    email: payload.email,
  };
}

/**
 * Helper para verificar si el usuario es superadmin
 * @param request - NextRequest con cookies
 * @returns boolean indicando si es superadmin
 */
export async function isSuperAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return false;
    
    const payload = await verifyJWT(token);
    return payload?.role === 'superadmin';
  } catch {
    return false;
  }
}

/**
 * Wrapper para APIs que retornan NextResponse con manejo de errores
 * @param handler - Función asíncrona que recibe TenantContext
 * @returns NextResponse con error handling automático
 */
export function withTenantGuard<T>(
  handler: (context: TenantContext, request: NextRequest) => Promise<T>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const context = await requireTenant(request);
      const result = await handler(context, request);
      
      return NextResponse.json(result);
    } catch (error) {
      console.error('❌ Error en API protegida:', error);
      
      if (error instanceof Error) {
        const message = error.message;
        
        if (message.includes('Token')) {
          return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        if (message.includes('Rol')) {
          return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }
      }
      
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  };
}

/**
 * Ejemplo de uso en una API:
 * 
 * export const GET = withTenantGuard(async (context, request) => {
 *   const visitors = await prisma.visitor.findMany({
 *     where: { tenantId: context.tenantId }, // ← SIEMPRE usar context.tenantId
 *     orderBy: { lastSeenAt: 'desc' },
 *     take: 50,
 *   });
 *   return { visitors };
 * });
 */
