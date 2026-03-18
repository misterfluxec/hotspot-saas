import { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

/**
 * Función helper segura para extraer tenantId del request
 * Siempre devuelve un string o lanza un error
 */
export async function getTenantIdFromRequest(request: NextRequest): Promise<string> {
  // Método 1: Revisar headers del middleware (preferido)
  const tenantIdFromHeader = request.headers.get('x-tenant-id');
  if (tenantIdFromHeader) {
    return tenantIdFromHeader;
  }
  
  // Método 2: Revisar token directamente (fallback)
  const token = request.cookies.get('token')?.value;
  if (!token) {
    throw new Error('No autorizado: Token no encontrado');
  }
  
  const payload = await verifyJWT(token);
  if (!payload?.tenantId) {
    throw new Error('Tenant no identificado: tenantId no encontrado en token');
  }
  
  return payload.tenantId;
}

/**
 * Verifica si el usuario es superadmin
 */
export async function isSuperAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('token')?.value;
  if (!token) return false;
  
  const payload = await verifyJWT(token);
  return payload?.role === 'superadmin' || false;
}

/**
 * Obtiene el payload del usuario de forma segura
 */
export async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  
  const payload = await verifyJWT(token);
  return payload;
}
