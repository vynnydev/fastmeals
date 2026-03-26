import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';

const OrdersPage = React.lazy(() => import('remoteOrders/OrdersPage'));
const ProductsPage = React.lazy(() => import('remoteProducts/ProductsPage'));
const DeliveryPage = React.lazy(() => import('remoteDelivery/DeliveryPage'));
const ReportsPage = React.lazy(() => import('remoteReports/ReportsPage'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      <span className="ml-3 text-gray-500">Carregando módulo...</span>
    </div>
  );
}

class RemoteErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { name: string; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-20">
          <p className="text-red-500 text-lg">Falha ao carregar: {this.props.name}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={
            <RemoteErrorBoundary name="Orders">
              <Suspense fallback={<LoadingFallback />}><OrdersPage /></Suspense>
            </RemoteErrorBoundary>
          } />
          <Route path="/products" element={
            <RemoteErrorBoundary name="Products">
              <Suspense fallback={<LoadingFallback />}><ProductsPage /></Suspense>
            </RemoteErrorBoundary>
          } />
          <Route path="/delivery" element={
            <RemoteErrorBoundary name="Delivery">
              <Suspense fallback={<LoadingFallback />}><DeliveryPage /></Suspense>
            </RemoteErrorBoundary>
          } />
          <Route path="/reports" element={
            <RemoteErrorBoundary name="Reports">
              <Suspense fallback={<LoadingFallback />}><ReportsPage /></Suspense>
            </RemoteErrorBoundary>
          } />
        </Routes>
      </main>
    </div>
  );
}