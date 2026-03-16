import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { loginUser } from '../../../../lib/auth';

// Schema de validación con Zod
const LoginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export async function POST(request: NextRequest) {
  try {
    // Parsear y validar el body
    const body = await request.json();
    
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.issues.map((err: any) => err.message).join(', ')
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Intentar login
    const result = await loginUser({ email, password });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al iniciar sesión' },
        { status: 401 }
      );
    }

    // Crear cookie httpOnly con el JWT
    const response = NextResponse.json(
      { 
        success: true,
        user: {
          id: result.user!.id,
          email: result.user!.email,
          name: result.user!.name,
          role: result.user!.role,
          tenantId: result.user!.tenantId,
        }
      },
      { status: 200 }
    );

    // Configurar cookie segura
    response.cookies.set('auth-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
