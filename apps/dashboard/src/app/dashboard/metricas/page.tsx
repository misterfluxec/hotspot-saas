import { PrismaClient } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    include: {
      plan: {
        select: {
          name: true
        }
      }
    },
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
    include: {
      _count: {
        select: {
          tenants: true
        }
      }
    }
  });

  const totalClientsForPlans = planDistribution.reduce((sum, plan) => sum + plan._count.tenants, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Métricas del negocio</h1>
        <p className="text-slate-400 mt-2">Panel de control del rendimiento SaaS</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${mrr.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">Ingreso mensual recurrente</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${arr.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">Ingreso anual recurrente</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Clientes activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeTenants}</div>
            <p className="text-xs text-slate-400 mt-1">Total de {totalTenants} clientes</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Tasa conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-slate-400 mt-1">Trial → Activo</p>
          </CardContent>
        </Card>
      </div>

      {/* Clientes en riesgo */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Clientes en riesgo</CardTitle>
          <p className="text-sm text-slate-400">Trials que vencen pronto</p>
        </CardHeader>
        <CardContent>
          {atRiskTenants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-400">Nombre</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Plan</TableHead>
                  <TableHead className="text-slate-400">Vence en</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atRiskTenants.map((tenant) => {
                  const daysUntilExpiry = tenant.trialEndsAt 
                    ? Math.ceil((tenant.trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <TableRow key={tenant.id}>
                      <TableCell className="text-white">{tenant.name}</TableCell>
                      <TableCell className="text-slate-300">{tenant.billingEmail}</TableCell>
                      <TableCell className="text-slate-300">{tenant.plan?.name || 'Sin plan'}</TableCell>
                      <TableCell>
                        <Badge variant={daysUntilExpiry <= 1 ? "destructive" : "secondary"}>
                          {daysUntilExpiry === 0 ? 'Hoy' : 
                           daysUntilExpiry === 1 ? 'Mañana' : 
                           `${daysUntilExpiry} días`}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-slate-400 text-center py-8">No hay clientes en riesgo</p>
          )}
        </CardContent>
      </Card>

      {/* Crecimiento mensual */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Crecimiento</CardTitle>
          <p className="text-sm text-slate-400">Nuevos clientes por mes (últimos 6 meses)</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-400">Mes</TableHead>
                <TableHead className="text-slate-400">Nuevos clientes</TableHead>
                <TableHead className="text-slate-400">Acumulado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {growthWithCumulative.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-white">
                    {item.month.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                  </TableCell>
                  <TableCell className="text-slate-300">{item.newClients}</TableCell>
                  <TableCell className="text-slate-300">{item.cumulative}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Distribución por plan */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Distribución por plan</CardTitle>
          <p className="text-sm text-slate-400">Clientes e ingresos por plan</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-400">Plan</TableHead>
                <TableHead className="text-slate-400">Clientes</TableHead>
                <TableHead className="text-slate-400">% del total</TableHead>
                <TableHead className="text-slate-400">Ingresos estimados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planDistribution.map((plan) => {
                const percentage = totalClientsForPlans > 0 
                  ? (plan._count.tenants / totalClientsForPlans) * 100 
                  : 0;
                const estimatedRevenue = plan._count.tenants * plan.priceMonthly;

                return (
                  <TableRow key={plan.id}>
                    <TableCell className="text-white">{plan.name}</TableCell>
                    <TableCell className="text-slate-300">{plan._count.tenants}</TableCell>
                    <TableCell className="text-slate-300">{percentage.toFixed(1)}%</TableCell>
                    <TableCell className="text-slate-300">${estimatedRevenue.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
