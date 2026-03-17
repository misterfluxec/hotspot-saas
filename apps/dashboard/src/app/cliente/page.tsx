import { PrismaClient } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Wifi, MapPin, Activity } from 'lucide-react';

const prisma = new PrismaClient();

export default async function ClienteDashboard() {
  // Datos simulados para el dashboard del cliente
  const metrics = {
    visitorsToday: 127,
    visitorsThisMonth: 3420,
    branchesOnline: 3,
    activePortals: 3
  };

  const recentVisitors = [
    { id: 1, name: 'Juan Pérez', email: 'juan@email.com', visits: 5, lastVisit: '2024-03-16T14:30:00Z', isRecurring: true },
    { id: 2, name: 'María García', email: 'maria@email.com', visits: 1, lastVisit: '2024-03-16T13:45:00Z', isRecurring: false },
    { id: 3, name: 'Carlos López', email: 'carlos@email.com', visits: 8, lastVisit: '2024-03-16T12:20:00Z', isRecurring: true },
    { id: 4, name: 'Ana Martínez', email: 'ana@email.com', visits: 3, lastVisit: '2024-03-16T11:15:00Z', isRecurring: false },
    { id: 5, name: 'Roberto Silva', email: 'roberto@email.com', visits: 12, lastVisit: '2024-03-16T10:30:00Z', isRecurring: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Resumen de tu HotSpot WiFi</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Visitantes Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{metrics.visitorsToday}</div>
            <p className="text-xs text-zinc-500 mt-2">+15% vs ayer</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Visitantes Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{metrics.visitorsThisMonth.toLocaleString()}</div>
            <p className="text-xs text-zinc-500 mt-2">+23% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center">
              <Wifi className="w-4 h-4 mr-2" />
              Sucursales Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold text-white">{metrics.branchesOnline}</div>
              <div className="text-sm text-zinc-500">/ 3 totales</div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Todas operativas</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Portales Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold text-white">{metrics.activePortals}</div>
              <div className="text-sm text-zinc-500">/ 3 configurados</div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Funcionando correctamente</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Visitors CRM */}
      <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white">Visitantes Recientes</CardTitle>
          <p className="text-zinc-400">Últimos visitantes en tus HotSpots</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Visitante</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Visitas</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Última Visita</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentVisitors.map((visitor) => (
                  <tr key={visitor.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-white font-medium">{visitor.name}</div>
                        <div className="text-zinc-400 text-sm">{visitor.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white">{visitor.visits}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-zinc-300">
                        {new Date(visitor.lastVisit).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {visitor.isRecurring ? (
                        <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                          Recurrente
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                          Nuevo
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
