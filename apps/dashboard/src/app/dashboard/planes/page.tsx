import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function PlanesPage() {
  const planes = await prisma.plan.findMany({
    where: { isActive: true },
    // TODO: Agregar relación con tenants cuando se necesite
    // include: {
    //   _count: {
    //     select: {
    //       tenants: true
    //     }
    //   }
    // },
    orderBy: { priceMonthly: 'asc' }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Gestión de Planes
        </h1>
        <p className="text-slate-400">
          Administra los planes de suscripción disponibles
        </p>
      </div>

      {/* Grid de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {planes.map((plan) => (
          <div
            key={plan.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-600 transition-colors"
          >
            {/* Header del Plan */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">
                {plan.name}
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                ${plan.priceMonthly}
                <span className="text-sm text-slate-400">/mes</span>
              </div>
            </div>

            {/* Características */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Portales máx:</span>
                <span className="text-white font-medium">
                  {plan.maxPortals === -1 ? 'Ilimitados' : plan.maxPortals}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Sucursales máx:</span>
                <span className="text-white font-medium">
                  {plan.maxBranches === -1 ? 'Ilimitadas' : plan.maxBranches}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Visitantes/mes:</span>
                <span className="text-white font-medium">
                  {plan.maxVisitorsMo === -1 ? 'Ilimitados' : plan.maxVisitorsMo.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Peticiones IA/mes:</span>
                <span className="text-white font-medium">
                  {plan.aiRequestsMo === -1 ? 'Ilimitadas' : plan.aiRequestsMo.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Features Adicionales */}
            <div className="space-y-2 mb-6">
              {plan.features && typeof plan.features === 'object' && plan.features !== null && (
                <>
                  {(plan.features as any).analytics && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-slate-300">Analytics</span>
                    </div>
                  )}
                  {(plan.features as any).customBranding && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-slate-300">Branding personalizado</span>
                    </div>
                  )}
                  {(plan.features as any).prioritySupport && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-slate-300">Soporte prioritario</span>
                    </div>
                  )}
                  {(plan.features as any).apiAccess && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-slate-300">Acceso API</span>
                    </div>
                  )}
                  {(plan.features as any).advancedReports && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-slate-300">Reportes avanzados</span>
                    </div>
                  )}
                  {(plan.features as any).whiteLabel && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-slate-300">White Label</span>
                    </div>
                  )}
                  {(plan.features as any).dedicatedSupport && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-slate-300">Soporte dedicado</span>
                    </div>
                  )}
                  {(plan.features as any).customIntegrations && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-slate-300">Integraciones personalizadas</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Estadísticas */}
            <div className="mb-6">
              <div className="text-center">
                <span className="text-sm text-slate-400">Clientes en este plan</span>
                <p className="text-2xl font-bold text-white">
                  {/* (plan as any)._count?.tenants || */ 0}
                </p>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex space-x-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Editar plan
              </button>
              <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
