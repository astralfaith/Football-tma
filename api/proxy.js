export default async function handler(request, response) {
  // Abilita CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { endpoint } = request.query;
  
  if (!endpoint) {
    return response.status(400).json({ error: 'Missing endpoint parameter' });
  }

  const API_KEY = 'e87c9bf2a8d74557b85159bb408a57c5';
  const API_BASE = 'https://api.football-data.org/v4';

  try {
    const apiResponse = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'X-Auth-Token': API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!apiResponse.ok) {
      throw new Error(`API Error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    return response.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return response.status(500).json({ 
      error: error.message,
      fallback: true 
    });
  }
}
