import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

const registerSchema = z.object({
  businessName: z.string().min(2, 'Nombre muy corto'),
  businessType: z.string().min(1, 'Tipo requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  planId: z.string().min(1, 'Plan requerido'),
  termsAccepted: z.boolean().refine((v) => v === true, 'Debes aceptar los términos'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // CRÍTICO: Normalizar planId para coincidencia con DB
    const normalizedPlanId = validated.planId.toLowerCase().trim();
    console.log('🔍 Buscando plan con ID normalizado:', normalizedPlanId);

    // Buscar plan por ID fijo (starter, business, enterprise)
    const plan = await prisma.plan.findUnique({
      where: { id: normalizedPlanId },
    });

    if (!plan) {
      // Fallback: buscar por nombre si el ID no coincide
      const planByName = await prisma.plan.findFirst({
        where: {
          name: {
            contains: normalizedPlanId.charAt(0).toUpperCase() + normalizedPlanId.slice(1),
            mode: 'insensitive',
          },
        },
      });

      if (!planByName) {
        const availablePlans = await prisma.plan.findMany({
          select: { id: true, name: true, priceMonthly: true },
        });
        
        console.error('❌ Plan no encontrado:', {
          received: normalizedPlanId,
          available: availablePlans,
        });

        return NextResponse.json(
          {
            message: `Plan no encontrado: "${normalizedPlanId}". Planes disponibles: ${availablePlans.map(p => p.name).join(', ')}`,
            availablePlans,
          },
          { status: 400 }
        );
      }
      
      return createTenant(validated, planByName);
    }

    return createTenant(validated, plan);
  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function createTenant(data: z.infer<typeof registerSchema>, plan: any) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const slug = data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Crear tenant + user + suscripción en transacción atómica
  const result = await prisma.$transaction(async (tx) => {
    // 1. Crear tenant
    const tenant = await tx.tenant.create({
      data: {
        name: data.businessName,
        slug,
        businessType: data.businessType,
        billingEmail: data.email,
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    // 2. Crear usuario admin
    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.businessName,
        role: 'admin',
        tenantId: tenant.id,
      },
    });

    // 3. Crear suscripción trial
    const subscription = await tx.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: plan.id,
        status: 'trial',
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        amountUsd: plan.priceMonthly,
      },
    });

    return { tenant, user, subscription };
  });

  console.log('✅ Registro completado:', {
    tenantId: result.tenant.id,
    userId: result.user.id,
    planId: plan.id,
    planName: plan.name,
  });

  return NextResponse.json(
    {
      message: 'Registro exitoso',
      tenantId: result.tenant.id,
      redirect: '/onboarding',
    },
    { status: 201 }
  );
}
