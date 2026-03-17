'use client';

import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { cn } from "@/lib/utils"; // Asumiendo que tienes una utilidad para combinar clases de Tailwind
import { Button } from "@/components/ui/button"; // Asumiendo shadcn/ui Button
import { Input } from "@/components/ui/input"; // Asumiendo shadcn/ui Input
import { Label } from "@/components/ui/label"; // Asumiendo shadcn/ui Label
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Asumiendo shadcn/ui RadioGroup
import { Checkbox } from "@/components/ui/checkbox"; // Asumiendo shadcn/ui Checkbox
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Asumiendo shadcn/ui Select

export default function RegisterPage() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const businessName = formData.get("businessName");
    const businessType = formData.get("businessType");
    const email = formData.get("email");
    const password = formData.get("password");
    const selectedPlan = formData.get("plan");
    const termsAccepted = formData.get("terms");

    console.log("Datos del formulario:", {
      businessName,
      businessType,
      email,
      password,
      selectedPlan,
      termsAccepted,
    });

    // CRÍTICO: Normalización del planId antes de enviar al backend
    const normalizedPlanId = String(selectedPlan).toLowerCase().trim();
    console.log("Enviando planId normalizado:", normalizedPlanId);

    // Aquí iría la lógica para enviar los datos al backend
    // Por ejemplo, usando fetch o una librería como axios
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName,
          businessType,
          email,
          password,
          planId: normalizedPlanId, // Usar el planId normalizado
          termsAccepted: !!termsAccepted,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error en el registro:", errorData);
        alert(`Error en el registro: ${errorData.message || 'Hubo un problema.'}`);
        return;
      }

      const data = await response.json();
      console.log("Registro exitoso:", data);
      alert("¡Registro exitoso! Redirigiendo...");
      // Redirigir al usuario a una página de éxito o dashboard
    } catch (error) {
      console.error("Error de red o inesperado:", error);
      alert("Ocurrió un error inesperado. Inténtalo de nuevo.");
    }
  };

  return (
    <div className={cn(
      "min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden",
      GeistSans.variable, GeistMono.variable // Aplicar fuentes Geist
    )}>
      {/* Panel Izquierdo (Branding) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 p-20 flex-col justify-center items-center text-center text-white font-sans">
        {/* Logo Placeholder */}
        <svg
          className="h-12 w-12 mb-6 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-4xl font-bold mb-4 leading-tight">Transforma tu WiFi en una herramienta de marketing</h1>
        <p className="text-lg text-zinc-300 mb-8 max-w-md whitespace-normal">Captura datos, incrementa ventas y fideliza clientes con analytics en tiempo real.</p>
        <div className="text-zinc-400 text-sm">
          <p className="mb-2">✓ Datos</p>
          <p className="mb-2">✓ Ventas</p>
          <p>✓ Analytics</p>
        </div>
        <p className="mt-8 text-zinc-400 text-sm">Más de <span className="font-mono text-blue-400">500+</span> negocios confían en nosotros</p>
      </div>

      {/* Panel Derecho (Formulario de Registro ) */}
      <div className="w-full lg:w-1/2 bg-black overflow-y-auto flex items-center justify-center py-12 px-6">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Crear cuenta gratis</h2>
            <p className="text-zinc-400">14 días sin tarjeta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="businessName" className="text-zinc-300">Nombre del negocio</Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Mi Restaurante S.A."
                type="text"
                className="bg-zinc-900 border-zinc-800 text-white h-12 px-4"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="businessType" className="text-zinc-300">Tipo de negocio</Label>
              <Select name="businessType" defaultValue="Otro">
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-12 px-4">
                  <SelectValue placeholder="Selecciona tu tipo" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="Restaurante">Restaurante</SelectItem>
                  <SelectItem value="Hotel">Hotel</SelectItem>
                  <SelectItem value="Cafeteria">Cafetería</SelectItem>
                  <SelectItem value="Tienda">Tienda</SelectItem>
                  <SelectItem value="Oficina">Oficina</SelectItem>
                  <SelectItem value="Gimnasio">Gimnasio</SelectItem>
                  <SelectItem value="Evento">Evento</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-zinc-300">Email administrador</Label>
              <Input
                id="email"
                name="email"
                placeholder="admin@negocio.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                className="bg-zinc-900 border-zinc-800 text-white h-12 px-4"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-zinc-300">Contraseña</Label>
              <Input
                id="password"
                name="password"
                placeholder="••••••"
                type="password"
                className="bg-zinc-900 border-zinc-800 text-white h-12 px-4"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-300">Elige tu plan</Label>
              <RadioGroup defaultValue="starter" className="grid grid-cols-1 md:grid-cols-3 gap-4" name="plan">
                <Label
                  htmlFor="starter"
                  className="flex flex-col items-center justify-between rounded-lg border p-4 text-white hover:bg-zinc-800 data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600"
                >
                  <RadioGroupItem id="starter" value="starter" className="sr-only" />
                  <div className="text-lg font-bold">Starter</div>
                  <div className={cn("text-3xl font-mono font-bold text-blue-400 my-2", GeistMono.className)}>$29</div>
                  <div className="text-zinc-400 text-sm">/mes</div>
                  <div className="text-zinc-500 text-xs mt-1 text-center">Perfecto para empezar</div>
                </Label>
                <Label
                  htmlFor="business"
                  className="flex flex-col items-center justify-between rounded-lg border p-4 text-white hover:bg-zinc-800 data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600"
                >
                  <RadioGroupItem id="business" value="business" className="sr-only" />
                  <div className="text-lg font-bold">Business</div>
                  <div className={cn("text-3xl font-mono font-bold text-blue-400 my-2", GeistMono.className)}>$79</div>
                  <div className="text-zinc-400 text-sm">/mes</div>
                  <div className="text-zinc-500 text-xs mt-1 text-center">Ideal para crecimiento</div>
                </Label>
                <Label
                  htmlFor="enterprise"
                  className="flex flex-col items-center justify-between rounded-lg border p-4 text-white hover:bg-zinc-800 data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600"
                >
                  <RadioGroupItem id="enterprise" value="enterprise" className="sr-only" />
                  <div className="text-lg font-bold">Enterprise</div>
                  <div className={cn("text-3xl font-mono font-bold text-blue-400 my-2", GeistMono.className)}>$199</div>
                  <div className="text-zinc-400 text-sm">/mes</div>
                  <div className="text-zinc-500 text-xs mt-1 text-center">Para grandes empresas</div>
                </Label>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" name="terms" required />
              <Label htmlFor="terms" className="text-sm text-zinc-400 whitespace-normal">
                Acepto los <Link href="#" className="underline text-blue-400">términos y condiciones</Link> y la <Link href="#" className="underline text-blue-400">política de privacidad</Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 h-12"
            >
              Crear cuenta gratis
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="underline text-blue-400">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
