import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTenantIdFromRequest, isSuperAdmin } from '@/lib/tenant-helper';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener tenantId del request
    const tenantId = await getTenantIdFromRequest(request);
    const superAdmin = await isSuperAdmin(request);
    
    // 2. VERIFICAR ROL: Solo superadmin ve todos los tenants
    if (!superAdmin) {
      // 3. FILTRAR POR tenantId DEL USUARIO (NO DEL QUERY PARAM)
      const tenants = await prisma.tenant.findMany({
        where: { id: tenantId }, // ← CRÍTICO: Filtrar por JWT, nunca por query params
        include: {
          subscriptions: { 
            select: { status: true, planId: true, amountUsd: true },
            orderBy: { createdAt: 'desc' }
          },
          _count: { 
            select: { 
              branches: true, 
              users: true,
              visitors: true,
              portals: true
            } 
          },
        },
      });
      
      return NextResponse.json({ 
        success: true,
        tenants,
        count: tenants.length
      });
    }
    
    // Solo superadmin puede ver todos
    const allTenants = await prisma.tenant.findMany({
      include: {
        subscriptions: { 
          select: { status: true, planId: true, amountUsd: true },
          orderBy: { createdAt: 'desc' }
        },
        _count: { 
          select: { 
            branches: true, 
            users: true,
            visitors: true,
            portals: true
          } 
        },
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ 
      success: true,
      tenants: allTenants,
      count: allTenants.length
    });
    
  } catch (error) {
    console.error('Error fetching tenants:', error);
    
    if (error.message.includes('No autorizado')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Error fetching tenants' },
      { status: 500 }
    );
  }
}
