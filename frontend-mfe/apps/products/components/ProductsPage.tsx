import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@fastmeals/ui';
import { apiClient } from '@fastmeals/shared';
import type { Product } from '@fastmeals/shared';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/api/products')
      .then(res => setProducts(res.data?.data || []))
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }, []);

  const categoryLabels: Record<string, string> = {
    meal: '🍔 Refeição',
    drink: '🥤 Bebida',
    dessert: '🍰 Sobremesa',
    side: '🍟 Acompanhamento',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">📦 Produtos</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📦 Produtos ({products.length})</h1>
        <Button variant="primary" size="md">+ Novo Produto</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <Badge variant={product.isAvailable ? 'success' : 'danger'}>
                  {product.isAvailable ? 'Disponível' : 'Indisponível'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{categoryLabels[product.category]}</p>
              <p className="text-lg font-bold text-brand-600">R$ {product.price.toFixed(2)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}