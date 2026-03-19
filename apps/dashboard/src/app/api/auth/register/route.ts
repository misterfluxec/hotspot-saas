import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { z } from 'zod';

const prisma = new PrismaClient();

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-netfly-2026'
);

const registerSchema = z.object({
  businessName: z.string().min(2, 'Nombre muy corto'),
  businessType: z.string().min(1, 'Tipo requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  planId: z.enum(['starter', 'business', 'enterprise']),
  termsAccepted: z.boolean().refine((v) => v === true, 'Debes aceptar términos'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // CRÍTICO: Normalizar planId para coincidencia exacta
    const normalizedPlanId = validated.planId.toLowerCase().trim();
    
    // Buscar plan por ID fijo
    const plan = await prisma.plan.findUnique({
      where: { id: normalizedPlanId },
      select: { id: true, name: true, priceMonthly: true }
    });

    if (!plan) {
      const available = await prisma.plan.findMany({ select: { id: true, name: true }});
      return NextResponse.json(
        { 
          message: `Plan no válido: "${normalizedPlanId}". Disponibles: ${available.map(p => p.id).join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Transacción atómica: tenant + user + subscription
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear tenant con trial
      const tenant = await tx.tenant.create({
        data: {
          name: validated.businessName,
          slug: validated.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          businessType: validated.businessType,
          billingEmail: validated.email,
          status: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      // 2. Hash de contraseña
      const passwordHash = await bcrypt.hash(validated.password, 10);

      // 3. Crear usuario admin
      const user = await tx.user.create({
        data: {
          email: validated.email,
          passwordHash: passwordHash,  // ← CRÍTICO: Campo correcto
          name: validated.businessName,
          role: 'admin',
          tenantId: tenant.id,
        },
      });

      // 4. Crear suscripción trial
      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: plan.id,
          status: 'trial',
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          amountUsd: plan.priceMonthly,
        },
      });

      return { tenant, user, subscription, plan };
    });

    // Generar JWT
    const token = await new SignJWT({
      userId: result.user.id,
      tenantId: result.tenant.id,
      role: result.user.role,
      email: result.user.email,
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

    // Email de bienvenida (simulado - listo para Resend)
    console.log('📧 [SIMULADO] Email de bienvenida:', {
      to: validated.email,
      subject: '¡Bienvenido a HotSpot SaaS!',
      html: `<p>Hola ${validated.businessName}, tu prueba de 14 días ha comenzado.</p>` 
    });

    return NextResponse.json(
      {
        message: 'Registro exitoso',
        tenantId: result.tenant.id,
        redirect: '/onboarding',
      },
      {
        status: 201,
        headers: {
          'Set-Cookie': `token=${token}; Path=/; HttpOnly; ${
            process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
          }SameSite=Lax; Max-Age=604800`
        }
      }
    );

  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.issues },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: 'Este email ya está registrado' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
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
