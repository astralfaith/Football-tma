export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { path } = req.query
    const endpoint = Array.isArray(path) ? path.join('/') : path
    
    // MOCK DATI PER TEST - rimuovi dopo
    if (endpoint.includes('standings')) {
      return res.status(200).json({
        response: [{
          league: {
            standings: [[
              { rank: 1, team: { name: 'Inter', logo: '' }, points: 80, all: { played: 30, win: 25, draw: 5, lose: 0 } },
              { rank: 2, team: { name: 'Milan', logo: '' }, points: 70, all: { played: 30, win: 20, draw: 10, lose: 0 } },
              { rank: 3, team: { name: 'Juventus', logo: '' }, points: 65, all: { played: 30, win: 18, draw: 11, lose: 1 } }
            ]]
          }
        }]
      })
    }

    if (endpoint.includes('fixtures') && endpoint.includes('live')) {
      return res.status(200).json({
        response: [
          { fixture: { id: 1, status: { short: 'LIVE' } }, teams: { home: { name: 'Inter' }, away: { name: 'Milan' } }, goals: { home: 2, away: 1 } }
        ]
      })
    }

    if (endpoint.includes('topscorers')) {
      return res.status(200).json({
        response: [
          { player: { name: 'Lautaro' }, statistics: [{ team: { name: 'Inter' }, goals: { total: 20 }, games: { appearences: 25 } }] }
        ]
      })
    }
    // FINE MOCK

    const queryParams = { ...req.query }
    delete queryParams.path
    const queryString = Object.keys(queryParams).length > 0 
      ? '?' + new URLSearchParams(queryParams).toString() 
      : ''
    
    const url = `https://v3.football.api-sports.io/${endpoint}${queryString}`

    const response = await fetch(url, {
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    })

    if (!response.ok) {
      throw new Error(`API Football error: ${response.status}`)
    }

    const data = await response.json()
    res.status(200).json(data)

  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch data',
      message: error.message 
    })
  }
}
