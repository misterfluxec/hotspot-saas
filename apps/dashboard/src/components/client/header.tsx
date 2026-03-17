'use client';

import { useState } from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  user: {
    userId: string;
    tenantId: string | null;
    role: string;
    email: string;
  };
}

export function Header({ user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-zinc-900 border-b border-zinc-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-zinc-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Buscar visitantes, sucursales..."
                className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative text-zinc-400 hover:text-white">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full p-0 flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs text-zinc-400">Administrador</p>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="/cliente" className="block px-3 py-2 text-white bg-zinc-800 rounded-md">
              Dashboard
            </a>
            <a href="/cliente/visitantes" className="block px-3 py-2 text-zinc-400 hover:text-white rounded-md">
              Visitantes
            </a>
            <a href="/cliente/portal" className="block px-3 py-2 text-zinc-400 hover:text-white rounded-md">
              Portal WiFi
            </a>
            <a href="/cliente/sucursales" className="block px-3 py-2 text-zinc-400 hover:text-white rounded-md">
              Sucursales
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
