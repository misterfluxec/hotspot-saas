import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPlans() {
  try {
    // Eliminar planes existentes
    await prisma.plan.deleteMany();

    // Crear planes con IDs específicos
    const plans = await prisma.plan.createMany({
      data: [
        {
          id: 'starter',
          name: 'Starter',
          priceMonthly: 29,
          maxPortals: 1,
          maxBranches: 1,
          maxVisitorsMo: 500,
          aiRequestsMo: 100,
          features: [
            'Hasta 50 usuarios concurrentes',
            '1 sucursal',
            'Portal WiFi básico',
            'Soporte por email'
          ],
          isActive: true
        },
        {
          id: 'business',
          name: 'Business',
          priceMonthly: 79,
          maxPortals: 5,
          maxBranches: 5,
          maxVisitorsMo: 2000,
          aiRequestsMo: 500,
          features: [
            'Hasta 200 usuarios concurrentes',
            'Hasta 5 sucursales',
            'Portal WiFi personalizado',
            'Analytics avanzado',
            'Soporte prioritario'
          ],
          isActive: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          priceMonthly: 199,
          maxPortals: 20,
          maxBranches: 20,
          maxVisitorsMo: 10000,
          aiRequestsMo: 2000,
          features: [
            'Usuarios ilimitados',
            'Sucursales ilimitadas',
            'Portal WiFi premium',
            'API completa',
            'Soporte 24/7',
            'White label'
          ],
          isActive: true
        }
      ]
    });

    console.log('✅ Planes creados exitosamente:', plans);
  } catch (error) {
    console.error('❌ Error creando planes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPlans();
