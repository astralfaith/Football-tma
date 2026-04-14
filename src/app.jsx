import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { initTelegram, getTelegramUser } from './utils/telegram'
import { useAuth } from './hooks/useAuth'
import StatsDashboard from './components/StatsDashboard'
import LeagueSelector from './components/LeagueSelector'

function App() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [telegramReady, setTelegramReady] = useState(false)

  useEffect(() => {
    // Inizializza Telegram WebApp
    initTelegram()
    setTelegramReady(true)
    
    // Espandi a schermo intero
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand()
    }
  }, [])

  if (isLoading || !telegramReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Accesso Negato</h1>
          <p className="text-gray-400 mb-4">
            Devi accedere tramite il canale Telegram abbonati per utilizzare questa app.
          </p>
          <p className="text-sm text-gray-500">
            Utente: {getTelegramUser()?.username || 'Non rilevato'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 pb-20">
        <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-400">⚽ Football Stats Pro</h1>
            <div className="text-sm text-gray-400">
              @{user?.username}
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<LeagueSelector user={user} />} />
            <Route path="/league/:leagueId" element={<StatsDashboard user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
