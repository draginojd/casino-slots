import React from 'react'
import SlotMachine from './components/SlotMachine'
import { AuthProvider, AuthContext } from './auth.jsx'
import Auth from './pages/Auth'
import { useContext, useState } from 'react'

function InnerApp(){
  const { user } = useContext(AuthContext)
  const [showAuth, setShowAuth] = useState(false)
  const [shirtColor, setShirtColor] = useState('#3a3a3a')
  const [pantsColor, setPantsColor] = useState('#1f1f1f')

  return (
    <div className="app-root">
      <header className="topbar">
    <div className="logo">React Casino</div>
        <nav className="nav">
          <button className="btn ghost">Games</button>
          <button className="btn ghost">Promos</button>
          <button className="btn primary" onClick={()=> setShowAuth(s=>!s)}>{user? 'Account' : 'Sign In'}</button>
        </nav>
      </header>

      <main className="container">
    <section className="hero">
      <h1>Welcome to React Casino</h1>
      <p>Classic dark-themed fruit slot — play a quick demo.</p>
    </section>

        <section className="casino-scene">
          {/* Main game area */}
          <div className="game-area">
            <div style={{display:'flex', gap:20, alignItems: 'flex-start'}}>
              <SlotMachine />
              {showAuth && <Auth />}
            </div>
          </div>
        </section>

        {/* character UI removed */}

  <footer className="footer">� Fruit Slots • Demo slot machine</footer>
      </main>
    </div>
  )
}

export default function App(){
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}
