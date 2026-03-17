import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed CORREGIDO con IDs fijos...');

  // Crear tenant por defecto para el superadmin
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: 'hotspot-admin' },
    update: {},
    create: {
      slug: 'hotspot-admin',
      name: 'HotSpot SaaS Admin',
      businessType: 'otro',
      logoUrl: null,
      status: 'active',
      trialEndsAt: null,
      billingEmail: 'admin@labodegaec.com',
      planId: null, // Sin plan para el superadmin
    },
  });

  console.log('✅ Tenant por defecto creado:', defaultTenant.name);

  // Crear usuario superadmin
  const hashedPassword = await bcrypt.hash('Admin2024!', 12);
  const superadmin = await prisma.user.upsert({
    where: { 
      tenantId_email: {
        tenantId: defaultTenant.id,
        email: 'admin@labodegaec.com'
      }
    },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      email: 'admin@labodegaec.com',
      passwordHash: hashedPassword,
      role: 'admin',
      name: 'Super Admin',
    },
  });

  console.log('✅ Usuario superadmin creado:', superadmin.email);
  console.log('🔑 Contraseña: Admin2024!');

  // ELIMINAR planes existentes para evitar duplicados
  await prisma.plan.deleteMany({});
  console.log('🗑️ Planes existentes eliminados');

  // Crear planes con IDs FIJOS (CRÍTICO)
  const plans = await prisma.plan.createMany({
    data: [
      {
        id: 'starter', // ID FIJO
        name: 'Starter',
        priceMonthly: 29,
        maxPortals: 1,
        maxBranches: 1,
        maxVisitorsMo: 500,
        aiRequestsMo: 100,
        features: {
          analytics: true,
          customBranding: false,
          prioritySupport: false,
          apiAccess: false,
          advancedReports: false,
        },
        isActive: true,
      },
      {
        id: 'business', // ID FIJO
        name: 'Business',
        priceMonthly: 79,
        maxPortals: 5,
        maxBranches: 10,
        maxVisitorsMo: 2000,
        aiRequestsMo: 500,
        features: {
          analytics: true,
          customBranding: true,
          prioritySupport: true,
          apiAccess: true,
          advancedReports: true,
        },
        isActive: true,
      },
      {
        id: 'enterprise', // ID FIJO
        name: 'Enterprise',
        priceMonthly: 199,
        maxPortals: -1, // Ilimitado
        maxBranches: -1, // Ilimitado
        maxVisitorsMo: -1, // Ilimitado
        aiRequestsMo: -1, // Ilimitado
        features: {
          analytics: true,
          customBranding: true,
          prioritySupport: true,
          apiAccess: true,
          advancedReports: true,
          whiteLabel: true,
          dedicatedSupport: true,
          customIntegrations: true,
        },
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Planes creados con IDs fijos:', plans.count);

  // Verificar los planes creados
  const createdPlans = await prisma.plan.findMany({
    select: { id: true, name: true, priceMonthly: true }
  });

  console.log('📋 Planes en base de datos:');
  createdPlans.forEach(plan => {
    console.log(`  - ${plan.id}: ${plan.name} ($${plan.priceMonthly}/mes)`);
  });

  console.log('🎉 Seed CORREGIDO completado exitosamente!');
  console.log('');
  console.log('📋 Resumen:');
  console.log('- Tenant: HotSpot SaaS Admin');
  console.log('- Usuario: admin@labodegaec.com');
  console.log('- Contraseña: Admin2024!');
  console.log('- Role: admin');
  console.log('- Planes con IDs fijos: starter, business, enterprise');
  console.log('');
  console.log('🔐 Puedes iniciar sesión con estas credenciales en el dashboard.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
