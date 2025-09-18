import React from 'react'

export default function GoogleSignIn({ onSuccess, onError }){
  React.useEffect(()=>{
    if(window.google && document.getElementById('g_id_signin')) return
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => {
      // render the button into placeholder
      window.google.accounts.id.renderButton(
        document.getElementById('g_id_signin'),
        { theme: 'outline', size: 'large' }
      )
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: (resp) => {
          if(resp.credential) onSuccess(resp.credential)
          else onError(new Error('No credential'))
        }
      })
    }
    document.head.appendChild(s)
  }, [])

  return <div id="g_id_signin" style={{marginTop:12}} />
}
