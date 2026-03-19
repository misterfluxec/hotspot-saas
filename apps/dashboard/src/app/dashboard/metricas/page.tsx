import { PrismaClient } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const prisma = new PrismaClient();

export default async function MetricasPage() {
  // Obtener datos para métricas principales
  const [activeTenants, totalTenants, subscriptions, plans] = await Promise.all([
    prisma.tenant.count({ where: { status: 'active' } }),
    prisma.tenant.count(),
    prisma.subscription.findMany({ where: { status: 'active' } }),
    prisma.plan.findMany()
  ]);

  // Calcular MRR
  const mrr = subscriptions.reduce((total, sub) => {
    const plan = plans.find(p => p.id === sub.planId);
    return total + (plan?.priceMonthly || 0);
  }, 0);

  const arr = mrr * 12;
  const conversionRate = totalTenants > 0 ? (activeTenants / totalTenants) * 100 : 0;

  // Obtener clientes en riesgo (trial que vence en menos de 3 días)
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const atRiskTenants = await prisma.tenant.findMany({
    where: {
      status: 'trial',
      trialEndsAt: {
        lte: threeDaysFromNow,
        gte: new Date()
      }
    },
    // TODO: Agregar relación con plan cuando se necesite
    // include: {
    //   plan: {
    //     select: {
    //       name: true
    //     }
    //   }
    // },
    orderBy: {
      trialEndsAt: 'asc'
    }
  });

  // Obtener crecimiento mensual (últimos 6 meses)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyGrowth = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', created_at) as month,
      COUNT(*) as new_clients
    FROM tenants 
    WHERE created_at >= ${sixMonthsAgo}
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month ASC
  ` as Array<{ month: Date; new_clients: bigint }>;

  // Calcular acumulado
  let cumulative = 0;
  const growthWithCumulative = monthlyGrowth.map(item => {
    cumulative += Number(item.new_clients);
    return {
      month: new Date(item.month),
      newClients: Number(item.new_clients),
      cumulative
    };
  });

  // Obtener distribución por plan
  const planDistribution = await prisma.plan.findMany({
    // TODO: Agregar relación con tenants cuando se necesite
    // include: {
    //   _count: {
    //     select: {
    //       tenants: true
    //     }
    //   }
    // }
  });

  // const totalClientsForPlans = planDistribution.reduce((sum, plan) => sum + plan._count.tenants, 0);
  const totalClientsForPlans = 0; // Temporal hasta que se agregue la relación

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Métricas del negocio</h1>
        <p className="text-zinc-400 text-lg">Panel de control del rendimiento SaaS</p>
      </div>

      {/* Métricas principales con diseño Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
              MRR
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold text-white font-mono">${mrr.toLocaleString()}</div>
              <div className="flex items-center text-green-400 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                +12.5%
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Ingreso mensual recurrente</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
              ARR
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold text-white font-mono">${arr.toLocaleString()}</div>
              <div className="flex items-center text-green-400 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                +12.5%
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Ingreso anual recurrente</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
              Clientes activos
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold text-white font-mono">{activeTenants}</div>
              <div className="text-zinc-500 text-sm">/ {totalTenants}</div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Total de clientes registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">Tasa conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline space-x-2">
                <div className="text-3xl font-bold text-white font-mono">{conversionRate.toFixed(1)}%</div>
              </div>
              <Progress value={conversionRate} className="h-2" />
              <p className="text-xs text-zinc-500">Trial → Activo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clientes en riesgo con diseño Premium */}
      <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
            Clientes en riesgo
          </CardTitle>
          <p className="text-zinc-400">Trials que vencen pronto</p>
        </CardHeader>
        <CardContent>
          {atRiskTenants.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400 font-medium">Nombre</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Email</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Plan</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Vence en</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atRiskTenants.map((tenant) => {
                    const daysUntilExpiry = tenant.trialEndsAt 
                      ? Math.ceil((tenant.trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : 0;
                    
                    const isCritical = daysUntilExpiry <= 1;

                    return (
                      <TableRow 
                        key={tenant.id} 
                        className={`border-zinc-800 hover:bg-zinc-800/50 transition-colors ${
                          isCritical ? 'bg-gradient-to-r from-red-950/20 to-transparent' : ''
                        }`}
                      >
                        <TableCell className="text-white font-medium">{tenant.name}</TableCell>
                        <TableCell className="text-zinc-300 font-mono text-sm">{tenant.billingEmail}</TableCell>
                        <TableCell className="text-zinc-300">{/* tenant.plan?.name || */ 'Sin plan'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={isCritical ? "destructive" : "secondary"}
                            className={`${isCritical ? 'bg-red-600 text-white border-red-500' : 'bg-zinc-800 text-zinc-300 border-zinc-700'} hover:scale-105 transition-transform`}
                          >
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                              <span>
                                {daysUntilExpiry === 0 ? 'Hoy' : 
                                 daysUntilExpiry === 1 ? 'Mañana' : 
                                 `${daysUntilExpiry} días`}
                              </span>
                            </div>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-zinc-400 text-lg">No hay clientes en riesgo</p>
              <p className="text-zinc-500 text-sm mt-1">Todos los trials están en buen estado</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Crecimiento mensual */}
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              Crecimiento
            </CardTitle>
            <p className="text-zinc-400">Nuevos clientes por mes (últimos 6 meses)</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400 font-medium">Mes</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-right">Nuevos</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-right">Acumulado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {growthWithCumulative.map((item, index) => (
                    <TableRow key={index} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                      <TableCell className="text-white font-medium">
                        {item.month.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}
                      </TableCell>
                      <TableCell className="text-zinc-300 text-right font-mono">{item.newClients}</TableCell>
                      <TableCell className="text-zinc-300 text-right font-mono font-medium">{item.cumulative}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Distribución por plan */}
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              Distribución por plan
            </CardTitle>
            <p className="text-zinc-400">Clientes e ingresos por plan</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400 font-medium">Plan</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-right">Clientes</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Distribución</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-right">Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planDistribution.map((plan) => {
                    const tenantCount = 0; // TODO: Obtener de relación cuando se agregue
                    const percentage = totalClientsForPlans > 0 
                      ? (tenantCount / totalClientsForPlans) * 100 
                      : 0;
                    const estimatedRevenue = tenantCount * plan.priceMonthly;

                    return (
                      <TableRow key={plan.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                        <TableCell className="text-white font-medium">{plan.name}</TableCell>
                        <TableCell className="text-zinc-300 text-right font-mono">{tenantCount}</TableCell>
                        <TableCell className="text-zinc-300">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 max-w-[60px]">
                              <Progress value={percentage} className="h-2" />
                            </div>
                            <span className="text-sm font-mono">{percentage.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-300 text-right font-mono font-medium">${estimatedRevenue.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
