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
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        const season = currentMonth >= 7 ? currentYear : currentYear - 1
        
        const [standingsRes, liveRes, scorersRes] = await Promise.all([
          getStandings(leagueId, season, token).catch(err => {
            console.error('Standings error:', err)
            return null
          }),
          getLiveMatches(leagueId, token).catch(err => {
            console.error('Live error:', err)
            return null
          }),
          getTopScorers(leagueId, season, token).catch(err => {
            console.error('Scorers error:', err)
            return null
          })
        ])

        // Estrazione dati con multiple fallback
        let standings = []
        if (standingsRes?.response?.[0]?.league?.standings?.[0]) {
          standings = standingsRes.response[0].league.standings[0]
        } else if (standingsRes?.response?.[0]?.standings) {
          standings = standingsRes.response[0].standings
        } else if (Array.isArray(standingsRes?.response)) {
          standings = standingsRes.response
        } else if (standingsRes?.standings) {
          standings = standingsRes.standings
        }

        let live = []
        if (liveRes?.response) {
          live = Array.isArray(liveRes.response) ? liveRes.response : []
        } else if (Array.isArray(liveRes)) {
          live = liveRes
        }

        let topScorers = []
        if (scorersRes?.response) {
          topScorers = Array.isArray(scorersRes.response) ? scorersRes.response : []
        } else if (Array.isArray(scorersRes)) {
          topScorers = scorersRes
        }

        setData({
          standings,
          live,
          topScorers,
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('Fetch error:', error)
        setData(prev => ({ ...prev, loading: false, error: error.message }))
      }
    }

    fetchData()
    
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [leagueId, token])

  return data
}
