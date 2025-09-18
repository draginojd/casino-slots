import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import OAuthCallback from './pages/OAuthCallback'
import './styles.css'

const root = createRoot(document.getElementById('root'))
if(window.location.pathname === '/oauth-callback'){
  root.render(<React.StrictMode><OAuthCallback/></React.StrictMode>)
} else {
  root.render(<React.StrictMode><App/></React.StrictMode>)
}
