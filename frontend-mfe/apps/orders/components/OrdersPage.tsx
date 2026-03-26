import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@fastmeals/ui';
import { apiClient } from '@fastmeals/shared';
import type { Order } from '@fastmeals/shared';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/api/orders')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setOrders(data);
      })
      .catch(err => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
    pending: 'warning',
    preparing: 'info',
    ready: 'info',
    delivering: 'warning',
    delivered: 'success',
    cancelled: 'danger',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">📋 Pedidos</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📋 Pedidos ({orders.length})</h1>
        <Button variant="primary" size="md">+ Novo Pedido</Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">Nenhum pedido encontrado</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{order.customerName}</p>
                  <p className="text-sm text-gray-500">{order.deliveryAddress}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={statusColors[order.status] || 'default'}>
                    {order.status}
                  </Badge>
                  <p className="text-lg font-bold text-brand-600 mt-1">
                    R$ {order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}