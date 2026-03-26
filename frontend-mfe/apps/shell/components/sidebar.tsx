import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/orders', label: 'Pedidos', icon: '📋' },
  { href: '/products', label: 'Produtos', icon: '📦' },
  { href: '/delivery', label: 'Entregadores', icon: '🚴' },
  { href: '/reports', label: 'Relatórios', icon: '📊' },
];

export function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-orange-600">🍔 FastMeals</h1>
        <p className="text-xs text-gray-400 mt-1">Microfrontend Shell</p>
      </div>
      <nav className="space-y-1">
        {navItems.map(item => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}