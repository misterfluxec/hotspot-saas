'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

const plans = [
  { id: 'starter', name: 'Starter', price: 29 },
  { id: 'business', name: 'Business', price: 79 },
  { id: 'enterprise', name: 'Pro', price: 149 }
];

export default function NuevoClientePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    planId: 'business'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/dashboard/clientes/${result.tenantId}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear cliente');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Nuevo Cliente</h1>
          <p className="text-slate-400">Crea una nueva cuenta para un cliente</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName" className="text-slate-300 text-sm font-medium">
                Nombre del Negocio
              </Label>
              <Input
                id="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                className="mt-2 bg-slate-800 border-slate-700 text-white focus:border-blue-500"
                placeholder="Mi Restaurante S.A."
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                Email del Administrador
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-2 bg-slate-800 border-slate-700 text-white focus:border-blue-500"
                placeholder="admin@negocio.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="plan" className="text-slate-300 text-sm font-medium">
                Plan Inicial
              </Label>
              <Select value={formData.planId} onValueChange={(value) => setFormData(prev => ({ ...prev, planId: value }))}>
                <SelectTrigger className="mt-2 bg-slate-800 border-slate-700 text-white focus:border-blue-500">
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id} className="text-white hover:bg-slate-700">
                      {plan.name} - ${plan.price}/mes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading || !formData.businessName || !formData.email}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando cliente...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Crear Cliente</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
