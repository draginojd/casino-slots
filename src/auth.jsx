import React, { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  useEffect(()=>{
    if(token){
  localStorage.setItem('token', token)
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  fetch(`${API}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r=> r.json())
        .then(data=>{
          if(data.ok) setUser(data.user)
          else { setUser(null); setToken(null); localStorage.removeItem('token') }
  }).catch(()=>{ setUser(null); setToken(null); localStorage.removeItem('token') })
    } else {
      setUser(null)
      localStorage.removeItem('token')
    }
  }, [token])

  function logout(){
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
