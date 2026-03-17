'use client';

import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ 
  size = 'default',
  text = 'Cargando...' 
}: { 
  size?: 'sm' | 'default' | 'lg';
  text?: string; 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-2">
      <Loader2 className={`animate-spin text-blue-500 ${sizeClasses[size]}`} />
      <span className="text-sm text-zinc-400">{text}</span>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto">
          <Loader2 className="w-full h-full animate-spin text-blue-500" />
        </div>
        <h1 className="text-xl font-semibold text-white">HotSpot SaaS</h1>
        <p className="text-zinc-400">Cargando sistema...</p>
      </div>
    </div>
  );
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-12 bg-zinc-800 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
