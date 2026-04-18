import { useState, useEffect } from 'react'
import { getStandings, getLiveMatches, getTopScorers } from '../utils/api'

export const useFootballData = (leagueId, token) => {
  const [data, setData] = useState({
    standings: null,
    live: null,
    topScorers: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!leagueId || !token) return

    const fetchData = async () => {
      setData(prev => ({ ...prev, loading: true, error: null }))
      
      try {
        const season = 2025 // da cambiare ogni anno

        
        const [standingsRes, liveRes, scorersRes] = await Promise.all([
          getStandings(leagueId, season, token).catch(() => null),
          getLiveMatches(leagueId, token).catch(() => null),
          getTopScorers(leagueId, season, token).catch(() => null)
        ])

        setData({
          standings: standingsRes?.response?.[0]?.league?.standings?.[0] || [],
          live: liveRes?.response || [],
          topScorers: scorersRes?.response || [],
          loading: false,
          error: null
        })
      } catch (error) {
        setData(prev => ({ ...prev, loading: false, error: error.message }))
      }
    }

    fetchData()
    
    // Aggiorna live ogni 60 secondi
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [leagueId, token])

  return data
}
