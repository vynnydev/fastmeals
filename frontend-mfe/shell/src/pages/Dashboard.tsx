export function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🏠 Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receita Hoje', value: 'R$ 1.250', color: 'text-orange-600' },
          { label: 'Pedidos Ativos', value: '12', color: 'text-blue-600' },
          { label: 'Entregadores', value: '6', color: 'text-green-600' },
          { label: 'Produtos', value: '15', color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📡 Microfrontends Status</h3>
        <div className="space-y-2 text-sm">
          <p>✅ Shell (Host) — porta 5000</p>
          <p>✅ Orders (Remote) — porta 5001</p>
          <p>✅ Products (Remote) — porta 5002</p>
          <p>✅ Delivery (Remote) — porta 5003</p>
          <p>✅ Reports (Remote) — porta 5004</p>
        </div>
      </div>
    </div>
  );
}