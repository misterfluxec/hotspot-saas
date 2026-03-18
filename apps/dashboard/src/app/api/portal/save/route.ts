import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireTenant } from '@/lib/tenant-guard';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Validar tenant y permisos
    const { tenantId } = await requireTenant(request, ['admin', 'superadmin']);
    const portalConfig = await request.json();

    // Validar datos requeridos
    if (!portalConfig) {
      return NextResponse.json(
        { error: 'Configuración no proporcionada' },
        { status: 400 }
      );
    }

    // Buscar portal existente del tenant (filtrado por JWT)
    let portal = await prisma.portal.findFirst({
      where: { tenantId } // ← Seguro: viene del JWT
    });

    if (portal) {
      // Actualizar portal existente
      portal = await prisma.portal.update({
        where: { id: portal.id },
        data: {
          config: portalConfig,
          updatedAt: new Date()
        }
      });
    } else {
      // Crear nuevo portal
      portal = await prisma.portal.create({
        data: {
          tenantId, // ← Seguro: viene del JWT
          name: 'Portal Principal',
          template: 'modern',
          subdomain: `${tenantId}-portal`,
          config: portalConfig,
          isPublished: true
        }
      });
    }

    console.log('Portal guardado:', {
      tenantId, // ← Safe: del JWT
      portalId: portal.id,
      action: portal ? 'updated' : 'created'
    });

    return NextResponse.json({
      success: true,
      message: 'Configuración guardada exitosamente',
      portalId: portal.id
    });

  } catch (error) {
    console.error('Error guardando configuración del portal:', error);
    
    if (error.message.includes('No autorizado') || error.message.includes('Token') || error.message.includes('Rol')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error guardando configuración' },
      { status: 500 }
    );
  }
}
