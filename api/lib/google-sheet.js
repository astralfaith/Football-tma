// api/lib/google-sheets.js
import { google } from 'googleapis'

const getSheetsClient = () => {
  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS)
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  })
  
  return google.sheets({ version: 'v4', auth })
}

export const getUserSubscriptions = async (telegramId) => {
  const sheets = getSheetsClient()
  const spreadsheetId = process.env.SPREADSHEET_ID
  
  // Leggi tutti i dati dal foglio "Abbonamenti"
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Abbonamenti!A2:P1000', // Dati utenti (esclude header)
  })
  
  const rows = response.data.values
  if (!rows || rows.length === 0) {
    return null
  }
  
  // Trova l'utente per telegram_id
  const userRow = rows.find(row => row[0] === String(telegramId))
  
  if (!userRow) {
    return null // Utente non trovato
  }
  
  // Controlla se abbonamento scaduto
  const today = new Date()
  const expiryDate = new Date(userRow[4]) // Colonna E: data_scadenza
  
  if (today > expiryDate) {
    return { expired: true, expiryDate: userRow[4] }
  }
  
  // Mappa competizioni (colonne G-O, indici 6-14)
  const leagues = []
  const leagueColumns = {
    6: 'serie_a',
    7: 'champions_league',
    8: 'europa_league',
    9: 'premier_league',
    10: 'la_liga',
    11: 'bundesliga',
    12: 'ligue_1',
    13: 'world_cup',
    14: 'euro'
  }
  
  for (let colIndex = 6; colIndex <= 14; colIndex++) {
    const value = userRow[colIndex]?.toString().toUpperCase()
    if (value === 'TRUE' || value === 'VERO' || value === '1') {
      leagues.push(leagueColumns[colIndex])
    }
  }
  
  return {
    telegramId: userRow[0],
    username: userRow[1],
    displayName: userRow[2],
    startDate: userRow[3],
    expiryDate: userRow[4],
    status: userRow[5],
    leagues: leagues,
    expired: false
  }
}
