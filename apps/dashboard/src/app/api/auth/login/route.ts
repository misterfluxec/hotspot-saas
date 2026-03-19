import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { z } from 'zod';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-netfly-2026');

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: { email: validated.email },
      include: { tenant: true }
    });

    if (!user || !(await bcrypt.compare(validated.password, user.passwordHash))) {
      return NextResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 });
    }

    if (user.tenant?.status === 'suspended') {
      return NextResponse.json({ message: 'Cuenta suspendida' }, { status: 403 });
    }

    // Generar Token con Payload Multi-tenant
    const token = await new SignJWT({ 
        userId: user.id, 
        tenantId: user.tenantId, 
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
      user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
      redirect: user.role === 'superadmin' ? '/dashboard' : '/cliente'
    }, {
      status: 200,
      headers: {
        'Set-Cookie': `token=${token}; Path=/; HttpOnly; ${isProd ? 'Secure; ' : ''}SameSite=Lax; Max-Age=604800` 
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ message: 'Datos inválidos', errors: error.issues }, { status: 400 });
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}
