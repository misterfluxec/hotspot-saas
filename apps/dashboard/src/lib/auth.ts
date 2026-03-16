import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret'
)

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
}

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  };
  error?: string;
  token?: string;
}

/**
 * Función principal de login de usuarios
 * Verifica credenciales en PostgreSQL y genera JWT
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const { email, password } = credentials;

    // Buscar usuario por email y tenantId (único compuesto)
    // Para login, buscamos el primer usuario con ese email
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      };
    }

    // Verificar si el tenant está activo
    if (user.tenant?.status === 'suspended' || user.tenant?.status === 'cancelled') {
      return {
        success: false,
        error: 'Cuenta deshabilitada. Contacte al administrador.',
      };
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Contraseña incorrecta',
      };
    }

    // Generar JWT payload
    const payload: JWTPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    // Generar JWT token
    const token = await generateJWT({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
      token,
    };

  } catch (error) {
    console.error('Error en loginUser:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function generateJWT(payload: {
  userId: string
  tenantId: string | null
  role: string
  email: string
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as {
      userId: string
      tenantId: string | null
      role: string
      email: string
    }
  } catch {
    return null
  }
}

/**
 * Hashea una contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verifica una contraseña contra su hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
