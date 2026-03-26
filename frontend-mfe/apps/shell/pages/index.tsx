import { Card } from '@fastmeals/ui';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🏠 Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-orange-600">R$ 1.250</p>
          <p className="text-sm text-gray-500 mt-1">Receita Hoje</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">12</p>
          <p className="text-sm text-gray-500 mt-1">Pedidos Ativos</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">6</p>
          <p className="text-sm text-gray-500 mt-1">Entregadores</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-purple-600">15</p>
          <p className="text-sm text-gray-500 mt-1">Produtos</p>
        </Card>
      </div>
    </div>
  );
}

export const getServerSideProps = async () => {
  return { props: {} };
};