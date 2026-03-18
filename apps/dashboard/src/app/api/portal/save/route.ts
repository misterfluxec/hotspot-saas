import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTenantIdFromRequest } from '@/lib/tenant-helper';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    const portalConfig = await request.json();

    // Validar datos requeridos
    if (!portalConfig) {
      return NextResponse.json(
        { error: 'Configuración no proporcionada' },
        { status: 400 }
      );
    }

    // Buscar portal existente del tenant
    let portal = await prisma.portal.findFirst({
      where: { tenantId }
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
          tenantId,
          name: 'Portal Principal',
          template: 'modern',
          subdomain: `${tenantId}-portal`,
          config: portalConfig,
          isPublished: true
        }
      });
    }

    console.log('Portal guardado:', {
      tenantId,
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
    
    if (error.message.includes('No autorizado')) {
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
