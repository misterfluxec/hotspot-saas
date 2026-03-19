'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PLANS = [
  { id: 'starter', name: 'Starter', price: 29, description: 'Perfecto para empezar' },
  { id: 'business', name: 'Business', price: 79, description: 'Ideal para crecimiento', recommended: true },
  { id: 'enterprise', name: 'Enterprise', price: 199, description: 'Para grandes empresas' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('business');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // CRÍTICO: Normalización de datos antes de enviar
    const data = {
      businessName: formData.get('businessName') as string,
      businessType: formData.get('businessType') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      planId: selectedPlan.toLowerCase().trim(), // ← IDs en minúsculas
      termsAccepted: formData.get('terms') === 'on',
    };

    console.log('📤 Enviando registro:', data);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      console.log('✅ Registro exitoso:', result);
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push(result.redirect || '/onboarding');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      console.error('❌ Error en registro:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      'min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden bg-black',
      GeistSans.variable,
      GeistMono.variable
    )}>
      {/* PANEL IZQUIERDO - BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 p-20 flex-col justify-center items-center text-center text-white">
        <div className="max-w-md space-y-8">
          <div className="flex items-center justify-center gap-3">
            <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <span className="text-2xl font-bold">HotSpot SaaS</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Transforma tu WiFi en una herramienta de marketing
            </h1>
            <p className="text-zinc-400 text-lg">
              Captura datos, incrementa ventas y fideliza clientes con analytics en tiempo real.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {['Captura datos de visitantes automáticamente', 'Incrementa ventas con campañas segmentadas', 'Analytics en tiempo real de tu negocio'].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                <span className="text-zinc-300">{text}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-zinc-800">
            <p className="text-zinc-500 text-sm">Más de</p>
            <p className="text-3xl font-bold text-white">500+ negocios</p>
            <p className="text-zinc-500 text-sm">confían en nosotros</p>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO - FORMULARIO */}
      <div className="w-full lg:w-1/2 bg-black overflow-y-auto flex items-center justify-center py-12 px-6">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Crear cuenta gratis</h2>
            <p className="text-zinc-400">14 días de prueba sin tarjeta de crédito</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del negocio */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-zinc-300">Nombre del negocio</Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Mi Restaurante S.A."
                type="text"
                className="bg-zinc-900 border-zinc-800 text-white h-12 px-4 focus:border-blue-500"
                required
              />
            </div>

            {/* Tipo de negocio */}
            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-zinc-300">Tipo de negocio</Label>
              <Select name="businessType" defaultValue="restaurante">
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-12 px-4 focus:border-blue-500">
                  <SelectValue placeholder="Selecciona tu tipo" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {['restaurante', 'hotel', 'cafeteria', 'tienda', 'oficina', 'gimnasio', 'evento', 'otro'].map((type) => (
                    <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email administrador</Label>
              <Input
                id="email"
                name="email"
                placeholder="admin@negocio.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                className="bg-zinc-900 border-zinc-800 text-white h-12 px-4 focus:border-blue-500"
                required
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Contraseña</Label>
              <Input
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                className="bg-zinc-900 border-zinc-800 text-white h-12 px-4 focus:border-blue-500"
                required
                minLength={8}
              />
            </div>

            {/* Selección de planes */}
            <div className="space-y-3">
              <Label className="text-zinc-300">Elige tu plan</Label>
              <RadioGroup
                value={selectedPlan}
                onValueChange={setSelectedPlan}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {PLANS.map((plan) => (
                  <Label
                    key={plan.id}
                    htmlFor={plan.id}
                    className={cn(
                      'flex flex-col items-center justify-between rounded-lg border p-4 cursor-pointer transition-all',
                      'hover:bg-zinc-800/50',
                      selectedPlan === plan.id
                        ? 'border-blue-600 bg-blue-950/30'
                        : 'border-zinc-700 bg-zinc-900/50',
                      plan.recommended && 'relative'
                    )}
                  >
                    {plan.recommended && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                        RECOMENDADO
                      </span>
                    )}
                    <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                    <div className="text-lg font-bold text-white">{plan.name}</div>
                    <div className={cn('text-3xl font-bold text-blue-400 my-2', GeistMono.className)}>
                      ${plan.price}
                    </div>
                    <div className="text-zinc-400 text-sm">/mes</div>
                    <div className="text-zinc-500 text-xs mt-2 text-center">{plan.description}</div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Términos */}
            <div className="flex items-start space-x-3">
              <Checkbox id="terms" name="terms" required className="mt-1" />
              <Label htmlFor="terms" className="text-sm text-zinc-400 font-normal leading-relaxed">
                Acepto los{' '}
                <Link href="/terminos" className="underline text-blue-400 hover:text-blue-300">
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link href="/privacidad" className="underline text-blue-400 hover:text-blue-300">
                  política de privacidad
                </Link>
              </Label>
            </div>

            {/* Botón Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-6 h-12 hover:from-blue-700 hover:to-blue-600 transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                'Crear cuenta gratis'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="underline text-blue-400 hover:text-blue-300">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
