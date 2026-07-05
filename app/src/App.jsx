import { useState, useEffect, useRef, useCallback } from 'react'
import './index.css'

const STORAGE_KEY = 'jieshen_v1'

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}
function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) }

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function calcStreak(checked) {
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = daysAgo(i)
    if (checked && checked[d]) streak++; else break
  }
  return streak
}

const QUOTES = [
  '清净不是压抑，是选择。','每一次克制，都是力量的体现。',
  '你比你想象的更自由。','欲望如浪，观其起落，终会平息。',
  '今日的坚持，是明日的底气。','戒不是禁锢，是醒觉。',
  '守住心念，守住人生。','一念清净，烦恼自息。',
]
const randomQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)]

function fmt(secs) {
  return `${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`
}

// ── Lock Screen ──────────────────────────────────────────────────────
function LockScreen({ data, onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleKey = (k) => {
    const next = pin + k
    setPin(next)
    setError(false)
    if (next.length === 4) {
      if (next === data.pin) onUnlock()
      else { setError(true); setPin('') }
    }
  }
  const handleBack = () => setPin('')

  return (
    <div className="lock-screen">
      <div className="lock-title">请输入 PIN</div>
      <div className="lock-dots">
        {[0,1,2,3].map(i => <div key={i} className={`lock-dot ${pin.length>i?'filled':''}`} />)}
      </div>
      {error && <div className="lock-error">密码错误</div>}
      <div className="pin-keypad">
        {[[1,2,3],[4,5,6],[7,8,9],[' ','0','⌫']].map((row, ri) =>
          row.map((k, ki) => {
            if (k === ' ') return <div key={`${ri}-${ki}`} className="pin-key empty" />
            return <div key={`${ri}-${ki}`} className="pin-key" onClick={() => k==='⌫' ? handleBack() : handleKey(String(k))}>{k}</div>
          })
        )}
      </div>
    </div>
  )
}

// ── PIN Setup ────────────────────────────────────────────────────────
function PinSetup({ onDone, onCancel }) {
  const [step, setStep] = useState(0)
  const [pin, setPin] = useState('')
  const [msg, setMsg] = useState('')

  const handleKey = (k) => {
    const next = pin + k
    setPin(next); setMsg('')
    if (next.length === 4) {
      if (step === 0) { setStep(1); setPin('') }
      else { onDone(next) }
    }
  }
  const handleBack = () => setPin('')

  return (
    <div className="lock-screen">
      <div className="lock-title">{step===0?'设置 PIN':'确认 PIN'}</div>
      <div className="lock-dots">
        {[0,1,2,3].map(i => <div key={i} className={`lock-dot ${pin.length>i?'filled':''}`} />)}
      </div>
      {msg && <div className="lock-error">{msg}</div>}
      <div className="pin-keypad">
        {[[1,2,3],[4,5,6],[7,8,9],[' ','0','⌫']].map((row, ri) =>
          row.map((k, ki) => {
            if (k === ' ') return <div key={`${ri}-${ki}`} className="pin-key empty" />
            return <div key={`${ri}-${ki}`} className="pin-key" onClick={() => k==='⌫' ? handleBack() : handleKey(String(k))}>{k}</div>
          })
        )}
      </div>
      <button className="lock-cancel" onClick={onCancel}>取消</button>
    </div>
  )
}

// ── Oath Modal ───────────────────────────────────────────────────────
function OathModal({ onConfirm }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">今日誓言</div>
        <div className="modal-body">
          此刻，我选择清净。<br />我为自己的身心负责。<br />我相信自己能守住这一日。
        </div>
        <button className="modal-btn" onClick={onConfirm}>确认誓言</button>
      </div>
    </div>
  )
}

// ── Home Page ────────────────────────────────────────────────────────
function HomePage({ data, todayChecked, onCheckin, showQuote }) {
  const streak = calcStreak(data.checked || {})
  const streakUnit = streak >= 30 ? '月' : streak >= 7 ? '周' : '天'
  const streakDisplay = streak >= 30 ? Math.floor(streak/30) : streak >= 7 ? Math.floor(streak/7) : streak

  return (
    <div className="page active">
      <div className="streak-display">
        <div className="streak-number">{streakDisplay}</div>
        <div className="streak-unit">{streakUnit}</div>
        <div className="streak-label">连续清净</div>
      </div>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-val">{data.urgeCount || 0}</div>
          <div className="stat-lbl">冲动次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{data.checked ? Object.keys(data.checked).length : 0}</div>
          <div className="stat-lbl">总打卡天数</div>
        </div>
      </div>
      <div className="oath-section">
        <div className="oath-text">今日我选择清净<br />为自己负责 · 守住心念</div>
        <button className={`checkin-btn ${todayChecked ? 'checked' : ''}`} onClick={todayChecked ? null : onCheckin}>
          {todayChecked ? '✓ 今日已打卡' : '打卡'}
        </button>
      </div>
      {showQuote && <div className="quote">{randomQuote()}</div>}
    </div>
  )
}

// ── Timer Page ───────────────────────────────────────────────────────
function TimerPage({ data, save }) {
  const [preset, setPreset] = useState(15)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(15 * 60)
  const [done, setDone] = useState(false)
  const [phase, setPhase] = useState('hold')
  const intervalRef = useRef(null)
  const totalRef = useRef(15 * 60)
  const startTimeRef = useRef(null)

  const start = () => {
    const total = preset * 60
    totalRef.current = total
    startTimeRef.current = Date.now()
    setRunning(true); setDone(false)
    setRemaining(total)
    setPhase('inhale')
    save(d => ({ ...d, urgeCount: (d.urgeCount||0) + 1 }))
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const newRem = Math.max(0, totalRef.current - elapsed)
      setRemaining(newRem)
      const cyclePos = elapsed % 12
      if (cyclePos < 4) setPhase('inhale')
      else if (cyclePos < 7) setPhase('hold')
      else setPhase('exhale')
      if (newRem <= 0) {
        clearInterval(intervalRef.current)
        setRunning(false); setDone(true); setPhase('done')
      }
    }, 200)
  }

  const cancel = () => {
    clearInterval(intervalRef.current)
    setRunning(false); setRemaining(preset*60); setPhase('hold')
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  if (done) return (
    <div className="page active">
      <div className="timer-page">
        <div className="timer-done"><h3>你度过了这次冲动</h3><p>欲望如浪，观其起落。<br />你选择了不被裹挟。</p></div>
        <div className="timer-controls"><button className="timer-btn" onClick={() => { setDone(false); setPhase('hold'); setRemaining(preset*60) }}>再来一次</button></div>
        <div className="quote" style={{marginTop:40}}>{randomQuote()}</div>
      </div>
    </div>
  )

  if (!running) return (
    <div className="page active">
      <div className="timer-page">
        <div className="timer-label">URGE SURFING</div>
        <div className="timer-presets">
          {[5,10,15,20,30].map(m => <button key={m} className={`preset-btn ${preset===m?'active':''}`} onClick={() => { setPreset(m); setRemaining(m*60) }}>{m}min</button>)}
        </div>
        <div className="breath-circle">
          <div className="timer-display">{fmt(remaining)}</div>
          <div className="timer-phase">就绪</div>
        </div>
        <div className="timer-controls"><button className="timer-btn" onClick={start}>开始</button></div>
      </div>
    </div>
  )

  return (
    <div className="page active">
      <div className="timer-page">
        <div className={`breath-circle ${phase}`}>
          <div className="timer-display">{fmt(remaining)}</div>
          <div className="timer-phase">{phase==='inhale'?'吸气':phase==='hold'?'屏息':'呼气'}</div>
        </div>
        <div className="timer-controls"><button className="timer-btn cancel" onClick={cancel}>取消</button></div>
      </div>
    </div>
  )
}

// ── Calendar Page ────────────────────────────────────────────────────
function CalendarPage({ data }) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const checked = data.checked || {}
  const today = todayStr()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const cells = []
  for (let i=0; i<firstDay; i++) cells.push(null)
  for (let d=1; d<=daysInMonth; d++) cells.push(d)

  const prev = () => month===0 ? (setYear(y=>y-1), setMonth(11)) : setMonth(m=>m-1)
  const next = () => month===11 ? (setYear(y=>y+1), setMonth(0)) : setMonth(m=>m+1)

  return (
    <div className="page active">
      <div className="calendar-header">
        <button className="cal-nav-btn" onClick={prev}>‹</button>
        <div className="cal-month">{year}年 {month+1}月</div>
        <button className="cal-nav-btn" onClick={next}>›</button>
      </div>
      <div className="calendar-grid">
        {['日','一','二','三','四','五','六'].map(d => <div key={d} className="cal-day-name">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="cal-day empty" />
          const dayStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const isChecked = !!checked[dayStr]
          const isToday = dayStr === today
          const isFuture = dayStr > today
          const cls = ['cal-day', isChecked?'checked':'', isToday&&!isChecked?'today':'', isFuture?'future':'', !isChecked&&!isToday&&!isFuture?'unchecked':''].filter(Boolean).join(' ')
          return <div key={day} className={cls}>{day}</div>
        })}
      </div>
    </div>
  )
}

// ── Settings Page ────────────────────────────────────────────────────
function SettingsPage({ data, save, pinSet, setPinSet, setLocked }) {
  const [showSetup, setShowSetup] = useState(false)
  const handlePinToggle = () => {
    if (data.pin) {
      const { pin, ...rest } = data
      save(rest); setPinSet(false); setLocked(false)
    } else { setShowSetup(true) }
  }
  const handlePinDone = (newPin) => {
    save(d => ({ ...d, pin: newPin }))
    setPinSet(true); setShowSetup(false)
  }
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `jieshen_backup_${todayStr()}.json`; a.click()
    URL.revokeObjectURL(url)
  }
  const handleClear = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      localStorage.removeItem(STORAGE_KEY)
      window.location.reload()
    }
  }

  if (showSetup) return <PinSetup onDone={handlePinDone} onCancel={() => setShowSetup(false)} />

  return (
    <div className="page active">
      <ul className="settings-list">
        <li className="settings-item">
          <div><div className="settings-label">PIN 密码锁</div><div className="settings-desc">启用后每次打开需输入 PIN</div></div>
          <button className={`toggle ${data.pin?'on':''}`} onClick={handlePinToggle} />
        </li>
        <li className="settings-item">
          <div><div className="settings-label">导出数据</div><div className="settings-desc">下载 JSON 格式备份</div></div>
          <button className="settings-export-btn" onClick={handleExport}>导出</button>
        </li>
      </ul>
      <div className="settings-danger">
        <button className="settings-danger-btn" onClick={handleClear}>清除所有数据</button>
      </div>
      <div className="quote" style={{marginTop:40}}>你的数据只存在本地设备。<br />我们无法恢复已删除的数据。</div>
    </div>
  )
}

// ── Tab Bar ──────────────────────────────────────────────────────────
function TabBar({ tab, setTab }) {
  return (
    <nav className="tab-bar">
      {[{id:'home',icon:'首'},{id:'timer',icon:'息'},{id:'calendar',icon:'历'},{id:'settings',icon:'设'}].map(t => (
        <button key={t.id} className={`tab-btn ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>{t.icon}</button>
      ))}
    </nav>
  )
}

// ── App ──────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(loadData)
  const [tab, setTab] = useState('home')
  const [showOath, setShowOath] = useState(false)
  const [showQuote, setShowQuote] = useState(false)
  const [todayChecked, setTodayChecked] = useState(false)
  const [locked, setLocked] = useState(() => !!loadData().pin)
  const [pinSet, setPinSet] = useState(() => !!loadData().pin)

  const dataRef = useRef(data)
  dataRef.current = data

  const save = useCallback((upd) => {
    const next = typeof upd === 'function' ? upd(dataRef.current) : { ...dataRef.current, ...upd }
    setData(next); saveData(next)
  }, [])

  useEffect(() => {
    const lastVisit = data.lastVisit
    const today = todayStr()
    setTodayChecked(!!(data.checked && data.checked[today]))
    if (lastVisit !== today) {
      setShowOath(true)
      save(d => ({ ...d, lastVisit: today }))
    }
  }, [])

  const handleCheckin = () => {
    const today = todayStr()
    save(d => ({ ...d, checked: { ...(d.checked||{}), [today]: true } }))
    setTodayChecked(true)
    setShowQuote(true)
    setTimeout(() => setShowQuote(false), 4000)
  }

  if (pinSet && locked) return <LockScreen data={data} onUnlock={() => setLocked(false)} />

  const renderPage = () => {
    switch (tab) {
      case 'home': return <HomePage data={data} todayChecked={todayChecked} onCheckin={handleCheckin} showQuote={showQuote} />
      case 'timer': return <TimerPage data={data} save={save} />
      case 'calendar': return <CalendarPage data={data} />
      case 'settings': return <SettingsPage data={data} save={save} pinSet={pinSet} setPinSet={setPinSet} setLocked={setLocked} />
      default: return <HomePage data={data} todayChecked={todayChecked} onCheckin={handleCheckin} showQuote={showQuote} />
    }
  }

  return (
    <>
      {showOath && <OathModal onConfirm={() => setShowOath(false)} />}
      {renderPage()}
      <TabBar tab={tab} setTab={setTab} />
    </>
  )
}
