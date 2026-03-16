import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function ClienteDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const cliente = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: {
      branches: {
        include: {
          _count: {
            select: {
              portals: true
            }
          }
        }
      },
      portals: true,
      subscription: {
        include: {
          plan: true
        }
      },
      _count: {
        select: {
          branches: true,
          portals: true
        }
      }
    }
  });

  if (!cliente) {
    notFound();
  }

  const pagos = await prisma.subscription.findMany({
    where: { tenantId: params.id },
    include: {
      plan: {
        select: {
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {cliente.name}
          </h1>
          <p className="text-slate-400">{cliente.email}</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Editar cliente
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              cliente.status === 'active' 
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {cliente.status === 'active' ? 'Suspender' : 'Activar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Negocio */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Información del Negocio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Nombre del negocio
                </label>
                <p className="text-white">{cliente.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Email
                </label>
                <p className="text-white">{cliente.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Tipo de negocio
                </label>
                <p className="text-white capitalize">{cliente.businessType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Estado
                </label>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  cliente.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : cliente.status === 'trial'
                    ? 'bg-yellow-100 text-yellow-800'
                    : cliente.status === 'suspended'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {cliente.status === 'active' ? 'Activo' :
                   cliente.status === 'trial' ? 'Trial' :
                   cliente.status === 'suspended' ? 'Suspendido' :
                   cliente.status === 'cancelled' ? 'Cancelado' : cliente.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Fecha de registro
                </label>
                <p className="text-white">
                  {new Date(cliente.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
              {cliente.trialEndsAt && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Fin del trial
                  </label>
                  <p className="text-white">
                    {new Date(cliente.trialEndsAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Plan Actual */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Plan Actual
              </h2>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                Cambiar plan
              </button>
            </div>
            {cliente.subscription ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Plan:</span>
                  <span className="text-white font-medium">
                    {cliente.subscription.plan.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Precio:</span>
                  <span className="text-green-600 font-medium">
                    ${cliente.subscription.price}/mes
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Estado:</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    cliente.subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cliente.subscription.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Sin suscripción activa</p>
            )}
          </div>

          {/* Lista de Sucursales */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Sucursales ({cliente._count.branches})
            </h2>
            <div className="space-y-3">
              {cliente.branches.map((sucursal) => (
                <div key={sucursal.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{sucursal.name}</p>
                    <p className="text-sm text-slate-400">{sucursal.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-blue-400">
                      {sucursal._count.portals} portales
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Portales */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Portales Activos ({cliente._count.portals})
            </h2>
            <div className="space-y-3">
              {cliente.portals.map((portal) => (
                <div key={portal.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{portal.name}</p>
                    <p className="text-sm text-slate-400">{portal.url}</p>
                  </div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    portal.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {portal.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historial de Pagos */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Historial de Pagos
            </h2>
            <div className="space-y-3">
              {pagos.map((pago) => (
                <div key={pago.id} className="p-3 bg-slate-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-white">{pago.plan.name}</p>
                      <p className="text-sm text-slate-400">
                        {new Date(pago.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">${pago.price}</p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pago.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pago.status === 'active' ? 'Activo' : 'Cancelado'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
