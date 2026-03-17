'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Wifi, 
  MapPin, 
  Settings, 
  Palette,
  BarChart3,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  tenantId: string;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/cliente',
    icon: LayoutDashboard,
  },
  {
    name: 'Visitantes',
    href: '/cliente/visitantes',
    icon: Users,
  },
  {
    name: 'Portal WiFi',
    href: '/cliente/portal',
    icon: Wifi,
  },
  {
    name: 'Sucursales',
    href: '/cliente/sucursales',
    icon: MapPin,
  },
  {
    name: 'Analytics',
    href: '/cliente/analytics',
    icon: BarChart3,
  },
  {
    name: 'Diseño',
    href: '/cliente/diseno',
    icon: Palette,
  },
  {
    name: 'Configuración',
    href: '/cliente/configuracion',
    icon: Settings,
  },
];

export function Sidebar({ tenantId }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-zinc-900 border-r border-zinc-800">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wifi className="w-5 h-5 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold text-white">HotSpot</span>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-200' : 'text-zinc-400 group-hover:text-zinc-300'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-4 mt-auto">
          <div className="p-3 bg-zinc-800 rounded-lg">
            <p className="text-xs text-zinc-400 mb-1">Plan actual</p>
            <p className="text-sm font-medium text-white">Business</p>
            <p className="text-xs text-zinc-500 mt-1">14 días restantes</p>
          </div>
          
          <Link
            href="/api/auth/logout"
            className="mt-4 group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
