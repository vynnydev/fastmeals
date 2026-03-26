import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@fastmeals/ui';
import { apiClient } from '@fastmeals/shared';
import type { DeliveryPerson } from '@fastmeals/shared';

export default function DeliveryPage() {
  const [drivers, setDrivers] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/api/delivery-persons')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setDrivers(data);
      })
      .catch(err => console.error('Failed to load drivers:', err))
      .finally(() => setLoading(false));
  }, []);

  const vehicleEmoji: Record<string, string> = {
    motorcycle: '🏍️',
    bicycle: '🚲',
    car: '🚗',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">🚴 Entregadores</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🚴 Entregadores ({drivers.length})</h1>
        <Button variant="primary" size="md">+ Novo Entregador</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map(driver => (
          <Card key={driver.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  {vehicleEmoji[driver.vehicleType] || '🚗'} {driver.name}
                </p>
                <p className="text-sm text-gray-500">{driver.phone}</p>
              </div>
              <Badge variant={driver.isActive ? 'success' : 'danger'}>
                {driver.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}