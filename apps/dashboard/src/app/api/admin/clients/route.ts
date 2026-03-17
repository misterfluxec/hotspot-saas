import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateJWT } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { businessName, email, planId } = await request.json();

    // Validar datos requeridos
    if (!businessName || !email || !planId) {
      return NextResponse.json(
        { message: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Ya existe un usuario con ese email' },
        { status: 400 }
      );
    }

    // Obtener el plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { message: 'Plan no encontrado' },
        { status: 400 }
      );
    }

    // Hashear contraseña temporal (se enviará por email)
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Crear tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: businessName,
        slug: businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        billingEmail: email.toLowerCase(),
        status: 'trial',
        businessType: 'Otro', // Valor por defecto, puede ser ajustado
      },
    });

    // Crear usuario administrador
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'admin',
        tenantId: tenant.id,
        name: 'Administrador', // Nombre por defecto
      },
    });

    // Crear suscripción trial (14 días)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    const subscription = await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: planId,
        status: 'trial',
        currentPeriodEnd: trialEndDate,
        amountUsd: 0, // Free durante trial
      },
    });

    // Generar JWT para el nuevo usuario
    const token = await generateJWT({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
      email: user.email,
    });

    // TODO: Enviar email con credenciales temporales
    console.log(`
      🔐 NUEVO CLIENTE CREADO:
      Tenant: ${businessName}
      Email: ${email}
      Contraseña temporal: ${tempPassword}
      Plan: ${plan.name}
      Trial hasta: ${trialEndDate.toLocaleDateString('es-ES')}
    `);

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      userId: user.id,
      subscriptionId: subscription.id,
      tempPassword, // Solo para desarrollo, en producción enviar por email
    });

  } catch (error) {
    console.error('Error creando cliente:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
