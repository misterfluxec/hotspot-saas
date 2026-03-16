import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Crear respuesta y eliminar la cookie de autenticación
    const response = NextResponse.json(
      { success: true, message: 'Sesión cerrada exitosamente' },
      { status: 200 }
    );

    // Eliminar la cookie estableciendo una fecha de expiración en el pasado
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Fecha en el pasado para eliminar la cookie
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error en /api/auth/logout:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
