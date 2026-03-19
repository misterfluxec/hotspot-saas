import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generate2FASecret } from '@/lib/2fa';
import { createAuditLog, auditActions } from '@/lib/audit';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, tenantId } = await request.json();

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: 'User ID and Tenant ID are required' },
        { status: 400 }
      );
    }

    // Obtener usuario
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generar secreto 2FA
    const tfaSetup = await generate2FASecret(user.email);

    // Actualizar usuario con el secreto (pero no activar todavía)
    await prisma.user.update({
      where: { id: userId },
      data: {
        // TODO: Agregar campos 2FA al schema cuando se implemente
        // twoFactorSecret: tfaSetup.secret,
        // backupCodes: tfaSetup.backupCodes,
      },
    });

    // Crear log de auditoría
    await createAuditLog({
      tenantId,
      userId,
      action: auditActions['TFA_ENABLED'],
      resource: 'user',
      details: { email: user.email },
    });

    return NextResponse.json({
      secret: tfaSetup.secret,
      qrCode: tfaSetup.qrCode,
      backupCodes: tfaSetup.backupCodes,
      message: '2FA setup initiated. Please verify with your authenticator app.',
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
