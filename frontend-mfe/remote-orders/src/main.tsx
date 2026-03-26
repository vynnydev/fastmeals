import React from 'react';
import ReactDOM from 'react-dom/client';
import OrdersPage from './components/OrdersPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="p-6">
      <OrdersPage />
    </div>
  </React.StrictMode>,
);