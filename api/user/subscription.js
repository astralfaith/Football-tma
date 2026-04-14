// /api/user/subscriptions.js
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization')

  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    res.status(200).json({
      telegramId: decoded.telegramId,
      username: decoded.username,
      leagues: decoded.leagues,
      expiresAt: decoded.exp
    })

  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
