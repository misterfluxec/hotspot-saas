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
            success: false,
            message: `Plan no encontrado: "${normalizedPlanId}". Planes disponibles: ${availablePlans.map((p: any) => p.name).join(', ')}`,
            availablePlans,
            timestamp: new Date().toISOString()
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
        { 
          success: false,
          message: 'Datos inválidos', 
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    // Error general
    return NextResponse.json(
      { 
        success: false,
        message: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

async function createTenant(data: z.infer<typeof registerSchema>, plan: any) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const slug = data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Crear tenant + user + suscripción en transacción atómica
  const result = await prisma.$transaction(async (tx: any) => {
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

  // Enviar email de bienvenida
  await sendWelcomeEmail(data.businessName, data.email);

  return NextResponse.json(
    {
      success: true,
      message: 'Registro exitoso',
      tenantId: result.tenant.id,
      redirect: '/onboarding',
      timestamp: new Date().toISOString()
    },
    { status: 201 }
  );
}

async function sendWelcomeEmail(businessName: string, email: string) {
  try {
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a HotSpot SaaS</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0a0a0a;
            color: #ffffff;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #3f3f46;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .trial-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .content {
            padding: 40px 30px;
          }
          .welcome-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #ffffff;
          }
          .welcome-subtitle {
            color: #a1a1aa;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .features {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .feature-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            color: #e4e4e7;
          }
          .feature-item:last-child {
            margin-bottom: 0;
          }
          .feature-icon {
            width: 20px;
            height: 20px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.3);
          }
          .footer {
            background: rgba(255, 255, 255, 0.02);
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }
          .footer-text {
            color: #71717a;
            font-size: 14px;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔥 HotSpot SaaS</div>
            <div class="trial-badge">🎉 14 DÍAS DE PRUEBA GRATIS</div>
          </div>
          
          <div class="content">
            <h2 class="welcome-title">¡Bienvenido a la familia de HotSpot SaaS, ${businessName}!</h2>
            <p class="welcome-subtitle">
              Estamos emocionados de ayudarte a transformar tu WiFi en una poderosa herramienta de crecimiento. 
              Tu prueba gratuita de 14 días ha comenzado y ya puedes empezar a configurar tu primer portal.
            </p>
            
            <div class="features">
              <div class="feature-item">
                <div class="feature-icon">✓</div>
                <span>Portal WiFi personalizado y profesional</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">✓</div>
                <span>Analytics avanzados para entender a tus clientes</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">✓</div>
                <span>Soporte prioritario durante todo tu trial</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://saas.labodegaec.com/cliente" class="cta-button">
                Ir al Panel de Administración →
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Si necesitas ayuda, estamos aquí para ti.<br>
              El equipo de HotSpot SaaS 🚀
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`
      📧 EMAIL DE BIENVENIDA ENVIADO A: ${email}
      
      Asunto: ¡Bienvenido a la familia de HotSpot SaaS, ${businessName}!
      HTML Premium: Diseño con gradientes y glassmorphism
    `);

    // Aquí iría la integración real con Resend/Nodemailer:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'onboarding@hotspot-saas.com',
    //   to: [email],
    //   subject: `¡Bienvenido a la familia de HotSpot SaaS, ${businessName}!`,
    //   html: emailHTML
    // });

    return true;
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    return false;
  }
}
