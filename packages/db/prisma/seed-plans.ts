import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPlans() {
  console.log('🌱 Sembrando planes con IDs fijos...');

  const plansData = [
    {
      id: 'starter', // ← ID FIJO - CRÍTICO
      name: 'Starter', // ← DEBE COINCIDIR CON FRONTEND
      priceMonthly: 29.99,
      maxPortals: 1,
      maxBranches: 1,
      maxVisitorsMo: 1000,
      aiRequestsMo: 100,
      features: ['Portal básico', 'Analytics esencial', 'Soporte email'],
      isActive: true,
    },
    {
      id: 'business', // ← ID FIJO - CRÍTICO
      name: 'Business', // ← DEBE COINCIDIR CON FRONTEND
      priceMonthly: 79.99,
      maxPortals: 3,
      maxBranches: 5,
      maxVisitorsMo: 5000,
      aiRequestsMo: 500,
      features: ['Hasta 3 portales', 'Analytics avanzado', 'IA integrada'],
      isActive: true,
    },
    {
      id: 'enterprise', // ← ID FIJO - CRÍTICO
      name: 'Enterprise', // ← DEBE COINCIDIR CON FRONTEND
      priceMonthly: 199.99,
      maxPortals: -1,
      maxBranches: -1,
      maxVisitorsMo: -1,
      aiRequestsMo: -1,
      features: ['Portales ilimitados', 'Soporte 24/7', 'SLA garantizado'],
      isActive: true,
    },
  ];

  try {
    await prisma.plan.createMany({
      data: plansData,
      skipDuplicates: true,
    });

    console.log('✅ Planes sembrados:');
    plansData.forEach(plan => {
      console.log(`   • ID: "${plan.id}" | Name: "${plan.name}" | $${plan.priceMonthly}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Error al sembrar planes:', error);
    
    // Fallback: upsert individual
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
      console.log(`   • Upsert: ${plan.id}`);
    }
    
    return true;
  }
}
