import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTenantIdFromRequest, isSuperAdmin } from '@/lib/tenant-helper';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    const superAdmin = await isSuperAdmin(request);
    
    // Si es superadmin, puede ver stats globales
    if (superAdmin) {
      const globalStats = {
        totalTenants: await prisma.tenant.count(),
        totalUsers: await prisma.user.count(),
        totalVisitors: await prisma.visitor.count(),
        activeSubscriptions: await prisma.subscription.count({
          where: { status: 'active' }
        }),
      };
      
      return NextResponse.json(globalStats);
    }
    
    // Stats filtrados por tenantId
    const tenantStats = await Promise.all([
      // Visitantes activos (últimos 30 minutos)
      prisma.visitor.count({
        where: {
          tenantId,
          lastSeenAt: {
            gte: new Date(Date.now() - 30 * 60 * 1000)
          }
        }
      }),
      
      // Portales activos
      prisma.portal.count({
        where: {
          tenantId,
          isPublished: true
        }
      }),
      
      // Sesiones de hoy
      prisma.visitor.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Total de visitantes este mes
      prisma.visitor.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    const stats = {
      activeVisitors: tenantStats[0],
      activePortals: tenantStats[1],
      todaySessions: tenantStats[2],
      monthlyVisitors: tenantStats[3],
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching realtime stats:', error);
    
    if (error.message.includes('No autorizado')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error fetching stats' },
      { status: 500 }
    );
  }
}
