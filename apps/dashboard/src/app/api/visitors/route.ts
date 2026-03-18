import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireTenant } from '@/lib/tenant-guard';

const prisma = new PrismaClient();

// GET - Listar visitantes del tenant
export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await requireTenant(request, ['admin', 'superadmin']);
    
    // ⚠️ PELIGROSO - NO HACER ESTO:
    // const dangerousTenantId = request.nextUrl.searchParams.get('tenantId');
    // const data = await prisma.visitor.findMany({
    //   where: { tenantId: dangerousTenantId } // ← Data leakage!
    // });
    
    // ✅ SEGURO - HACER ESTO:
    const visitors = await prisma.visitor.findMany({
      where: { tenantId }, // ← Seguro: viene del JWT
      include: {
        branch: {
          select: { name: true }
        }
      },
      orderBy: { lastSeenAt: 'desc' },
      take: 100 // Limitar resultados
    });
    
    return NextResponse.json({
      success: true,
      data: visitors,
      count: visitors.length
    });
    
  } catch (error) {
    console.error('Error fetching visitors:', error);
    
    if (error.message.includes('No autorizado') || error.message.includes('Token') || error.message.includes('Rol')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Error fetching visitors' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo visitante
export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await requireTenant(request, ['admin', 'superadmin']);
    const body = await request.json();
    
    // Validar datos requeridos
    const { name, email, phone, macAddress, branchId } = body;
    
    if (!macAddress) {
      return NextResponse.json(
        { success: false, error: 'MAC address requerido' },
        { status: 400 }
      );
    }
    
    // Verificar que la sucursal pertenezca al tenant
    if (branchId) {
      const branch = await prisma.branch.findFirst({
        where: { 
          id: branchId,
          tenantId // ← CRÍTICO: Verificar ownership
        }
      });
      
      if (!branch) {
        return NextResponse.json(
          { success: false, error: 'Sucursal no encontrada o no pertenece al tenant' },
          { status: 404 }
        );
      }
    }
    
    const visitor = await prisma.visitor.create({
      data: {
        tenantId, // ← Seguro: viene del JWT
        name,
        email,
        phone,
        macAddress,
        branchId,
        visitCount: 1,
        firstSeenAt: new Date(),
        lastSeenAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      data: visitor,
      message: 'Visitante registrado exitosamente'
    });
    
  } catch (error) {
    console.error('Error creating visitor:', error);
    
    if (error.message.includes('No autorizado') || error.message.includes('Token') || error.message.includes('Rol')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'MAC address ya registrado' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Error creating visitor' },
      { status: 500 }
    );
  }
}
