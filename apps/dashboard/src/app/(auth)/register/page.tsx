'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, Wifi, Users, TrendingUp, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
    name: 'Pro',
    price: 149,
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
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    email: '',
    password: '',
    acceptTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      alert('Debes aceptar los términos y condiciones');
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
    <div className="min-h-screen bg-zinc-950">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        
        {/* Left Column - Hero Section */}
        <div className="hidden lg:flex bg-gradient-to-br from-blue-900 to-blue-950 items-center justify-center p-12">
          <div className="max-w-lg w-full text-center space-y-8">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">HotSpot SaaS</span>
            </div>
            
            {/* Hero Text */}
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-white leading-tight">
                Transforma tu WiFi en una herramienta de marketing
              </h1>
              
              {/* Benefits */}
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="text-white text-lg">Captura datos de tus clientes</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="text-white text-lg">Incrementa tus ventas y fidelización</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="text-white text-lg">Analytics avanzados en tiempo real</span>
                </div>
              </div>
              
              {/* Stat */}
              <div className="pt-8 border-t border-white/20">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-blue-200">negocios confían en nosotros</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form Section */}
        <div className="bg-zinc-900 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">Crear cuenta gratis</h2>
              <p className="text-zinc-400">14 días sin tarjeta</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName" className="text-zinc-300 text-sm font-medium">
                    Nombre del negocio
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    className="mt-2 bg-zinc-800 border-zinc-700 text-white focus:border-blue-500"
                    placeholder="Mi Restaurante S.A."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="businessType" className="text-zinc-300 text-sm font-medium">
                    Tipo de negocio
                  </Label>
                  <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
                    <SelectTrigger className="mt-2 bg-zinc-800 border-zinc-700 text-white focus:border-blue-500">
                      <SelectValue placeholder="Selecciona tu tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
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
                    Email administrador
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-2 bg-zinc-800 border-zinc-700 text-white focus:border-blue-500"
                    placeholder="admin@negocio.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="mt-2 bg-zinc-800 border-zinc-700 text-white focus:border-blue-500 pr-10"
                      placeholder="•••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Plans Selection */}
              <div>
                <Label className="text-zinc-300 text-sm font-medium">Elige tu plan</Label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {plans.map((plan) => (
                    <Card
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedPlan === plan.id
                          ? 'border-blue-500 bg-blue-950'
                          : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <CardContent className="p-3 text-center">
                        {plan.recommended && (
                          <div className="mb-2">
                            <Badge className="bg-green-600 text-white text-xs">
                              Recomendado
                            </Badge>
                          </div>
                        )}
                        <div className="text-lg font-bold text-white">{plan.name}</div>
                        <div className="text-xl font-bold text-blue-400">${plan.price}</div>
                        <div className="text-xs text-zinc-400">/mes</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
                  required
                />
                <Label htmlFor="terms" className="text-sm text-zinc-400">
                  Acepto los <a href="#" className="text-blue-400 hover:text-blue-300">términos y condiciones</a> y la <a href="#" className="text-blue-400 hover:text-blue-300">política de privacidad</a>
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !formData.businessName || !formData.businessType || !formData.email || !formData.acceptTerms}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <>
                    <span>Crear cuenta gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-zinc-400">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Iniciar sesión
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
