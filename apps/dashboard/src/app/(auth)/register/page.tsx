'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, Wifi, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-zinc-950 flex">
      <div className="flex flex-col lg:flex-row w-full">
        
        {/* Left Column - Visual Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 items-center justify-center p-12">
          <div className="max-w-md w-full text-center space-y-8">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">HotSpot</span>
            </div>
            
            {/* Hero Text */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">
                Transforma tu WiFi en crecimiento
              </h1>
              <p className="text-lg text-zinc-400">
                Convierte tu conexión WiFi en una poderosa herramienta de marketing y fidelización de clientes
              </p>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-6 text-sm text-zinc-400">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>SSL Seguro</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            
            {/* Plans Selection */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Elige tu Plan</h2>
              <div className="space-y-3">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedPlan === plan.id
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <CardContent className="p-4">
                      {plan.recommended && (
                        <div className="mb-3">
                          <Badge className="bg-green-600 text-white">
                            RECOMENDADO
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white">
                          {plan.name}
                        </h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            ${plan.price}
                          </div>
                          <div className="text-sm text-zinc-400">/mes</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-sm text-zinc-300">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Registration Form */}
            <Card className="bg-zinc-900 border-zinc-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Datos del Negocio</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="businessName" className="text-zinc-300 text-sm font-medium">
                        Nombre del Negocio
                      </Label>
                      <Input
                        id="businessName"
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                        className="mt-2 bg-zinc-800 border-zinc-600 text-white focus:border-blue-500"
                        placeholder="Mi Restaurante S.A."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessType" className="text-zinc-300 text-sm font-medium">
                        Tipo de Negocio
                      </Label>
                      <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
                        <SelectTrigger className="mt-2 bg-zinc-800 border-zinc-600 text-white focus:border-blue-500">
                          <SelectValue placeholder="Selecciona tu tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-600">
                          {businessTypes.map((type) => (
                            <SelectItem key={type} value={type} className="text-white hover:bg-zinc-700">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">
                        Email Administrador
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-2 bg-zinc-800 border-zinc-600 text-white focus:border-blue-500"
                        placeholder="admin@negocio.com"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">
                          Contraseña
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="mt-2 bg-zinc-800 border-zinc-600 text-white focus:border-blue-500"
                          placeholder="•••••••"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="text-zinc-300 text-sm font-medium">
                          Confirmar Contraseña
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="mt-2 bg-zinc-800 border-zinc-600 text-white focus:border-blue-500"
                          placeholder="•••••••"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !formData.businessName || !formData.businessType || !formData.email}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                        <span>Creando cuenta...</span>
                      </>
                    ) : (
                      <>
                        <span>Crear Cuenta</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-zinc-400">
                ¿Ya tienes una cuenta?{' '}
                <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Inicia sesión aquí
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
