import React, {useState, useEffect, useRef} from 'react'

const ICONS = ['🍒','🍋','🔔','⭐','7️⃣']

export default function SlotMachine(){
  const [reels, setReels] = useState([0,0,0])
  const [spinning, setSpinning] = useState(false)
  const [balance, setBalance] = useState(1000)
  const [bet, setBet] = useState(10)
  const timeoutRef = useRef(null)

  useEffect(()=> () => clearTimeout(timeoutRef.current), [])

  function spin(){
    if(spinning) return
    if(bet <= 0 || bet > balance) return
    setSpinning(true)
    setBalance(b => b - bet)

    const duration = 1500
    const start = Date.now()

    function frame(){
      const t = Date.now() - start
      if(t < duration){
        setReels(r => r.map(()=> Math.floor(Math.random()*ICONS.length)))
        timeoutRef.current = setTimeout(frame, 80)
      } else {
        const result = [random(), random(), random()]
        setReels(result)
        setSpinning(false)
        const payout = evaluate(result)
        if(payout > 0){
          setBalance(b => b + payout)
        }
      }
    }

    frame()
  }

  function random(){
    return Math.floor(Math.random()*ICONS.length)
  }

  function evaluate(r){
    // simple rules: three of a kind = bet * multiplier
    if(r[0] === r[1] && r[1] === r[2]){
      const idx = r[0]
      const mult = idx === 4 ? 50 : idx === 3 ? 20 : idx === 2 ? 10 : 5
      return bet * mult
    }
    if(r[0] === r[1] || r[1] === r[2] || r[0] === r[2]){
      return bet * 2
    }
    return 0
  }

    return (
    <div className={`slot-root simple`}>
      <div className="slot-frame">
        <div className="balance">Balance: ${balance}</div>

        <div className="machine">
            {reels.map((i, idx)=> (
            <div key={idx} className={`reel ${spinning? 'spin':''}`}>
              <div className="symbol">{ICONS[i]}</div>
            </div>
          ))}
        </div>

        <div className="controls">
          <div className="bet-controls">
            <button className="btn ghost" onClick={()=> setBet(b => Math.max(1, b - 5))} disabled={spinning}>-</button>
            <input className="bet-input" type="number" value={bet} onChange={e=> setBet(Number(e.target.value))} min={1} max={balance} disabled={spinning} />
            <button className="btn ghost" onClick={()=> setBet(b => Math.min(balance, b + 5))} disabled={spinning}>+</button>
          </div>

          <div className="actions">
            <button className="btn primary" onClick={spin} disabled={spinning || bet > balance}>SPIN</button>
            <button className="btn" onClick={()=> setBalance(1000)} disabled={spinning}>Reset</button>
          </div>
        </div>

        <div className="legend">
          <small>Three matching symbols pay out big. This is a demo — play responsibly.</small>
        </div>
      </div>

      <div className="chips-left">
        <div className="chip big"></div>
        <div className="chip small"></div>
      </div>
      <div className="chips-right">
        <div className="chip small"></div>
        <div className="chip big"></div>
      </div>
    </div>
  )
}

