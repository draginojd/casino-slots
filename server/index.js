// Load environment variables from local .env file early
try { require('dotenv').config({ path: __dirname + '/.env' }) } catch(_) {}

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const db = require('./db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {OAuth2Client} = require('google-auth-library')

const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''

const app = express()
app.use(cors())
app.use(bodyParser.json())

function generateToken(user){
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body
  if(!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const hash = await bcrypt.hash(password, 10)
  const stmt = db.prepare('INSERT INTO users (email, name, password) VALUES (?, ?, ?)')
  stmt.run(email, name || null, hash, function(err){
    if(err){
      if(err.message && err.message.includes('UNIQUE')){
        return res.status(400).json({ error: 'Email already registered' })
      }
      return res.status(500).json({ error: 'Database error' })
    }
    const user = { id: this.lastID, email, name }
    const token = generateToken(user)
    res.json({ ok: true, user, token })
  })
})

app.post('/api/login', (req, res) => {
  const { email, password } = req.body
  if(!email || !password) return res.status(400).json({ error: 'Email and password required' })

  db.get('SELECT id, email, name, password FROM users WHERE email = ?', [email], async (err, row) => {
    if(err) return res.status(500).json({ error: 'Database error' })
    if(!row) return res.status(400).json({ error: 'Invalid credentials' })

    const match = await bcrypt.compare(password, row.password)
    if(!match) return res.status(400).json({ error: 'Invalid credentials' })

    const user = { id: row.id, email: row.email, name: row.name }
    const token = generateToken(user)
    res.json({ ok: true, user, token })
  })
})

app.post('/api/auth/google', async (req, res) => {
  const { id_token } = req.body
  if(!id_token) return res.status(400).json({ error: 'id_token required' })
  if(!GOOGLE_CLIENT_ID) return res.status(500).json({ error: 'Google client ID not configured on server' })

  try{
    const client = new OAuth2Client(GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    const email = payload.email
    const name = payload.name

    // find or create user
    db.get('SELECT id, email, name FROM users WHERE email = ?', [email], (err, row) => {
      if(err) return res.status(500).json({ error: 'Database error' })
      if(row){
        const user = { id: row.id, email: row.email, name: row.name }
        const token = generateToken(user)
        return res.json({ ok: true, user, token })
      }

      const stmt = db.prepare('INSERT INTO users (email, name, password) VALUES (?, ?, ?)')
      // set password empty for OAuth users
      stmt.run(email, name || null, '', function(err){
        if(err) return res.status(500).json({ error: 'Database error' })
        const user = { id: this.lastID, email, name }
        const token = generateToken(user)
        res.json({ ok: true, user, token })
      })
    })
  } catch(e){
    return res.status(401).json({ error: 'Invalid Google token' })
  }
})

// Authorization code exchange (server-side flow)
app.post('/api/auth/google/code', async (req, res) => {
  const { code, redirect_uri } = req.body
  if(!code) return res.status(400).json({ error: 'code required' })
  if(!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return res.status(500).json({ error: 'Google client credentials not configured' })

  try{
    const axios = require('axios')
    const params = new URLSearchParams()
    params.append('code', code)
    params.append('client_id', GOOGLE_CLIENT_ID)
    params.append('client_secret', GOOGLE_CLIENT_SECRET)
    params.append('redirect_uri', redirect_uri)
    params.append('grant_type', 'authorization_code')

    const r = await axios.post('https://oauth2.googleapis.com/token', params.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    const id_token = r.data.id_token
    if(!id_token) return res.status(400).json({ error: 'No id_token returned' })

    // reuse existing verification flow
    const {OAuth2Client} = require('google-auth-library')
    const client = new OAuth2Client(GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    const email = payload.email
    const name = payload.name

    db.get('SELECT id, email, name FROM users WHERE email = ?', [email], (err, row) => {
      if(err) return res.status(500).json({ error: 'Database error' })
      if(row){
        const user = { id: row.id, email: row.email, name: row.name }
        const token = generateToken(user)
        return res.json({ ok: true, user, token })
      }
      const stmt = db.prepare('INSERT INTO users (email, name, password) VALUES (?, ?, ?)')
      stmt.run(email, name || null, '', function(err){
        if(err) return res.status(500).json({ error: 'Database error' })
        const user = { id: this.lastID, email, name }
        const token = generateToken(user)
        res.json({ ok: true, user, token })
      })
    })
  } catch(e){
    return res.status(500).json({ error: 'Token exchange failed', detail: e.message })
  }
})

app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization
  if(!auth) return res.status(401).json({ error: 'Unauthorized' })
  const parts = auth.split(' ')
  if(parts.length !== 2) return res.status(401).json({ error: 'Unauthorized' })
  const token = parts[1]
  try{
    const data = jwt.verify(token, JWT_SECRET)
    db.get('SELECT id, email, name, created_at FROM users WHERE id = ?', [data.id], (err, row) => {
      if(err) return res.status(500).json({ error: 'Database error' })
      if(!row) return res.status(404).json({ error: 'User not found' })
      res.json({ ok: true, user: row })
    })
  } catch(e){
    return res.status(401).json({ error: 'Invalid token' })
  }
})

app.listen(PORT, () => console.log(`Auth server listening on http://localhost:${PORT}`))
