import React from 'react';
import ReactDOM from 'react-dom/client';
import ReportsPage from './components/ReportsPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="p-6"><ReportsPage /></div>
  </React.StrictMode>,
);