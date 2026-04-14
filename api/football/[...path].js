// /api/football/[...path].js
export default async function handler(req, res) {
  // AGGIUNGI QUESTA RIGA:
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const authHeader = req.headers.authorization
    // Verifica JWT opzionale - per ora commentata per test
    // if (!authHeader?.startsWith('Bearer ')) {
    //   return res.status(401).json({ error: 'Unauthorized' })
    // }

    const { path } = req.query
    const endpoint = Array.isArray(path) ? path.join('/') : path
    
    // Costruisci query string
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
