import { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export interface TenantContext {
  tenantId: string;
  userId: string;
  role: string;
  email: string;
}

/**
 * Función helper para usar en TODAS las APIs de tenant
 * Valida JWT, extrae tenantId y verifica permisos
 */
export async function requireTenant(request: NextRequest, allowedRoles: string[] = ['admin', 'superadmin']): Promise<TenantContext> {
  const token = request.cookies.get('token')?.value;
  if (!token) throw new Error('No autorizado: Token no encontrado');
  
  const payload = await verifyJWT(token);
  if (!payload) throw new Error('Token inválido');
  if (!payload.tenantId) throw new Error('Tenant no identificado: tenantId faltante');
  if (!allowedRoles.includes(payload.role)) throw new Error(`Rol no permitido: ${payload.role}`);
  
  return {
    tenantId: payload.tenantId,
    userId: payload.userId,
    role: payload.role,
    email: payload.email,
  };
}

/**
 * Helper específico para superadmin
 */
export async function requireSuperAdmin(request: NextRequest): Promise<TenantContext> {
  return requireTenant(request, ['superadmin']);
}

/**
 * Helper específico para admin de tenant
 */
export async function requireTenantAdmin(request: NextRequest): Promise<TenantContext> {
  return requireTenant(request, ['admin']);
}

/**
 * Verifica si el usuario es superadmin sin lanzar error
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
 * Extrae tenantId de forma segura (sin validación de rol)
 */
export async function getTenantId(request: NextRequest): Promise<string> {
  const token = request.cookies.get('token')?.value;
  if (!token) throw new Error('No autorizado: Token no encontrado');
  
  const payload = await verifyJWT(token);
  if (!payload?.tenantId) throw new Error('Tenant no identificado: tenantId faltante');
  
  return payload.tenantId;
}
