import React, {useEffect, useContext} from 'react'
import { AuthContext } from '../auth.jsx'

export default function OAuthCallback(){
  const { setToken } = useContext(AuthContext)

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const redirect_uri = window.location.origin + '/oauth-callback'
    if(!code) return

    (async ()=>{
      try{
        const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        const res = await fetch(`${API}/api/auth/google/code`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ code, redirect_uri }) })
        const data = await res.json()
        if(!res.ok) throw new Error(data.error || 'Auth exchange failed')
        setToken(data.token)
        window.location.href = '/'
      } catch(e){
        console.error(e)
        window.location.href = '/?auth_error=' + encodeURIComponent(e.message)
      }
    })()
  }, [])

  return <div style={{padding:20}}>Completing sign in...</div>
}
