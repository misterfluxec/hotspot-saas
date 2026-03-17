import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// Cache keys
const CACHE_KEYS = {
  TENANT_STATS: 'tenant-stats',
  USER_SESSION: 'user-session',
  PORTAL_CONFIG: 'portal-config',
  BRANCH_LIST: 'branch-list',
} as const;

// Cache TTL (time to live) en segundos
const CACHE_TTL = {
  STATS: 300, // 5 minutos
  SESSION: 3600, // 1 hora
  CONFIG: 1800, // 30 minutos
  LIST: 600, // 10 minutos
} as const;

// Cache para estadísticas del tenant
export const getCachedTenantStats = unstable_cache(
  async (tenantId: string) => {
    // Simular query a Prisma - en producción sería una consulta real
    const mockStats = {
      totalVisitors: Math.floor(Math.random() * 1000) + 500,
      activePortals: Math.floor(Math.random() * 10) + 5,
      todaySessions: Math.floor(Math.random() * 500) + 200,
      totalBranches: Math.floor(Math.random() * 20) + 10,
      revenue: Math.floor(Math.random() * 10000) + 5000,
    };

    return {
      tenantId,
      stats: mockStats,
      lastUpdated: new Date().toISOString(),
    };
  },
  [CACHE_KEYS.TENANT_STATS],
  {
    revalidate: CACHE_TTL.STATS,
    tags: ['stats', 'tenant'],
  }
);

// Cache para configuración de portales
export const getCachedPortalConfig = unstable_cache(
  async (portalId: string) => {
    // Simular configuración del portal
    return {
      id: portalId,
      name: `Portal ${portalId}`,
      theme: 'modern',
      customCSS: '',
      branding: {
        logoUrl: '/logo.png',
        primaryColor: '#3b82f6',
        backgroundColor: '#18181b',
      },
      features: {
        socialLogin: true,
        analytics: true,
        customBranding: true,
      },
      settings: {
        sessionTimeout: 30,
        bandwidthLimit: '10mbps',
        allowedDevices: 5,
      },
    };
  },
  [CACHE_KEYS.PORTAL_CONFIG],
  {
    revalidate: CACHE_TTL.CONFIG,
    tags: ['config', 'portal'],
  }
);

// Cache para lista de sucursales
export const getCachedBranchList = unstable_cache(
  async (tenantId: string) => {
    // Simular lista de sucursales
    return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, index) => ({
      id: `branch-${index + 1}`,
      name: `Sucursal ${index + 1}`,
      address: `Dirección ${index + 1}, Ciudad`,
      routerType: ['MikroTik', 'Ubiquiti UniFi', 'Cisco Meraki'][index % 3],
      routerIp: `192.168.1.${index + 1}`,
      isOnline: Math.random() > 0.3,
      lastSeenAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      visitorsToday: Math.floor(Math.random() * 100) + 20,
      totalVisitors: Math.floor(Math.random() * 5000) + 1000,
    }));
  },
  [CACHE_KEYS.BRANCH_LIST],
  {
    revalidate: CACHE_TTL.LIST,
    tags: ['list', 'branches'],
  }
);

// Función para invalidar cache manualmente
export const invalidateCache = (key: string) => {
  cache.delete(key);
};

// Función para invalidar múltiples caches
export const invalidateMultipleCaches = (keys: string[]) => {
  keys.forEach(key => cache.delete(key));
};

// Función para invalidar todos los caches de un tenant
export const invalidateTenantCaches = (tenantId: string) => {
  const keys = [
    `${CACHE_KEYS.TENANT_STATS}:${tenantId}`,
    `${CACHE_KEYS.PORTAL_CONFIG}:${tenantId}`,
    `${CACHE_KEYS.BRANCH_LIST}:${tenantId}`,
  ];
  
  keys.forEach(key => cache.delete(key));
};
