'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: [
      'Hasta 50 usuarios concurrentes',
      '1 sucursal',
      'Portal WiFi básico',
      'Soporte por email'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 79,
    features: [
      'Hasta 200 usuarios concurrentes',
      'Hasta 5 sucursales',
      'Portal WiFi personalizado',
      'Analytics avanzado',
      'Soporte prioritario'
    ],
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    features: [
      'Usuarios ilimitados',
      'Sucursales ilimitadas',
      'Portal WiFi premium',
      'API completa',
      'Soporte 24/7',
      'White label'
    ]
  }
];

const businessTypes = [
  'Restaurante',
  'Hotel',
  'Cafetería',
  'Tienda',
  'Oficina',
  'Gimnasio',
  'Evento',
  'Otro'
];

export default function RegisterPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('business');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          businessType: formData.businessType,
          email: formData.email,
          password: formData.password,
          planId: selectedPlan
        }),
      });

      if (response.ok) {
        router.push('/login?message=Registro exitoso. Por favor inicia sesión.');
      } else {
        const error = await response.json();
        alert(error.message || 'Error en el registro');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Comienza tu HotSpot SaaS
          </h1>
          <p className="text-zinc-400 text-lg">
            Transforma tu negocio con WiFi inteligente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulario */}
          <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Datos del Negocio</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="businessName" className="text-zinc-300">
                    Nombre del Negocio
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    className="bg-zinc-800/50 border-zinc-700 text-white focus:border-blue-500"
                    placeholder="Mi Restaurante S.A."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="businessType" className="text-zinc-300">
                    Tipo de Negocio
                  </Label>
                  <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                      <SelectValue placeholder="Selecciona tu tipo de negocio" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type} className="text-white">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="email" className="text-zinc-300">
                    Email Administrador
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-zinc-800/50 border-zinc-700 text-white focus:border-blue-500"
                    placeholder="admin@negocio.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-zinc-300">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-zinc-800/50 border-zinc-700 text-white focus:border-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-zinc-300">
                    Confirmar Contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-zinc-800/50 border-zinc-700 text-white focus:border-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !formData.businessName || !formData.businessType || !formData.email}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                      <span>Creando cuenta...</span>
                    </div>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Selección de Planes */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Elige tu Plan</h2>
            <div className="space-y-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                  } ${plan.recommended ? 'relative' : ''}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">
                        Recomendado
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-lg ${selectedPlan === plan.id ? 'text-white' : 'text-zinc-300'}`}>
                        {plan.name}
                      </CardTitle>
                      <div className={`text-2xl font-bold ${selectedPlan === plan.id ? 'text-white' : 'text-zinc-300'}`}>
                        ${plan.price}
                        <span className="text-sm font-normal text-zinc-400">/mes</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedPlan === plan.id ? 'bg-blue-400' : 'bg-zinc-400'
                          }`}></div>
                          <span className={`text-sm ${selectedPlan === plan.id ? 'text-white' : 'text-zinc-300'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
              <p className="text-sm text-zinc-400">
                <strong>Beneficios incluidos:</strong> Todos los planes incluyen acceso al panel de administración, 
                analytics básico y soporte técnico. Puedes cambiar tu plan en cualquier momento.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-zinc-400">
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="text-blue-400 hover:text-blue-300">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
