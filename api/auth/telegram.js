// /api/auth/telegram.js
import jwt from 'jsonwebtoken'

// Cache semplice in memoria (si resetta ogni deploy, ma va benissimo)
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minuti in millisecondi

// Funzione per ottenere dati con cache
const getCachedOrFetch = async (telegramId) => {
  const cacheKey = `user_${telegramId}`
  const now = Date.now()
  
  // Controlla se c'è in cache e non è scaduto
  const cached = cache.get(cacheKey)
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log('Cache hit per utente:', telegramId)
    return cached.data
  }
  
  // Altrimenti fetcha da Google Sheets
  console.log('Cache miss, fetch da Google Sheets per utente:', telegramId)
  const data = await getUserFromGoogleSheet(telegramId)
  
  // Salva in cache
  if (data) {
    cache.set(cacheKey, {
      data: data,
      timestamp: now
    })
  }
  
  return data
}

// Legge dati direttamente da Google Sheets API
const getUserFromGoogleSheet = async (telegramId) => {
  const apiKey = process.env.GOOGLE_API_KEY
  const spreadsheetId = process.env.SPREADSHEET_ID
  
  if (!apiKey || !spreadsheetId) {
    throw new Error('Variabili d\'ambiente mancanti: GOOGLE_API_KEY o SPREADSHEET_ID')
  }
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Abbonamenti!A2:P1000?key=${apiKey}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const errorData = await response.json()
    console.error('Errore Google Sheets:', errorData)
    throw new Error(`Google Sheets API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
  }
  
  const data = await response.json()
  const rows = data.values || []
  
  if (rows.length === 0) {
    return null
  }
  
  // Trova l'utente (colonna A = telegram_id, indice 0)
  const userRow = rows.find(row => String(row[0]).trim() === String(telegramId).trim())
  
  if (!userRow) {
    return null
  }
  
  // Mappa i dati dalle colonne
  return {
    telegram_id: userRow[0],
    username: userRow[1],
    nome_visualizzato: userRow[2],
    data_inizio: userRow[3],
    data_scadenza: userRow[4],
    stato: userRow[5],
    serie_a: userRow[6],
    champions_league: userRow[7],
    europa_league: userRow[8],
    premier_league: userRow[9],
    la_liga: userRow[10],
    bundesliga: userRow[11],
    ligue_1: userRow[12],
    world_cup: userRow[13],
    euro: userRow[14],
    note: userRow[15]
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { initData } = req.body

    if (!initData) {
      return res.status(400).json({ error: 'Missing initData' })
    }

    // Parse dati Telegram
    const params = new URLSearchParams(initData)
    const userData = JSON.parse(params.get('user') || '{}')
    
    if (!userData.id) {
      return res.status(401).json({ error: 'Invalid user data' })
    }

    // LEGGI DA GOOGLE SHEETS (con cache)
    const userRow = await getCachedOrFetch(userData.id)
    
    if (!userRow) {
      return res.status(403).json({ 
        error: 'Utente non trovato. Contatta l\'amministratore per attivare un abbonamento.' 
      })
    }

    // Controlla stato
    if (userRow.stato !== 'ATTIVO') {
      return res.status(403).json({ 
        error: 'Abbonamento non attivo.' 
      })
    }

    // Controlla scadenza
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiryDate = new Date(userRow.data_scadenza)
    
    if (isNaN(expiryDate.getTime())) {
      return res.status(403).json({ 
        error: 'Data scadenza non valida.' 
      })
    }
    
    if (today > expiryDate) {
      return res.status(403).json({ 
        error: `Abbonamento scaduto il ${userRow.data_scadenza}. Rinnova per continuare.` 
      })
    }

    // Estrai competizioni con TRUE/1/VERO/X/SI
    const leagues = []
    const leagueMap = {
      'serie_a': 'serie_a',
      'champions_league': 'champions_league',
      'europa_league': 'europa_league',
      'premier_league': 'premier_league',
      'la_liga': 'la_liga',
      'bundesliga': 'bundesliga',
      'ligue_1': 'ligue_1',
      'world_cup': 'world_cup',
      'euro': 'euro'
    }
    
    for (const [key, value] of Object.entries(userRow)) {
      if (leagueMap[key] && value) {
        const val = String(value).toUpperCase().trim()
        // Accetta: TRUE, 1, VERO, YES, X (croce), SI, SÌ
        if (['TRUE', '1', 'VERO', 'YES', 'X', 'SI', 'SÌ'].includes(val)) {
          leagues.push(key)
        }
      }
    }

    if (leagues.length === 0) {
      return res.status(403).json({ 
        error: 'Nessuna competizione attiva sul tuo abbonamento.' 
      })
    }

    // Genera JWT
    const token = jwt.sign({
      telegramId: userData.id,
      username: userData.username,
      firstName: userData.first_name,
      displayName: userRow.nome_visualizzato || userData.first_name,
      leagues: leagues,
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 giorni
    }, process.env.JWT_SECRET)

    res.status(200).json({ 
      token,
      user: {
        id: userData.id,
        username: userData.username,
        displayName: userRow.nome_visualizzato || userData.first_name,
        leagues: leagues,
        expiryDate: userRow.data_scadenza
      }
    })

  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    })
  }
}
