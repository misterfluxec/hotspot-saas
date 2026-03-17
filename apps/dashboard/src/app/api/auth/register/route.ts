import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateJWT } from '@/lib/auth';

const prisma = new PrismaClient();

// Función simulada de envío de email (puede ser reemplazada por Resend/Nodemailer)
async function sendWelcomeEmail(businessName: string, email: string) {
  try {
    // Simulación de envío de email
    console.log(`
      📧 EMAIL DE BIENVENIDA ENVIADO A: ${email}
      
      Asunto: ¡Bienvenido a la familia de HotSpot SaaS, ${businessName}!
      
      Cuerpo:
      ¡Hola ${businessName}!
      
      Estamos emocionados de ayudarte a transformar tu WiFi en una herramienta de crecimiento. 
      Tu prueba de 14 días ha comenzado. Vamos a configurar tu primer portal.
      
      Tu panel de administración está listo en: https://labodegaec.com/cliente
      
      Si necesitas ayuda, estamos aquí para ti.
      
      El equipo de HotSpot SaaS 🚀
    `);

    // Aquí iría la integración real con Resend/Nodemailer:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'onboarding@hotspot-saas.com',
    //   to: [email],
    //   subject: `¡Bienvenido a la familia de HotSpot SaaS, ${businessName}!`,
    //   html: `...`
    // });

    return true;
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { businessName, businessType, email, password, planId } = await request.json();

    // Validar campos requeridos
    if (!businessName || !businessType || !email || !password || !planId) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        tenant: {
          billingEmail: email
        }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Obtener el plan seleccionado
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json(
        { message: 'Plan no encontrado' },
        { status: 400 }
      );
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: businessName,
        slug: businessName.toLowerCase().replace(/\s+/g, '-'),
        businessType,
        billingEmail: email,
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días de trial
        planId: plan.id,
      }
    });

    // Crear el usuario administrador
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: 'admin',
        name: 'Administrador',
        tenantId: tenant.id,
      }
    });

    // Generar JWT
    const token = await generateJWT({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
      email: user.email,
    });

    // Crear suscripción
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: plan.id,
        status: 'active',
        currentPeriodEnd: tenant.trialEndsAt!,
        amountUsd: plan.priceMonthly,
      }
    });

    // Enviar email de bienvenida
    await sendWelcomeEmail(businessName, email);

    return NextResponse.json({
      message: 'Registro exitoso',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
      },
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
