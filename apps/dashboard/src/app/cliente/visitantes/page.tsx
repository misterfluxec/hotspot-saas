'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Filter, Users, Calendar, TrendingUp } from 'lucide-react';

interface Visitor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  visits: number;
  firstVisit: string;
  lastVisit: string;
  status: 'active' | 'inactive';
  deviceType: string;
  branchName: string;
  isRecurring: boolean;
}

const mockVisitors: Visitor[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@email.com',
    phone: '+593 987 654 321',
    visits: 12,
    firstVisit: '2024-02-15T10:30:00Z',
    lastVisit: '2024-03-16T14:30:00Z',
    status: 'active',
    deviceType: 'Android',
    branchName: 'Sucursal Central',
    isRecurring: true
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@email.com',
    phone: '+593 987 123 456',
    visits: 8,
    firstVisit: '2024-02-20T09:15:00Z',
    lastVisit: '2024-03-16T13:45:00Z',
    status: 'active',
    deviceType: 'iOS',
    branchName: 'Sucursal Norte',
    isRecurring: true
  },
  {
    id: '3',
    name: 'Carlos López',
    email: 'carlos@email.com',
    visits: 3,
    firstVisit: '2024-03-10T16:20:00Z',
    lastVisit: '2024-03-16T12:20:00Z',
    status: 'active',
    deviceType: 'Laptop',
    branchName: 'Sucursal Central',
    isRecurring: false
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana@email.com',
    visits: 15,
    firstVisit: '2024-01-10T11:00:00Z',
    lastVisit: '2024-03-16T11:15:00Z',
    status: 'active',
    deviceType: 'Android',
    branchName: 'Sucursal Sur',
    isRecurring: true
  },
  {
    id: '5',
    name: 'Roberto Silva',
    email: 'roberto@email.com',
    visits: 1,
    firstVisit: '2024-03-16T10:30:00Z',
    lastVisit: '2024-03-16T10:30:00Z',
    status: 'active',
    deviceType: 'iOS',
    branchName: 'Sucursal Central',
    isRecurring: false
  }
];

export default function VisitantesPage() {
  const [visitors, setVisitors] = useState<Visitor[]>(mockVisitors);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>(mockVisitors);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastVisit');

  // Estadísticas
  const totalVisitors = visitors.length;
  const recurringVisitors = visitors.filter(v => v.isRecurring).length;
  const newVisitorsThisMonth = visitors.filter(v => 
    new Date(v.firstVisit) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  ).length;
  const totalVisits = visitors.reduce((sum, v) => sum + v.visits, 0);

  useEffect(() => {
    let filtered = visitors;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(visitor =>
        visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.phone?.includes(searchTerm)
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(visitor => visitor.status === statusFilter);
    }

    // Filtrar por sucursal
    if (branchFilter !== 'all') {
      filtered = filtered.filter(visitor => visitor.branchName === branchFilter);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'visits':
          return b.visits - a.visits;
        case 'lastVisit':
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        default:
          return 0;
      }
    });

    setFilteredVisitors(filtered);
  }, [visitors, searchTerm, statusFilter, branchFilter, sortBy]);

  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Visitas', 'Primera Visita', 'Última Visita', 'Sucursal', 'Dispositivo', 'Recurrente'];
    const csvContent = [
      headers.join(','),
      ...filteredVisitors.map(visitor => [
        visitor.name,
        visitor.email,
        visitor.phone || '',
        visitor.visits,
        new Date(visitor.firstVisit).toLocaleDateString('es-ES'),
        new Date(visitor.lastVisit).toLocaleDateString('es-ES'),
        visitor.branchName,
        visitor.deviceType,
        visitor.isRecurring ? 'Sí' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visitantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const branches = Array.from(new Set(visitors.map(v => v.branchName)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">CRM de Visitantes</h1>
          <p className="text-zinc-400">Gestiona y analiza a tus clientes WiFi</p>
        </div>
        <Button
          onClick={exportToCSV}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Visitantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalVisitors}</div>
            <p className="text-xs text-zinc-500 mt-2">Usuarios únicos</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Recurrentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{recurringVisitors}</div>
            <p className="text-xs text-zinc-500 mt-2">+3 visitas o más</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Nuevos este mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{newVisitorsThisMonth}</div>
            <p className="text-xs text-zinc-500 mt-2">Primeras visitas</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Visitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalVisits}</div>
            <p className="text-xs text-zinc-500 mt-2">Todas las conexiones</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Sucursal</label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Ordenar por</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="visits">Visitas</SelectItem>
                  <SelectItem value="lastVisit">Última visita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visitors Table */}
      <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white">
            Visitantes ({filteredVisitors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400 font-medium">Visitante</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Contacto</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Visitas</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Última Visita</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Sucursal</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.map((visitor) => (
                  <TableRow key={visitor.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 text-sm font-bold">
                            {visitor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{visitor.name}</div>
                          <div className="text-zinc-400 text-sm">{visitor.deviceType}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      <div>
                        <div className="text-sm">{visitor.email}</div>
                        {visitor.phone && (
                          <div className="text-zinc-500 text-xs">{visitor.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-mono">{visitor.visits}</TableCell>
                    <TableCell className="text-zinc-300">
                      <div className="text-sm">
                        {new Date(visitor.lastVisit).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">{visitor.branchName}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {visitor.isRecurring ? (
                          <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                            Recurrente
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                            Nuevo
                          </Badge>
                        )}
                        <Badge
                          variant={visitor.status === 'active' ? 'default' : 'secondary'}
                          className={visitor.status === 'active' ? 'bg-blue-600' : 'bg-zinc-700'}
                        >
                          {visitor.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
