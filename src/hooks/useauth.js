import { useState, useEffect } from 'react'
import { getTelegramInitData, getTelegramUser } from '../utils/telegram'
import { authenticateUser, getUserSubscriptions } from '../utils/api'
import { jwtDecode } from 'jwt-decode'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [subscriptions, setSubscriptions] = useState([])

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Controlla se c'è già un token valido
        const existingToken = localStorage.getItem('football_stats_token')
        
        if (existingToken) {
          try {
            const decoded = jwtDecode(existingToken)
            // Controlla scadenza
            if (decoded.exp * 1000 > Date.now()) {
              setUser(decoded)
              setSubscriptions(decoded.leagues || [])
              setIsAuthenticated(true)
              setIsLoading(false)
              return
            }
          } catch (e) {
            localStorage.removeItem('football_stats_token')
          }
        }

        // Nuova autenticazione da Telegram
        const initData = getTelegramInitData()
        if (!initData) {
          setIsLoading(false)
          return
        }

        const { token } = await authenticateUser(initData)
        localStorage.setItem('football_stats_token', token)
        
        const decoded = jwtDecode(token)
        setUser(decoded)
        setSubscriptions(decoded.leagues || [])
        setIsAuthenticated(true)
        
      } catch (error) {
        console.error('Auth error:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const logout = () => {
    localStorage.removeItem('football_stats_token')
    setIsAuthenticated(false)
    setUser(null)
    setSubscriptions([])
  }

  return { isAuthenticated, isLoading, user, subscriptions, logout }
}
