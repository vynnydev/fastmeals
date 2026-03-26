import React from 'react';
import ReactDOM from 'react-dom/client';
import DeliveryPage from './components/DeliveryPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="p-6"><DeliveryPage /></div>
  </React.StrictMode>,
);