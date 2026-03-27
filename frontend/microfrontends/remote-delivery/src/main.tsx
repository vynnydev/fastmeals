import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const DeliveryPage = React.lazy(() => import('./pages/DeliveryPage'))

function DevApp() {
  return (
    <div className="dark min-h-screen bg-background text-foreground p-6">
      <React.Suspense fallback={<div className="text-muted-foreground">Carregando...</div>}>
        <DeliveryPage />
      </React.Suspense>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><DevApp /></React.StrictMode>
)