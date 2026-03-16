import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function SuperAdminDashboard() {
  // Obtener métricas principales
  const [
    totalClientes,
    clientesActivos,
    trialsActivos,
    totalMRR,
    ultimosClientes,
    ultimasSuscripciones
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: 'active' } }),
    prisma.tenant.count({ 
      where: { 
        status: 'trial',
        trialEndsAt: { gt: new Date() }
      } 
    }),
    prisma.subscription.aggregate({
      _sum: { price: true },
      where: { 
        status: 'active',
        tenant: { status: 'active' }
      }
    }),
    prisma.tenant.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            branches: true,
            portals: true
          }
        }
      }
    }),
    prisma.subscription.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          select: {
            name: true,
            email: true
          }
        },
        plan: {
          select: {
            name: true
          }
        }
      }
    })
  ]);

  const mrr = totalMRR._sum.price || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
        <p className="text-slate-400">Vista general de la plataforma HotSpot SaaS</p>
      </div>

      {/* Métricas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Total Clientes</h3>
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">{totalClientes}</div>
          <p className="text-xs text-slate-400">Clientes registrados</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Clientes Activos</h3>
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-green-600">{clientesActivos}</div>
          <p className="text-xs text-slate-400">Suscripciones activas</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Trials Activos</h3>
            <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{trialsActivos}</div>
          <p className="text-xs text-slate-400">Período de prueba</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">MRR Estimado</h3>
            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-blue-600">${mrr.toFixed(2)}</div>
          <p className="text-xs text-slate-400">Ingreso mensual recurrente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos Clientes */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Últimos Clientes Registrados</h3>
          <div className="space-y-4">
            {ultimosClientes.map((cliente) => (
              <div key={cliente.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div>
                  <p className="font-medium text-white">{cliente.name}</p>
                  <p className="text-sm text-slate-400">{cliente.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    {new Date(cliente.createdAt).toLocaleDateString('es-ES')}
                  </p>
                  <div className="flex space-x-2 text-xs">
                    <span className="text-blue-400">{cliente._count.branches} sucursales</span>
                    <span className="text-green-400">{cliente._count.portales} portales</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimas Suscripciones */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Últimas Suscripciones</h3>
          <div className="space-y-4">
            {ultimasSuscripciones.map((suscripcion) => (
              <div key={suscripcion.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div>
                  <p className="font-medium text-white">{suscripcion.tenant.name}</p>
                  <p className="text-sm text-slate-400">{suscripcion.tenant.email}</p>
                  <p className="text-xs text-blue-400">{suscripcion.plan.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">${suscripcion.price}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(suscripcion.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
