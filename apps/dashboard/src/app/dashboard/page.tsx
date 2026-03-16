'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Obtener información del usuario desde los headers del middleware
    const getUserInfo = () => {
      // En el cliente, necesitamos obtener la info de otra manera
      // Por ahora, usaremos una llamada a la API
      fetchUserInfo();
    };

    getUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Si no hay sesión, redirigir al login
        router.push('/login');
      }
    } catch (error) {
      console.error('Error obteniendo info del usuario:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Error en logout:', error);
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirigirá al login
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HS</span>
            </div>
            <h1 className="text-xl font-semibold text-white">HotSpot SaaS</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen">
          <nav className="p-4 space-y-2">
            <a
              href="/dashboard"
              className="block px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Dashboard
            </a>
            <a
              href="/dashboard/portals"
              className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Portales
            </a>
            <a
              href="/dashboard/branches"
              className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Sucursales
            </a>
            <a
              href="/dashboard/visitors"
              className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Visitantes
            </a>
            <a
              href="/dashboard/campaigns"
              className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Campañas
            </a>
            <a
              href="/dashboard/settings"
              className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Configuración
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Bienvenido, {user.name}
            </h2>
            <p className="text-slate-400">
              Gestiona tus portales WiFi y monitorea el rendimiento de tu negocio
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white">0</span>
              </div>
              <p className="text-slate-400 text-sm">Clientes activos</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white">0</span>
              </div>
              <p className="text-slate-400 text-sm">Portales activos</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white">0</span>
              </div>
              <p className="text-slate-400 text-sm">Sesiones hoy</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white">$0</span>
              </div>
              <p className="text-slate-400 text-sm">MRR</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Acciones rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-left">
                <div className="font-medium">Crear Portal</div>
                <div className="text-sm opacity-90">Configurar un nuevo portal cautivo</div>
              </button>
              <button className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-left">
                <div className="font-medium">Agregar Sucursal</div>
                <div className="text-sm opacity-90">Registrar una nueva ubicación</div>
              </button>
              <button className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-left">
                <div className="font-medium">Ver Reportes</div>
                <div className="text-sm opacity-90">Análisis y estadísticas detalladas</div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
