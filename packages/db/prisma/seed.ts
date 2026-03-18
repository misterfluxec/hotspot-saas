import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

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

  // Crear plan starter por defecto
  let starterPlan = await prisma.plan.findFirst({
    where: { name: 'Starter' },
  });

  if (!starterPlan) {
    starterPlan = await prisma.plan.create({
      data: {
        id: 'starter', // ID fijo para coincidir con frontend
        name: 'Starter',
        priceMonthly: 29.99,
        maxPortals: 3,
        maxBranches: 5,
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
    });
  }

  console.log('✅ Plan starter creado:', starterPlan.name);

  // Crear plan business
  let businessPlan = await prisma.plan.findFirst({
    where: { name: 'Business' },
  });

  if (!businessPlan) {
    businessPlan = await prisma.plan.create({
      data: {
        id: 'business', // ID fijo para coincidir con frontend
        name: 'Business',
        priceMonthly: 79.99,
        maxPortals: 10,
        maxBranches: 20,
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
    });
  }

  console.log('✅ Plan business creado:', businessPlan.name);

  // Crear plan enterprise
  let enterprisePlan = await prisma.plan.findFirst({
    where: { name: 'Enterprise' },
  });

  if (!enterprisePlan) {
    enterprisePlan = await prisma.plan.create({
      data: {
        id: 'enterprise', // ID fijo para coincidir con frontend
        name: 'Enterprise',
        priceMonthly: 199.99,
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
    });
  }

  console.log('✅ Plan enterprise creado:', enterprisePlan.name);

  console.log('🎉 Seed completado exitosamente!');
  console.log('');
  console.log('📋 Resumen:');
  console.log('- Tenant: HotSpot SaaS Admin');
  console.log('- Usuario: admin@labodegaec.com');
  console.log('- Contraseña: Admin2024!');
  console.log('- Role: admin');
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
