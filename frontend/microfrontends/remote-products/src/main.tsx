import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductsPage from './components/ProductsPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="p-6"><ProductsPage /></div>
  </React.StrictMode>,
);