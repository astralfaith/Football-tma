// /api/football/[...path].js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Verifica JWT opzionale (puoi abilitarla per sicurezza extra)
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      // Per ora lasciamo aperta, ma puoi bloccare qui
      // return res.status(401).json({ error: 'Unauthorized' })
    }

    // Costruisci URL Api-Football
    const { path } = req.query
    const endpoint = Array.isArray(path) ? path.join('/') : path
    const queryString = new URLSearchParams(req.query).toString()
    const url = `https://v3.football.api-sports.io/${endpoint}${queryString ? '?' + queryString : ''}`

    // Chiama Api-Football (SERVER SIDE - niente CORS!)
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

    // Cache per 5 minuti (riduce chiamate API)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    res.status(200).json(data)

  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch data',
      message: error.message 
    })
  }
}
