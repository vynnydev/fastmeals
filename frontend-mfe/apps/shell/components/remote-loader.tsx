'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

interface RemoteLoaderProps {
  remote: string;
  module: string;
  fallback?: React.ReactNode;
}

const defaultFallback = (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
    <span className="ml-3 text-gray-500">Carregando módulo...</span>
  </div>
);

export function RemoteLoader({ remote, module, fallback = defaultFallback }: RemoteLoaderProps) {
  const Component = dynamic(
    () => import(`${remote}/${module}`).catch(() => {
      return () => (
        <div className="text-center py-20">
          <p className="text-red-500 text-lg">❌ Falha ao carregar módulo</p>
          <p className="text-gray-400 text-sm mt-2">{remote}/{module}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            Tentar novamente
          </button>
        </div>
      );
    }),
    { ssr: false, loading: () => <>{fallback}</> }
  );

  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
}