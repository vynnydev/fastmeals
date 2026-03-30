import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const ReportsPage = React.lazy(() => import('./pages/ReportsPage'))

function DevApp() {
  return (
    <div className="dark min-h-screen bg-background text-foreground p-6">
      <React.Suspense fallback={<div className="text-muted-foreground">Carregando...</div>}>
        <ReportsPage />
      </React.Suspense>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><DevApp /></React.StrictMode>
)