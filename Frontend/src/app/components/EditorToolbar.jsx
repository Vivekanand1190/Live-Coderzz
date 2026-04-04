import { getInitials } from "../utils"

export default function EditorToolbar({ room, connected, users }) {

  return (
    <div className="editor-toolbar">
      <div className="toolbar-left">
        <span className="toolbar-room" title="Room ID">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          {room}
        </span>
        
        <div className="face-pile" style={{ display: 'flex', marginLeft: '12px' }}>
          {users.map((u, i) => (
            <div 
              key={i}
              className="face-avatar"
              title={`${u.username}${u.isTyping ? ' is typing...' : ''}`}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: u.color,
                color: '#fff',
                fontSize: '10px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-panel)',
                marginLeft: i === 0 ? 0 : '-8px',
                zIndex: users.length - i,
                position: 'relative',
                transition: 'transform 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {getInitials(u.username)}
              {u.isTyping && (
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  background: 'var(--success)',
                  borderRadius: '50%',
                  border: '1.5px solid var(--bg-panel)',
                  animation: 'pulse 1.5s infinite'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="toolbar-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: connected ? 'var(--success)' : 'var(--error)' }}>
            ● {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  )
}
