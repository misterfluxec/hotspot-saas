import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireTenant, requireSuperAdmin, isSuperAdmin } from '@/lib/tenant-guard';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verificar si es superadmin para acceso global
    const superAdmin = await isSuperAdmin(request);
    
    if (!superAdmin) {
      // Para usuarios normales, solo pueden ver su propio tenant
      const { tenantId } = await requireTenant(request, ['admin', 'superadmin']);
      
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
    
    // Solo superadmin puede ver todos los tenants
    const { tenantId: adminTenantId } = await requireSuperAdmin(request);
    
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
    
    if (error.message.includes('No autorizado') || error.message.includes('Token') || error.message.includes('Rol')) {
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
