import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireTenant, TenantContext } from '@/lib/tenant-guard';

const prisma = new PrismaClient();

/**
 * GET /api/visitors
 * Lista visitantes del tenant autenticado
 * 
 * Query params opcionales:
 * - search: string (busca por nombre, email, phone, macAddress)
 * - branchId: string (filtra por sucursal específica)
 * - recurrent: boolean (filtra visitantes con visitCount > 3)
 * - limit: number (default: 50, max: 200)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Obtener contexto del tenant (CRÍTICO: viene del JWT)
    const { tenantId } = await requireTenant(request);

    // 2. Parsear query params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase();
    const branchId = searchParams.get('branchId');
    const recurrent = searchParams.get('recurrent') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    // 3. Construir where clause con FILTRADO POR TENANT (REGLA DE ORO)
    const where: any = { tenantId }; // ← SIEMPRE empezar con tenantId

    // Filtro por búsqueda
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { macAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtro por sucursal (con validación de ownership)
    if (branchId) {
      // Verificar que la sucursal pertenezca al tenant
      const branch = await prisma.branch.findFirst({
        where: { id: branchId, tenantId }, // ← Validar ownership
      });
      
      if (!branch) {
        return NextResponse.json(
          { error: 'Sucursal no encontrada o no pertenece a tu cuenta' },
          { status: 404 }
        );
      }
      where.branchId = branchId;
    }

    // Filtro por recurrentes
    if (recurrent) {
      where.visitCount = { gt: 3 };
    }

    // 4. Ejecutar consulta con filtros aplicados
    const visitors = await prisma.visitor.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true } },
      },
      orderBy: { lastSeenAt: 'desc' },
      take: limit,
    });

    // 5. Calcular estadísticas para el frontend
    const stats = {
      total: visitors.length,
      recurrent: visitors.filter(v => v.visitCount > 3).length,
      newThisMonth: visitors.filter(v => {
        const firstSeen = new Date(v.firstSeenAt);
        const now = new Date();
        return firstSeen.getMonth() === now.getMonth() && 
               firstSeen.getFullYear() === now.getFullYear();
      }).length,
      activeToday: visitors.filter(v => {
        const lastSeen = new Date(v.lastSeenAt);
        const today = new Date();
        return lastSeen.toDateString() === today.toDateString();
      }).length,
    };

    return NextResponse.json({ visitors, stats });

  } catch (error) {
    console.error('❌ Error en GET /api/visitors:', error);
    
    if (error instanceof Error && error.message.includes('No autorizado')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Error al cargar visitantes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/visitors
 * Crea un nuevo visitante (ej: desde portal cautivo)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Obtener contexto del tenant
    const { tenantId } = await requireTenant(request);

    // 2. Parsear body
    const body = await request.json();
    const { macAddress, name, email, phone, branchId } = body;

    // 3. Validaciones básicas
    if (!macAddress) {
      return NextResponse.json(
        { error: 'MAC Address es requerido' },
        { status: 400 }
      );
    }

    // 4. Validar ownership de la sucursal si se proporciona
    if (branchId) {
      const branch = await prisma.branch.findFirst({
        where: { 
          id: branchId,
          tenantId // ← CRÍTICO: Verificar ownership
        }
      });
      
      if (!branch) {
        return NextResponse.json(
          { error: 'Sucursal no encontrada o no pertenece al tenant' },
          { status: 404 }
        );
      }
    }

    // 5. Buscar visitante existente por MAC + tenant
    const existingVisitor = await prisma.visitor.findFirst({
      where: {
        macAddress: macAddress.toLowerCase(),
        tenantId, // ← CRÍTICO: Buscar solo en el tenant del usuario
      },
    });

    if (existingVisitor) {
      // Actualizar lastSeenAt y incrementar visitCount
      const updated = await prisma.visitor.update({
        where: { id: existingVisitor.id },
        data: {
          lastSeenAt: new Date(),
          visitCount: { increment: 1 },
          name: name || existingVisitor.name,
          email: email || existingVisitor.email,
          phone: phone || existingVisitor.phone,
          branchId: branchId || existingVisitor.branchId,
        },
      });
      
      return NextResponse.json({ visitor: updated, action: 'updated' }, { status: 200 });
    }

    // 6. Crear nuevo visitante
    const visitor = await prisma.visitor.create({
      data: {
        tenantId, // ← CRÍTICO: Vincular al tenant correcto
        macAddress: macAddress.toLowerCase(),
        name: name || null,
        email: email || null,
        phone: phone || null,
        branchId: branchId || null,
        visitCount: 1,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json({ visitor, action: 'created' }, { status: 201 });

  } catch (error) {
    console.error('❌ Error en POST /api/visitors:', error);
    
    if (error instanceof Error && error.message.includes('No autorizado')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'MAC address ya registrado' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al procesar visitante' },
      { status: 500 }
    );
  }
}
