// /api/auth/telegram.js
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

// Configurazione Google Sheets (semplificata, senza libreria esterna)
const getSheetsData = async () => {
  const spreadsheetId = process.env.SPREADSHEET_ID
  const apiKey = process.env.GOOGLE_API_KEY // Altrimenti usa service account
  
  // Metodo 1: Se usi Google Sheets API con API Key (pubblico ma limitato)
  // const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Abbonamenti!A2:P1000?key=${apiKey}`
  
  // Metodo 2: Usa un fetch a un endpoint che gestisci tu, o un JSON statico per test
  // Per semplicità, qui simulo la lettura da un JSON locale o endpoint
  
  // METODO CONSIGLIATO: Leggi da un JSON hostato su GitHub o da un endpoint Make
  const response = await fetch(process.env.SUBSCRIPTIONS_JSON_URL || 'https://api.npoint.io/tuo-endpoint')
  const data = await response.json()
  return data.users || []
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

    // LEGGI DATI ABBONAMENTI
    const users = await getSheetsData()
    
    // Trova utente per telegram_id
    const userRow = users.find(u => String(u.telegram_id) === String(userData.id))
    
    if (!userRow) {
      return res.status(403).json({ 
        error: 'Utente non trovato. Contatta l\'amministratore per attivare un abbonamento.' 
      })
    }

    // Controlla scadenza
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiryDate = new Date(userRow.data_scadenza)
    
    if (today > expiryDate) {
      return res.status(403).json({ 
        error: `Abbonamento scaduto il ${userRow.data_scadenza}. Rinnova per continuare.` 
      })
    }

    // Estrai competizioni attive (quelle con TRUE/1/VERO)
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
      if (leagueMap[key]) {
        const val = String(value).toUpperCase()
        if (val === 'TRUE' || val === '1' || val === 'VERO' || val === 'YES') {
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
      leagues: leagues, // SOLO le competizioni con TRUE
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
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
