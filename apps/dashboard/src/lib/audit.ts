import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

export interface AuditLogData {
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  details?: any;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    // Obtener información de la request
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Crear log de auditoría
    const auditLog = await prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        details: data.details,
        ipAddress,
        userAgent,
      },
    });

    console.log(`🔍 Audit Log Created: ${data.action} on ${data.resource} by user ${data.userId}`);
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // No lanzar error para no interrumpir el flujo principal
    return null;
  }
}

// Funciones helper para acciones comunes
export const auditActions = {
  // Auth actions
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  TFA_ENABLED: 'TFA_ENABLED',
  TFA_DISABLED: 'TFA_DISABLED',
  
  // User actions
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  
  // Tenant actions
  TENANT_CREATED: 'TENANT_CREATED',
  TENANT_UPDATED: 'TENANT_UPDATED',
  TENANT_DELETED: 'TENANT_DELETED',
  
  // Portal actions
  PORTAL_CREATED: 'PORTAL_CREATED',
  PORTAL_UPDATED: 'PORTAL_UPDATED',
  PORTAL_DELETED: 'PORTAL_DELETED',
  PORTAL_SETTINGS_CHANGED: 'PORTAL_SETTINGS_CHANGED',
  
  // Branch actions
  BRANCH_CREATED: 'BRANCH_CREATED',
  BRANCH_UPDATED: 'BRANCH_UPDATED',
  BRANCH_DELETED: 'BRANCH_DELETED',
  
  // Admin actions
  CLIENT_CREATED: 'CLIENT_CREATED',
  CLIENT_UPDATED: 'CLIENT_UPDATED',
  CLIENT_DELETED: 'CLIENT_DELETED',
  
  // System actions
  DATA_EXPORT: 'DATA_EXPORT',
  DATA_IMPORT: 'DATA_IMPORT',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
  API_ACCESS: 'API_ACCESS',
} as const;

// Función para obtener logs de auditoría con filtros
export async function getAuditLogs(
  tenantId: string,
  options: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}
) {
  const where: any = { tenantId };

  if (options.userId) where.userId = options.userId;
  if (options.action) where.action = options.action;
  if (options.resource) where.resource = options.resource;
  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) where.createdAt.gte = options.startDate;
    if (options.endDate) where.createdAt.lte = options.endDate;
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit || 100,
    skip: options.offset || 0,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return logs;
}

// Función para limpiar logs antiguos (retention policy)
export async function cleanupOldAuditLogs(daysToKeep: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  console.log(`🧹 Cleaned up ${result.count} old audit logs`);
  return result.count;
}
