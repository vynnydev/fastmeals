export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">📊 Relatórios</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receita Total', value: 'R$ 1.250', color: 'text-orange-600' },
          { label: 'Total Pedidos', value: '48', color: 'text-blue-600' },
          { label: 'Entregues', value: '42', color: 'text-green-600' },
          { label: 'Tempo Médio', value: '28 min', color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Receita Diária</h3>
        <p className="text-gray-500 text-center py-8">Gráfico será implementado aqui</p>
      </div>
    </div>
  );
}