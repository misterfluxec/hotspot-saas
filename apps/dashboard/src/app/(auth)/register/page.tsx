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
          planId: selectedPlan.toLowerCase() // Normalizar a minúsculas
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden bg-black">
      
      {/* Panel Izquierdo - Visual (40%) */}
      <div className="hidden lg:flex lg:w-[40%] bg-zinc-900 p-12 flex-col justify-between">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Geist Sans' }}>HotSpot SaaS</span>
            </div>
            
            {/* Hero Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Geist Sans' }}>
                  Transforma tu WiFi en una herramienta de marketing
                </h1>
                
                {/* Benefits */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold" style={{ fontFamily: 'Geist Sans' }}>Captura datos de tus clientes</div>
                      <div className="text-zinc-400 text-sm">Información valiosa para tu negocio</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold" style={{ fontFamily: 'Geist Sans' }}>Incrementa tus ventas</div>
                      <div className="text-zinc-400 text-sm">Fideliza y convierte mejor</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold" style={{ fontFamily: 'Geist Sans' }}>Analytics en tiempo real</div>
                      <div className="text-zinc-400 text-sm">Toma decisiones informadas</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stat */}
              <div className="pt-8 border-t border-zinc-800">
                <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Geist Mono' }}>500+</div>
                <div className="text-blue-400" style={{ fontFamily: 'Geist Sans' }}>negocios confían en nosotros</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario (60%) */}
      <div className="w-full lg:w-[60%] h-full overflow-y-auto bg-black p-6 lg:p-20">
        <div className="max-w-xl mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Geist Sans' }}>Crear cuenta gratis</h2>
            <p className="text-zinc-400" style={{ fontFamily: 'Geist Sans' }}>14 días sin tarjeta</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <Label htmlFor="businessName" className="text-zinc-300 text-sm font-medium" style={{ fontFamily: 'Geist Sans' }}>
                  Nombre del negocio
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="mt-2 h-12 bg-zinc-900 border-zinc-800 text-white focus:border-blue-500 px-4"
                  placeholder="Mi Restaurante S.A."
                  style={{ fontFamily: 'Geist Sans' }}
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessType" className="text-zinc-300 text-sm font-medium" style={{ fontFamily: 'Geist Sans' }}>
                  Tipo de negocio
                </Label>
                <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
                  <SelectTrigger className="mt-2 h-12 bg-zinc-900 border-zinc-800 text-white focus:border-blue-500 px-4" style={{ fontFamily: 'Geist Sans' }}>
                    <SelectValue placeholder="Selecciona tu tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-zinc-800" style={{ fontFamily: 'Geist Sans' }}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email" className="text-zinc-300 text-sm font-medium" style={{ fontFamily: 'Geist Sans' }}>
                  Email administrador
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-2 h-12 bg-zinc-900 border-zinc-800 text-white focus:border-blue-500 px-4"
                  placeholder="admin@negocio.com"
                  style={{ fontFamily: 'Geist Sans' }}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-zinc-300 text-sm font-medium" style={{ fontFamily: 'Geist Sans' }}>
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-2 h-12 bg-zinc-900 border-zinc-800 text-white focus:border-blue-500 px-4 pr-12"
                    placeholder="•••••••"
                    style={{ fontFamily: 'Geist Sans' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Plans Selection - Grid Inteligente */}
            <div>
              <Label className="text-zinc-300 text-sm font-medium mb-4 block" style={{ fontFamily: 'Geist Sans' }}>
                Elige tu plan
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-950'
                        : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      {plan.recommended && (
                        <div className="mb-3">
                          <Badge className="bg-green-600 text-white text-xs" style={{ fontFamily: 'Geist Sans' }}>
                            Recomendado
                          </Badge>
                        </div>
                      )}
                      <div className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Geist Sans' }}>
                        {plan.name}
                      </div>
                      <div className="text-2xl font-bold text-blue-400 mb-1" style={{ fontFamily: 'Geist Mono' }}>
                        ${plan.price}
                      </div>
                      <div className="text-xs text-zinc-400" style={{ fontFamily: 'Geist Sans' }}>
                        /mes
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                className="mt-1 w-4 h-4 text-blue-600 bg-zinc-900 border-zinc-700 rounded focus:ring-blue-500"
                required
              />
              <Label htmlFor="terms" className="text-sm text-zinc-400 leading-relaxed" style={{ fontFamily: 'Geist Sans' }}>
                Acepto los <a href="#" className="text-blue-400 hover:text-blue-300">términos y condiciones</a> y la <a href="#" className="text-blue-400 hover:text-blue-300">política de privacidad</a>
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.businessName || !formData.businessType || !formData.email || !formData.acceptTerms}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              style={{ fontFamily: 'Geist Sans' }}
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
            <p className="text-zinc-400" style={{ fontFamily: 'Geist Sans' }}>
              ¿Ya tienes cuenta?{' '}
              <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Iniciar sesión
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
