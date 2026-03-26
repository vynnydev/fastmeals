import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com';

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  isActive: boolean;
}

const vehicleEmoji: Record<string, string> = {
  motorcycle: '🏍️',
  bicycle: '🚲',
  car: '🚗',
};

export default function DeliveryPage() {
  const [drivers, setDrivers] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/delivery-persons`)
      .then(res => setDrivers(Array.isArray(res.data) ? res.data : res.data?.data || []))
      .catch(err => console.error('Failed to load drivers:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">🚴 Entregadores</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🚴 Entregadores ({drivers.length})</h1>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
          + Novo Entregador
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map(driver => (
          <div key={driver.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  {vehicleEmoji[driver.vehicleType] || '🚗'} {driver.name}
                </p>
                <p className="text-sm text-gray-500">{driver.phone}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${driver.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {driver.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}