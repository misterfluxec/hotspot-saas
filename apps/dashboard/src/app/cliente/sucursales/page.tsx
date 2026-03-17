'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Wifi, WifiOff, MapPin, Settings, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  routerType: string;
  routerIp: string;
  status: 'online' | 'offline';
  lastSeen: string;
  visitorsToday: number;
  totalVisitors: number;
}

const mockBranches: Branch[] = [
  {
    id: '1',
    name: 'Sucursal Central',
    address: 'Av. Principal #123, Ciudad',
    routerType: 'MikroTik',
    routerIp: '192.168.1.1',
    status: 'online',
    lastSeen: '2024-03-16T15:30:00Z',
    visitorsToday: 45,
    totalVisitors: 2340
  },
  {
    id: '2',
    name: 'Sucursal Norte',
    address: 'Calle Norte #456, Ciudad',
    routerType: 'Ubiquiti UniFi',
    routerIp: '192.168.2.1',
    status: 'online',
    lastSeen: '2024-03-16T15:25:00Z',
    visitorsToday: 32,
    totalVisitors: 1560
  },
  {
    id: '3',
    name: 'Sucursal Sur',
    address: 'Av. Sur #789, Ciudad',
    routerType: 'TP-Link Omada',
    routerIp: '192.168.3.1',
    status: 'offline',
    lastSeen: '2024-03-16T12:15:00Z',
    visitorsToday: 0,
    totalVisitors: 890
  }
];

const routerTypes = [
  'MikroTik',
  'Ubiquiti UniFi',
  'Cisco Meraki',
  'TP-Link Omada',
  'Ruckus',
  'Otro'
];

export default function SucursalesPage() {
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    routerType: '',
    routerIp: ''
  });

  const testConnection = async (branchId: string, routerIp: string) => {
    setIsTestingConnection(branchId);
    
    try {
      // Simular prueba de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actualizar estado basado en resultado simulado
      const isOnline = Math.random() > 0.3; // 70% de probabilidad de éxito
      
      setBranches(prev => prev.map(branch => 
        branch.id === branchId 
          ? { 
              ...branch, 
              status: isOnline ? 'online' : 'offline',
              lastSeen: new Date().toISOString()
            }
          : branch
      ));
      
      alert(isOnline ? 'Conexión exitosa' : 'No se pudo conectar al router');
    } catch (error) {
      console.error('Error probando conexión:', error);
      alert('Error al probar conexión');
    } finally {
      setIsTestingConnection(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBranch) {
        // Editar sucursal existente
        setBranches(prev => prev.map(branch =>
          branch.id === editingBranch.id
            ? { ...branch, ...formData }
            : branch
        ));
      } else {
        // Agregar nueva sucursal
        const newBranch: Branch = {
          id: Date.now().toString(),
          ...formData,
          status: 'offline',
          lastSeen: new Date().toISOString(),
          visitorsToday: 0,
          totalVisitors: 0
        };
        setBranches(prev => [...prev, newBranch]);
      }
      
      // Resetear formulario
      setFormData({ name: '', address: '', routerType: '', routerIp: '' });
      setIsAddingBranch(false);
      setEditingBranch(null);
    } catch (error) {
      console.error('Error guardando sucursal:', error);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      routerType: branch.routerType,
      routerIp: branch.routerIp
    });
  };

  const handleDelete = (branchId: string) => {
    if (confirm('¿Estás seguro de eliminar esta sucursal?')) {
      setBranches(prev => prev.filter(branch => branch.id !== branchId));
    }
  };

  const onlineBranches = branches.filter(b => b.status === 'online').length;
  const totalBranches = branches.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Sucursales</h1>
          <p className="text-zinc-400">Administra tus sucursales y su conexión WiFi</p>
        </div>
        <Button
          onClick={() => setIsAddingBranch(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Sucursal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">Sucursales Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold text-white">{onlineBranches}</div>
              <div className="text-sm text-zinc-500">/ {totalBranches} totales</div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(onlineBranches / totalBranches) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">Visitantes Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {branches.reduce((sum, branch) => sum + branch.visitorsToday, 0)}
            </div>
            <p className="text-xs text-zinc-500 mt-2">Total en todas las sucursales</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal para agregar/editar sucursal */}
      {(isAddingBranch || editingBranch) && (
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              {editingBranch ? 'Editar Sucursal' : 'Agregar Nueva Sucursal'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-zinc-300">
                    Nombre de la Sucursal
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder="Sucursal Central"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="routerType" className="text-zinc-300">
                    Tipo de Router
                  </Label>
                  <Select value={formData.routerType} onValueChange={(value) => setFormData(prev => ({ ...prev, routerType: value }))}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {routerTypes.map((type) => (
                        <SelectItem key={type} value={type} className="text-white">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-zinc-300">
                  Dirección
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  placeholder="Av. Principal #123, Ciudad"
                  required
                />
              </div>

              <div>
                <Label htmlFor="routerIp" className="text-zinc-300">
                  IP del Router
                </Label>
                <Input
                  id="routerIp"
                  value={formData.routerIp}
                  onChange={(e) => setFormData(prev => ({ ...prev, routerIp: e.target.value }))}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  placeholder="192.168.1.1"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingBranch ? 'Actualizar' : 'Guardar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingBranch(false);
                    setEditingBranch(null);
                    setFormData({ name: '', address: '', routerType: '', routerIp: '' });
                  }}
                  className="border-zinc-700 text-zinc-300"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Sucursales */}
      <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white">Sucursales Configuradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400 font-medium">Sucursal</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Dirección</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Router</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Estado</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Visitantes Hoy</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Última Conexión</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="text-white font-medium">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-zinc-400" />
                        {branch.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">{branch.address}</TableCell>
                    <TableCell className="text-zinc-300">
                      <div className="text-sm">
                        <div className="font-medium">{branch.routerType}</div>
                        <div className="text-zinc-500">{branch.routerIp}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={branch.status === 'online' ? 'default' : 'destructive'}
                        className={branch.status === 'online' ? 'bg-green-600' : 'bg-red-600'}
                      >
                        <div className="flex items-center space-x-1">
                          {branch.status === 'online' ? (
                            <Wifi className="w-3 h-3" />
                          ) : (
                            <WifiOff className="w-3 h-3" />
                          )}
                          <span>{branch.status === 'online' ? 'Online' : 'Offline'}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-mono">{branch.visitorsToday}</TableCell>
                    <TableCell className="text-zinc-300">
                      {new Date(branch.lastSeen).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testConnection(branch.id, branch.routerIp)}
                          disabled={isTestingConnection === branch.id}
                          className="border-zinc-700 text-zinc-300"
                        >
                          {isTestingConnection === branch.id ? (
                            <div className="w-4 h-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(branch)}
                          className="border-zinc-700 text-zinc-300"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(branch.id)}
                          className="border-red-700 text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
