import React, {useState, useContext} from 'react'
import { AuthContext } from '../auth.jsx'
import GoogleSignIn from '../components/GoogleSignIn'

export default function Auth(){
  const { setToken, user, logout } = useContext(AuthContext)
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e){
    e.preventDefault()
    setError('')
    setLoading(true)
    try{
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const res = await fetch(`${API}/api/${mode}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || 'Server error')
      setToken(data.token)
    } catch(err){
      setError(err.message)
    } finally{ setLoading(false) }
  }

  async function handleGoogle(id_token){
    setError('')
    setLoading(true)
    try{
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const res = await fetch(`${API}/api/auth/google`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id_token }) })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || 'Google auth failed')
      setToken(data.token)
    } catch(err){
      setError(err.message)
    } finally { setLoading(false) }
  }

  if(user) return (
    <div className="auth-card">
      <h3>Signed in as {user.email}</h3>
      <p>Name: {user.name || '—'}</p>
      <button className="btn primary" onClick={logout}>Sign out</button>
    </div>
  )

  return (
    <div className="auth-card">
      <div className="tabs">
        <button className={`btn ${mode==='login'?'ghost':''}`} onClick={()=> setMode('login')}>Login</button>
        <button className={`btn ${mode==='register'?'ghost':''}`} onClick={()=> setMode('register')}>Register</button>
      </div>

      <form onSubmit={submit} style={{marginTop:12}}>
        {mode==='register' && (
          <input className="bet-input" placeholder="Name (optional)" value={name} onChange={e=> setName(e.target.value)} />
        )}
        <input className="bet-input" placeholder="Email" type="email" value={email} onChange={e=> setEmail(e.target.value)} required />
        <input className="bet-input" placeholder="Password" type="password" value={password} onChange={e=> setPassword(e.target.value)} required />
        {error && <div style={{color:'#ffb4b4', marginTop:8}}>{error}</div>}
        <div style={{marginTop:12}}>
          <button className="btn primary" type="submit" disabled={loading}>{loading? 'Please wait...' : (mode==='login'?'Login':'Create account')}</button>
        </div>
      </form>
      <div>
        <div style={{textAlign:'center', marginTop:10}}>Or sign in with Google</div>
        <GoogleSignIn onSuccess={handleGoogle} onError={(e)=> setError(e.message)} />
        <div style={{textAlign:'center', marginTop:8}}>
          <a className="btn" href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}&redirect_uri=${encodeURIComponent(window.location.origin + '/oauth-callback')}&response_type=code&scope=openid%20email%20profile&access_type=offline`}>Sign in with Google (consent)</a>
        </div>
      </div>
    </div>
  )
}
