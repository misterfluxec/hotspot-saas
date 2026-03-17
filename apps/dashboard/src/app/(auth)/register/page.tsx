'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, Wifi, Users, Zap, Shield, Sparkles, ArrowRight } from 'lucide-react';

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
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Visual Section */}
          <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">HotSpot</span>
            </div>
            
            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="w-96 h-96 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl border border-white/10 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-6 p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Transforma tu WiFi en crecimiento
                  </h2>
                  <p className="text-zinc-400 max-w-sm">
                    Convierte tu conexión WiFi en una poderosa herramienta de marketing y fidelización de clientes
                  </p>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center justify-center">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center space-x-8 text-zinc-400 text-sm">
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

          {/* Right Side - Form Section */}
          <div className="space-y-8">
            {/* Plans Selection */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                Elige tu Plan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`cursor-pointer transition-all duration-300 relative ${
                      selectedPlan === plan.id
                        ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/50 shadow-lg shadow-blue-500/20 scale-105'
                        : 'bg-zinc-900/50 border-white/5 hover:border-white/10 hover:bg-zinc-900/70'
                    }`}
                  >
                    <CardContent className="p-4">
                      {plan.recommended && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-3 py-1 text-xs font-bold shadow-lg">
                            MÁS POPULAR
                          </Badge>
                        </div>
                      )}
                      
                      <div className="text-center space-y-3">
                        <h3 className={`font-bold text-lg ${selectedPlan === plan.id ? 'text-white' : 'text-zinc-300'}`}>
                          {plan.name}
                        </h3>
                        
                        <div className="space-y-1">
                          <div className={`text-3xl font-bold ${selectedPlan === plan.id ? 'text-white' : 'text-zinc-300'}`}>
                            ${plan.price}
                          </div>
                          <div className="text-sm text-zinc-500">/mes</div>
                        </div>
                        
                        <div className="space-y-2 text-left">
                          {plan.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Check className={`w-3 h-3 flex-shrink-0 ${selectedPlan === plan.id ? 'text-blue-400' : 'text-zinc-500'}`} />
                              <span className={`text-xs ${selectedPlan === plan.id ? 'text-zinc-200' : 'text-zinc-400'}`}>
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Registration Form */}
            <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-white mb-6">Datos del Negocio</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessName" className="text-zinc-300 text-sm font-medium">
                        Nombre del Negocio
                      </Label>
                      <Input
                        id="businessName"
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                        className="mt-2 bg-zinc-900/70 border-white/10 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Mi Restaurante S.A."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessType" className="text-zinc-300 text-sm font-medium">
                        Tipo de Negocio
                      </Label>
                      <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
                        <SelectTrigger className="mt-2 bg-zinc-900/70 border-white/10 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all">
                          <SelectValue placeholder="Selecciona tu tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900/95 border-white/10 backdrop-blur-sm">
                          {businessTypes.map((type) => (
                            <SelectItem key={type} value={type} className="text-white hover:bg-zinc-800">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                      className="mt-2 bg-zinc-900/70 border-white/10 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                        className="mt-2 bg-zinc-900/70 border-white/10 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="••••••"
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
                        className="mt-2 bg-zinc-900/70 border-white/10 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="••••••"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !formData.businessName || !formData.businessType || !formData.email}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                        <span>Creando cuenta...</span>
                      </>
                    ) : (
                      <>
                        <span>Crear Cuenta</span>
                        <ArrowRight className="w-5 h-5" />
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
