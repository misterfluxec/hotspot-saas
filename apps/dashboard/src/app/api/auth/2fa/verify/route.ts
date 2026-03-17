import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify2FAToken, verifyBackupCode } from '@/lib/2fa';
import { createAuditLog, auditActions } from '@/lib/audit';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, tenantId, token, backupCode } = await request.json();

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: 'User ID and Tenant ID are required' },
        { status: 400 }
      );
    }

    if (!token && !backupCode) {
      return NextResponse.json(
        { error: 'Token or backup code is required' },
        { status: 400 }
      );
    }

    // Obtener usuario
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA not set up for this user' },
        { status: 400 }
      );
    }

    let isValid = false;
    let verificationMethod = '';

    // Verificar token TOTP
    if (token) {
      isValid = verify2FAToken(user.twoFactorSecret, token);
      verificationMethod = 'totp';
    }

    // Verificar código de respaldo
    if (!isValid && backupCode && user.backupCodes) {
      const backupCodes = user.backupCodes as string[];
      isValid = verifyBackupCode(backupCodes, backupCode);
      verificationMethod = 'backup';
      
      // Si es código de respaldo válido, removerlo de la lista
      if (isValid) {
        const remainingCodes = backupCodes.filter(code => code !== backupCode.toUpperCase());
        await prisma.user.update({
          where: { id: userId },
          data: { backupCodes: remainingCodes },
        });
      }
    }

    if (isValid) {
      // Activar 2FA si no estaba activo
      if (!user.twoFactorEnabled) {
        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorEnabled: true },
        });
      }

      // Crear log de auditoría
      await createAuditLog({
        tenantId,
        userId,
        action: auditActions.LOGIN,
        resource: 'user',
        details: { 
          email: user.email,
          twoFactorMethod: verificationMethod,
        },
      });

      return NextResponse.json({
        success: true,
        message: '2FA verification successful',
        method: verificationMethod,
      });
    } else {
      // Log de intento fallido
      await createAuditLog({
        tenantId,
        userId,
        action: auditActions.LOGIN_FAILED,
        resource: 'user',
        details: { 
          email: user.email,
          reason: 'invalid_2fa',
          method: verificationMethod,
        },
      });

      return NextResponse.json(
        { error: 'Invalid 2FA token or backup code' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
