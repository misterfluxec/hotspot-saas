import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateJWT } from '@/lib/auth';

const prisma = new PrismaClient();

// Función simulada de envío de email (puede ser reemplazada por Resend/Nodemailer)
async function sendWelcomeEmail(businessName: string, email: string) {
  try {
    // Simulación de envío de email con HTML premium
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a HotSpot SaaS</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #09090b 0%, #18181b 100%);
            margin: 0;
            padding: 20px;
            color: #ffffff;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
          }
          .logo-icon {
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-text {
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin: 0;
          }
          .content {
            padding: 40px 30px;
          }
          .welcome-title {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 16px;
            text-align: center;
          }
          .welcome-subtitle {
            font-size: 16px;
            color: #a1a1aa;
            line-height: 1.6;
            margin-bottom: 32px;
            text-align: center;
          }
          .features {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
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
          .trial-badge {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 24px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <div class="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                </svg>
              </div>
              <h1 class="logo-text">HotSpot</h1>
            </div>
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
              <a href="https://labodegaec.com/cliente" class="cta-button">
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
