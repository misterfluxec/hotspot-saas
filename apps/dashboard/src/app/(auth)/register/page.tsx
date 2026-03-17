'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wifi, ArrowRight, Eye, EyeOff } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'Perfecto para empezar'
  },
  {
    id: 'business',
    name: 'Business',
    price: 79,
    description: 'Ideal para crecimiento'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    description: 'Para grandes empresas'
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
  const [selectedPlan, setSelectedPlan] = useState('business');
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
      // Debug: Verificar qué plan ID se está enviando
      console.log('Enviando planId:', selectedPlan);
      
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
          planId: selectedPlan // Enviar exactamente el ID del plan
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
      
      {/* Panel Izquierdo - Branding (50%) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 p-20 flex-col justify-center items-center text-center text-white">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Wifi className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold" style={{ fontFamily: 'Geist Sans' }}>
            HotSpot SaaS
          </span>
        </div>
        
        {/* Mensaje Potente */}
        <div className="max-w-lg space-y-6">
          <h1 className="text-4xl font-bold leading-tight" style={{ fontFamily: 'Geist Sans' }}>
            Transforma tu WiFi en una herramienta de marketing
          </h1>
          <p className="text-lg text-zinc-300" style={{ fontFamily: 'Geist Sans' }}>
            Captura datos, incrementa ventas y fideliza clientes con analytics en tiempo real
          </p>
        </div>
        
        {/* Stat Social Proof */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="text-3xl font-bold" style={{ fontFamily: 'Geist Mono' }}>
            500+
          </div>
          <div className="text-zinc-400" style={{ fontFamily: 'Geist Sans' }}>
            negocios confían en nosotros
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario de Registro (50%) */}
      <div className="w-full lg:w-1/2 bg-black overflow-y-auto">
        <div className="max-w-md mx-auto py-12 px-6 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Geist Sans' }}>
              Crear cuenta gratis
            </h2>
            <p className="text-zinc-400" style={{ fontFamily: 'Geist Sans' }}>
              14 días sin tarjeta
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
                    placeholder="••••••"
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

            {/* Plan Selection - Grid de 3 Columnas */}
            <div>
              <Label className="text-zinc-300 text-sm font-medium mb-4 block" style={{ fontFamily: 'Geist Sans' }}>
                Elige tu plan
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`cursor-pointer transition-all duration-200 border border-zinc-700 rounded-lg p-4 text-center ${
                      selectedPlan === plan.id
                        ? 'border-blue-600 bg-blue-950'
                        : 'bg-zinc-900 hover:border-zinc-600'
                    }`}
                  >
                    <div className="font-medium text-white mb-2" style={{ fontFamily: 'Geist Sans' }}>
                      {plan.name}
                    </div>
                    <div className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Geist Mono' }}>
                      ${plan.price}
                    </div>
                    <div className="text-xs text-zinc-400" style={{ fontFamily: 'Geist Sans' }}>
                      /mes
                    </div>
                    <div className="text-xs text-zinc-500 mt-2" style={{ fontFamily: 'Geist Sans' }}>
                      {plan.description}
                    </div>
                  </div>
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
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium transition-all duration-200"
              style={{ fontFamily: 'Geist Sans' }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta gratis
                  <ArrowRight className="w-4 h-4 ml-2" />
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
