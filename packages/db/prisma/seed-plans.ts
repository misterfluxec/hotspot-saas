import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed de planes con IDs FIJOS para sincronización frontend-backend
 * IDs: starter, business, enterprise (minúsculas, exactos)
 */
export async function seedPlans() {
  console.log('🌱 Sembrando planes con IDs fijos...');

  const plansData = [
    {
      id: 'starter', // ← ID FIJO - CRÍTICO
      name: 'Starter', // ← NOMBRE EXACTO AL FRONTEND
      priceMonthly: 29.99,
      maxPortals: 1,
      maxBranches: 1,
      maxVisitorsMo: 1000,
      aiRequestsMo: 100,
      features: [
        'Portal cautivo básico',
        'Analytics esencial',
        'Soporte por email',
        '1 sucursal',
        '1000 visitantes/mes'
      ],
      isActive: true,
    },
    {
      id: 'business', // ← ID FIJO - CRÍTICO
      name: 'Business', // ← NOMBRE EXACTO AL FRONTEND
      priceMonthly: 79.99,
      maxPortals: 3,
      maxBranches: 5,
      maxVisitorsMo: 5000,
      aiRequestsMo: 500,
      features: [
        'Hasta 3 portales personalizados',
        'Analytics avanzado con IA',
        'Soporte prioritario',
        'Hasta 5 sucursales',
        '5000 visitantes/mes',
        'Campañas de marketing'
      ],
      isActive: true,
    },
    {
      id: 'enterprise', // ← ID FIJO - CRÍTICO
      name: 'Enterprise', // ← NOMBRE EXACTO AL FRONTEND
      priceMonthly: 199.99,
      maxPortals: -1, // -1 = ilimitado
      maxBranches: -1,
      maxVisitorsMo: -1,
      aiRequestsMo: -1,
      features: [
        'Portales ilimitados',
        'Sucursales ilimitadas',
        'IA premium con phi3',
        'Soporte 24/7 dedicado',
        'Visitantes ilimitados',
        'SLA garantizado 99.9%',
        'API completa',
        'White-label disponible'
      ],
      isActive: true,
    },
  ];

  try {
    // Usar createMany con IDs explícitos
    await prisma.plan.createMany({
      data: plansData,
      skipDuplicates: true, // Permite re-ejecutar sin errores
    });

    console.log('✅ Planes sembrados exitosamente:');
    plansData.forEach(plan => {
      console.log(`   • ID: "${plan.id}" | ${plan.name} | $${plan.priceMonthly}/mes`);
    });

    return true;
  } catch (error) {
    console.error('❌ Error al sembrar planes:', error);
    
    // Fallback: upsert individual si createMany falla
    for (const plan of plansData) {
      await prisma.plan.upsert({
        where: { id: plan.id },
        update: {
          name: plan.name,
          priceMonthly: plan.priceMonthly,
          maxPortals: plan.maxPortals,
          maxBranches: plan.maxBranches,
          maxVisitorsMo: plan.maxVisitorsMo,
          aiRequestsMo: plan.aiRequestsMo,
          features: plan.features,
          isActive: plan.isActive,
        },
        create: plan,
      });
      console.log(`   • Upsert completado para: ${plan.id}`);
    }
    
    return true;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedPlans()
    .then(() => {
      console.log('🎉 Seed de planes completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seed de planes:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
