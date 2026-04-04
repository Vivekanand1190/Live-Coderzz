import { useEffect, useRef, useState } from "react"
import { formatTime } from "../utils"

export default function ChatPanel({ socket, room, username, userColor }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!socket) return

    const handler = (msg) => {
      setMessages(prev => [...prev, msg])
    }
    socket.on("chat-message", handler)
    return () => socket.off("chat-message", handler)
  }, [socket])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = (e) => {
    e.preventDefault()
    if (!text.trim() || !socket) return
    socket.emit("chat-message", { room, username, text: text.trim(), color: userColor })
    setText("")
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Chat
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">No messages yet. Say hi!</p>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.username === username ? "mine" : "theirs"}`}>
            <span className="bubble-name" style={{ color: msg.color }}>
              {msg.username}
            </span>
            <span className="bubble-text">{msg.text}</span>
            <span className="bubble-time">{formatTime(msg.timestamp)}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={send}>
        <input
          id="chat-input"
          type="text"
          placeholder="Message..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button id="chat-send" type="submit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  )
}
