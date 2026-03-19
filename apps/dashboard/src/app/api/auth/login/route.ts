import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { z } from 'zod';

const prisma = new PrismaClient();

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-netfly-2026'
);

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
}).passthrough();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    // Búsqueda case-insensitive con tenant incluido
    const user = await prisma.user.findFirst({
      where: { 
        email: { 
          equals: validated.email, 
          mode: 'insensitive' 
        } 
      },
      include: { 
        tenant: { 
          select: { 
            id: true, 
            name: true, 
            status: true,
            trialEndsAt: true 
          } 
        } 
      }
    });

    // Validación unificada de credenciales
    if (!user || !(await bcrypt.compare(validated.password, user.passwordHash))) {
      console.warn('⚠️ Login fallido:', { email: validated.email });
      return NextResponse.json(
        { message: 'Credenciales incorrectas' }, 
        { status: 401 }
      );
    }

    // Verificar estado del tenant
    if (user.tenant?.status === 'suspended') {
      return NextResponse.json(
        { message: 'Cuenta suspendida. Contacta a soporte.' }, 
        { status: 403 }
      );
    }

    // Generar JWT compatible con Edge Runtime
    const token = await new SignJWT({ 
        userId: user.id, 
        tenantId: user.tenantId || 'SYSTEM', 
        role: user.role, 
        email: user.email 
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const isProd = process.env.NODE_ENV === 'production';
    
    return NextResponse.json({
      success: true,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        tenantId: user.tenantId 
      },
      redirect: user.role === 'superadmin' ? '/dashboard' : '/cliente'
    }, {
      status: 200,
      headers: {
        'Set-Cookie': `token=${token}; Path=/; HttpOnly; ${
          isProd ? 'Secure; ' : ''
        }SameSite=Lax; Max-Age=604800`
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    
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
