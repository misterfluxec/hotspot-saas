'use client';

import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function LazyComponent({ 
  fallback = <LoadingSpinner />, 
  children 
}: LazyComponentProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

// Componente lazy específico para dashboard
export const LazyDashboard = lazy(() => 
  import('../app/dashboard/page').then(mod => ({ default: mod.default }))
);

// Componente lazy para configuración
export const LazyConfig = lazy(() => 
  import('../app/dashboard/configuracion/page').then(mod => ({ default: mod.default }))
);

// Componente lazy para métricas
export const LazyMetrics = lazy(() => 
  import('../app/dashboard/metricas/page').then(mod => ({ default: mod.default }))
);

// Componente lazy para clientes
export const LazyClients = lazy(() => 
  import('../app/dashboard/clientes/page').then(mod => ({ default: mod.default }))
);

// Wrapper para lazy loading con error boundary
export function LazyWrapper({ 
  component: Component,
  fallback = <LoadingSpinner /> 
}: { 
  component: React.ComponentType<any>;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
}
