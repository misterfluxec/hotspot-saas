import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

interface Cliente {
  id: string;
  name: string;
  email: string;
  status: string;
  plan?: {
    name: string;
    price: number;
  };
  _count: {
    branches: number;
  };
  createdAt: Date;
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams?: { page?: string; estado?: string; plan?: string; buscar?: string };
}) {
  const page = parseInt(searchParams?.page || '1');
  const estado = searchParams?.estado || '';
  const plan = searchParams?.plan || '';
  const buscar = searchParams?.buscar || '';
  const skip = (page - 1) * 10;

  // Construir filtros
  const where: any = {};

  if (estado) {
    where.status = estado;
  }

  if (buscar) {
    where.OR = [
      { name: { contains: buscar, mode: 'insensitive' } },
      { email: { contains: buscar, mode: 'insensitive' } }
    ];
  }

  if (plan) {
    where.subscription = {
      plan: { name: { contains: plan, mode: 'insensitive' } }
    };
  }

  // Obtener clientes con paginación
  const [clientes, totalCount] = await Promise.all([
    prisma.tenant.findMany({
      where,
      include: {
        _count: {
          select: {
            branches: true
          }
        },
        subscription: {
          include: {
            plan: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: 10
    }),
    prisma.tenant.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
          <p className="text-slate-400">
            Gestiona todos los clientes de la plataforma
          </p>
        </div>
        <Link
          href="/dashboard/clientes/nuevo"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Nuevo cliente
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Estado
            </label>
            <select
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="estado"
              defaultValue={estado}
            >
              <option value="">Todos</option>
              <option value="trial">Trial</option>
              <option value="active">Activo</option>
              <option value="suspended">Suspendido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Plan
            </label>
            <select
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="plan"
              defaultValue={plan}
            >
              <option value="">Todos</option>
              <option value="Básico">Plan Básico</option>
              <option value="Profesional">Plan Profesional</option>
              <option value="Enterprise">Plan Enterprise</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="buscar"
              defaultValue={buscar}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Aplicar filtros
          </button>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Sucursales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-slate-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {cliente.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-300">
                      {cliente.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-300">
                      {cliente.subscription?.plan?.name || 'Sin plan'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {cliente._count.branches}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {new Date(cliente.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/dashboard/clientes/${cliente.id}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Mostrando {skip + 1} a {Math.min(skip + 10, totalCount)} de {totalCount} clientes
        </div>
        <div className="flex space-x-2">
          {page > 1 && (
            <Link
              href={`/dashboard/clientes?page=${page - 1}&estado=${estado}&plan=${plan}&buscar=${buscar}`}
              className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Anterior
            </Link>
          )}
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              href={`/dashboard/clientes?page=${pageNum}&estado=${estado}&plan=${plan}&buscar=${buscar}`}
              className={`px-3 py-2 rounded-lg transition-colors ${
                pageNum === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {pageNum}
            </Link>
          ))}
          
          {page < totalPages && (
            <Link
              href={`/dashboard/clientes?page=${page + 1}&estado=${estado}&plan=${plan}&buscar=${buscar}`}
              className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Siguiente
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
