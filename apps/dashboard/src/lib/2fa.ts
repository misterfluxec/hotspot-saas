import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export interface TFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export async function generate2FASecret(email: string): Promise<TFASetup> {
  // Generar secreto TOTP
  const secret = speakeasy.generateSecret({
    name: `HotSpot SaaS (${email})`,
    issuer: 'HotSpot SaaS',
    length: 32,
  });

  // Generar QR Code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  // Generar códigos de respaldo
  const backupCodes = Array.from({ length: 10 }, () => 
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  return {
    secret: secret.base32,
    qrCode,
    backupCodes,
  };
}

export function verify2FAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Permitir 2 ventanas de tiempo (30s cada una)
  });
}

export function verifyBackupCode(storedCodes: string[], providedCode: string): boolean {
  return storedCodes.includes(providedCode.toUpperCase());
}

export function generateBackupCodes(): string[] {
  return Array.from({ length: 10 }, () => 
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );
}

export function is2FAEnabled(user: any): boolean {
  return user.twoFactorEnabled && user.twoFactorSecret;
}

// Función para validar el formato del código TOTP
export function isValidTOTPFormat(token: string): boolean {
  return /^\d{6}$/.test(token);
}

// Función para obtener el tiempo restante del token actual
export function getTokenTimeRemaining(): number {
  const now = Math.floor(Date.now() / 1000);
  const timeWindow = 30; // 30 segundos por token
  return timeWindow - (now % timeWindow);
}
