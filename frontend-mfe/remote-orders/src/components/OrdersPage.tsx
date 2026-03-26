import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com';

interface Order {
  id: string;
  customerName: string;
  deliveryAddress: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-indigo-100 text-indigo-800',
  delivering: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/orders`)
      .then(res => setOrders(res.data?.data || []))
      .catch(err => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">📋 Pedidos</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📋 Pedidos ({orders.length})</h1>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
          + Novo Pedido
        </button>
      </div>
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">Nenhum pedido encontrado</div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{order.customerName}</p>
                  <p className="text-sm text-gray-500">{order.deliveryAddress}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                  </span>
                  <p className="text-lg font-bold text-orange-600 mt-1">R$ {order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}