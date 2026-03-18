'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔐 Intentando login:', { email });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // CRÍTICO: Para cookies httpOnly
      });

      const result = await response.json();
      console.log('📡 Respuesta del servidor:', { status: response.status, result });

      if (!response.ok) {
        // Mostrar error específico del backend
        throw new Error(result.message || `Error ${response.status}: ${result.error}`);
      }

      console.log('✅ Login exitoso, redirigiendo...');

      // Pequeño delay para asegurar que la cookie se establezca
      await new Promise(resolve => setTimeout(resolve, 100));

      router.push(result.redirect || '/dashboard');
      router.refresh(); // Forzar refresh de datos

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión con el servidor';
      console.error('❌ Error en login:', err);
      setError(errorMessage);

      // Feedback visual adicional
      if (errorMessage.includes('credenciales') || errorMessage.includes('inválidas')) {
        // Resaltar campos de email/password
        const inputs = e.currentTarget.querySelectorAll('input');
        inputs.forEach(input => {
          input.classList.add('ring-2', 'ring-red-500/50');
          setTimeout(() => input.classList.remove('ring-2', 'ring-red-500/50'), 2000);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-black">
      {/* PANEL IZQUIERDO - BRANDING (50% desktop+, oculto móvil) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 p-12 lg:p-20 flex-col justify-center items-center text-center text-white">
        <div className="max-w-2xl space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4">
            <svg className="w-20 h-20 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <span className="text-4xl font-bold">HotSpot SaaS</span>
          </div>

          {/* Mensaje Principal */}
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Bienvenido de nuevo
            </h1>
            <p className="text-zinc-400 text-xl lg:text-2xl">
              Gestiona tu WiFi, captura datos y haz crecer tu negocio desde un solo lugar.
            </p>
          </div>

          {/* Beneficios */}
          <div className="space-y-4 text-left max-w-lg mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 text-sm">📊</span>
              </div>
              <span className="text-zinc-300 text-lg">Analytics en tiempo real</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 text-sm">🎯</span>
              </div>
              <span className="text-zinc-300 text-lg">Campañas segmentadas</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 text-sm">📈</span>
              </div>
              <span className="text-zinc-300 text-lg">Reportes detallados</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="pt-8 border-t border-zinc-800">
            <p className="text-zinc-500 text-lg">Conectado con</p>
            <p className="text-5xl font-bold text-white">500+ negocios</p>
            <p className="text-zinc-500 text-lg">en toda la región</p>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO - FORMULARIO (100% móvil, 50% desktop) */}
      <div className="w-full lg:w-1/2 bg-black overflow-y-auto flex items-center justify-center py-12 px-6 lg:px-8">
        <div className="max-w-lg mx-auto w-full space-y-8">
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <span className="text-2xl font-bold text-white">HotSpot SaaS</span>
          </div>

          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">Iniciar sesión</h2>
            <p className="text-zinc-400 text-lg">Accede a tu panel de administración</p>
          </div>

          {/* Formulario de login */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-zinc-300 mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg h-14"
                placeholder="admin@labodegaec.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-lg font-medium text-zinc-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg h-14"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg h-14"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="text-center">
            <p className="text-zinc-400 text-lg">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors underline">
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Forgot password link */}
          <div className="text-center">
            <a href="#" className="text-blue-400 hover:text-blue-300 text-lg transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Footer info */}
          <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-500 text-sm">
              Acceso restringido a administradores autorizados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
