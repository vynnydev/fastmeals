import React from 'react';
import { Card } from '@fastmeals/ui';

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">📊 Relatórios</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-brand-600">R$ 1.250</p>
          <p className="text-sm text-gray-500 mt-1">Receita Total</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">48</p>
          <p className="text-sm text-gray-500 mt-1">Total Pedidos</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">42</p>
          <p className="text-sm text-gray-500 mt-1">Entregues</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-purple-600">28 min</p>
          <p className="text-sm text-gray-500 mt-1">Tempo Médio</p>
        </Card>
      </div>

      <Card title="📈 Receita Diária">
        <p className="text-gray-500 text-center py-8">Gráfico será migrado do frontend original</p>
      </Card>
    </div>
  );
}