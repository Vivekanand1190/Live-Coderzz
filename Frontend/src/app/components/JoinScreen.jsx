import { useState, useEffect } from "react"
import { GoogleLogin } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"

export default function JoinScreen({ onJoin }) {
  const params = new URLSearchParams(window.location.search)
  const roomParam = params.get("room") || ""

  const [username, setUsername] = useState("")
  const [room, setRoom] = useState(roomParam)
  const [password, setPassword] = useState("")
  const [tab, setTab] = useState(roomParam ? "join" : "create")
  const [error, setError] = useState("")

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential)
      let name = decoded.name || (decoded.email ? decoded.email.split("@")[0] : "user")
      name = name.replace(/\s+/g, '_').toLowerCase()
      setUsername(name)
    } catch (e) {
      console.error("JWT Decode error", e)
      setError("Google Login didn't work. Try again?")
    }
  }

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    try {
      const SERVER_URL = import.meta.env.DEV ? "http://localhost:3000" : window.location.origin
      const res = await fetch(`${SERVER_URL}/api/create-room`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: uniqueCode, password })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      window.history.pushState({}, "", `?room=${encodeURIComponent(uniqueCode)}`)
      onJoin({ username, room: uniqueCode, password })
    } catch (e) {
      setError(e.message)
    }
  }

  const handleJoinRoom = async (e) => {
    e.preventDefault()
    if (!room.trim()) {
      setError("Room ID needed")
      return
    }
    const targetRoom = room.trim().toUpperCase()

    try {
      const SERVER_URL = import.meta.env.DEV ? "http://localhost:3000" : window.location.origin
      const res = await fetch(`${SERVER_URL}/api/verify-room`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: targetRoom, password })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      window.history.pushState({}, "", `?room=${encodeURIComponent(targetRoom)}`)
      onJoin({ username, room: targetRoom, password })
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <main className="join-screen">
      <div className="join-card">
        <div className="join-logo">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="var(--accent)"/>
            <path d="M10 14l6 4-6 4M17 22h9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Live-Coderz</span>
        </div>
        
        {!username ? (
          <>
            <h1 className="join-title">Sign in to Continue</h1>
            <p className="join-subtitle">Collaborate in real-time with your team</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="filled_black"
                shape="pill"
              />
            </div>
            {error && <p style={{color: 'var(--error)', textAlign: 'center', fontSize: '14px', marginTop: '1rem'}}>{error}</p>}
          </>
        ) : (
          <>
            <h1 className="join-title">Welcome, {username}!</h1>
            <p className="join-subtitle">Pick an option below to start coding.</p>

            <div style={{ display: "flex", gap: "10px", marginBottom: "1.5rem" }}>
              <button 
                onClick={() => setTab("create")}
                style={{
                  flex: 1, padding: "0.5rem", borderRadius: "8px", fontWeight: "600",
                  background: tab === "create" ? "var(--accent)" : "var(--bg-surface)",
                  color: "white", transition: "all 0.2s"
                }}
              >
                Create Room
              </button>
              <button 
                onClick={() => setTab("join")}
                style={{
                  flex: 1, padding: "0.5rem", borderRadius: "8px", fontWeight: "600",
                  background: tab === "join" ? "var(--accent)" : "var(--bg-surface)",
                  color: "white", transition: "all 0.2s"
                }}
              >
                Join Room
              </button>
            </div>

            {tab === "create" ? (
              <form onSubmit={handleCreateRoom} className="join-form">
                <div className="field-group">
                  <label>Room Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  {error && <span style={{color: 'var(--error)', fontSize: '0.75rem'}}>{error}</span>}
                </div>
                <p style={{color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.5rem"}}>
                  This will generate a fresh room code
                </p>
                <button type="submit" id="join-btn" className="join-btn">
                  Launch Editor
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinRoom} className="join-form">
                <div className="field-group" style={{ marginBottom: "0" }}>
                  <label>Room ID</label>
                  <input
                    type="text"
                    id="room-input"
                    placeholder="e.g. A7B9Q2"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Password (if it has one)</label>
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  {error && <span style={{color: 'var(--error)', fontSize: '0.75rem'}}>{error}</span>}
                </div>
                <button type="submit" id="join-room-btn" className="join-btn">
                  Join
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  )
}
