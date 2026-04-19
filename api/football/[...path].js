// /export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { path } = req.query
    const endpoint = Array.isArray(path) ? path.join('/') : path
    
    const queryParams = { ...req.query }
    delete queryParams.path
    const queryString = Object.keys(queryParams).length > 0 
      ? '?' + new URLSearchParams(queryParams).toString() 
      : ''
    
    const url = `https://v3.football.api-sports.io/${endpoint}${queryString}`

    // DEBUG LOGS
    console.log('=== FOOTBALL API REQUEST ===')
    console.log('Endpoint:', endpoint)
    console.log('Query params:', queryParams)
    console.log('Full URL:', url)
    console.log('API Key exists:', !!process.env.API_FOOTBALL_KEY)

    const response = await fetch(url, {
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    })

    console.log('API Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('API Error response:', errorText)
      throw new Error(`API Football error: ${response.status}`)
    }

    const data = await response.json()
    console.log('API Response data length:', JSON.stringify(data).length)
    console.log('Response has results:', data.results || 0)
    console.log('===========================')

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
