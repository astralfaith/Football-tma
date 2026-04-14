// /api/auth/telegram.js
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

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

    // Verifica autenticità dati Telegram (opzionale ma consigliata)
    // Per semplicità, qui verifichiamo solo che arrivi da Telegram
    const params = new URLSearchParams(initData)
    const userData = JSON.parse(params.get('user') || '{}')
    
    if (!userData.id) {
      return res.status(401).json({ error: 'Invalid user data' })
    }

    // Qui leggiamo da Google Sheets/Airtable le subscriptions
    // Per ora simuliamo - TU DOVRAI COLLEGARE IL TUO EXCEL/GOOGLE SHEETS
    const userSubscriptions = await getUserSubscriptionsFromSheet(userData.id)

    if (!userSubscriptions) {
      return res.status(403).json({ error: 'No active subscription' })
    }

    // Genera JWT
    const token = jwt.sign({
      telegramId: userData.id,
      username: userData.username,
      firstName: userData.first_name,
      leagues: userSubscriptions.leagues, // Array di competizioni
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 giorni
    }, process.env.JWT_SECRET)

    res.status(200).json({ 
      token,
      user: {
        id: userData.id,
        username: userData.username,
        leagues: userSubscriptions.leagues
      }
    })

  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Funzione da collegare al tuo Google Sheets
async function getUserSubscriptionsFromSheet(telegramId) {
  // IMPLEMENTAZIONE GOOGLE SHEETS - vedi istruzioni sotto
  // Per test, ritorniamo tutte le leghe
  return {
    leagues: ['serie_a', 'champions_league', 'world_cup', 'premier_league', 'la_liga', 'bundesliga', 'ligue_1', 'europa_league', 'euro']
  }
}
