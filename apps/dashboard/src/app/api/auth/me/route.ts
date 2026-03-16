import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token
    const payload = verifyJWT(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Retornar información del usuario
    return NextResponse.json({
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      tenantId: payload.tenantId,
    });

  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
