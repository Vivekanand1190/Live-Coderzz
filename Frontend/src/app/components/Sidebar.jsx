import { getInitials } from "../utils"
import FileExplorer from "./FileExplorer"

export default function Sidebar({
  username,
  users,
  room,
  yFiles, activeFile, setActiveFile, provider,
  onExport,
  onShare,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section room-info">
        <div className="user-profile-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={{ fontWeight: 600 }}>{username}</span>
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-label">Online ({users.length})</h3>
        <ul className="user-list">
          {users.map((user, i) => (
            <li key={i} className="user-item" style={{ position: 'relative' }}>
              <span
                className="user-avatar"
                style={{ background: user.color, color: "#fff" }}
              >
                {getInitials(user.username)}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="user-name">{user.username}</span>
                {user.isTyping && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', position: 'absolute', bottom: -5, left: 34 }}>
                    typing...
                  </span>
                )}
              </div>
              <span className="user-dot" />
            </li>
          ))}
        </ul>
      </div>

      <FileExplorer yFiles={yFiles} activeFile={activeFile} setActiveFile={setActiveFile} provider={provider} users={users} />

      <div className="sidebar-section sidebar-actions">
        <button id="share-btn" className="action-btn" onClick={onShare}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share Link
        </button>
        <button id="export-btn" className="action-btn" onClick={onExport}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export File
        </button>
      </div>
    </aside>
  )
}
