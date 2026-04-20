// Chiamate API al backend Vercel

const API_BASE = 'https://football-database-chi.vercel.app/api'

export const authenticateUser = async (initData) => {
  const response = await fetch(`${API_BASE}/auth/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData })
  })
  
  if (!response.ok) throw new Error('Autenticazione fallita')
  return response.json()
}

export const getUserSubscriptions = async (token) => {
  const response = await fetch(`${API_BASE}/user/subscriptions`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (!response.ok) throw new Error('Errore recupero abbonamenti')
  return response.json()
}

export const getFootballData = async (endpoint, token) => {
  // endpoint es: "standings?league=135&season=2023"
  const response = await fetch(`${API_BASE}/football/${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (!response.ok) throw new Error('Errore recupero dati')
  return response.json()
}

export const getLiveMatches = async (leagueId, token) => {
  return getFootballData(`fixtures?live=all&league=${leagueId}`, token)
}

export const getStandings = async (leagueId, season, token) => {
  return getFootballData(`standings?league=${leagueId}&season=${season}`, token)
}

export const getTopScorers = async (leagueId, season, token) => {
  return getFootballData(`players/topscorers?league=${leagueId}&season=${season}`, token)
}
