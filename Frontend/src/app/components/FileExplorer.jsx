import { useState, useEffect } from "react"
import * as Y from "yjs"

export default function FileExplorer({ yFiles, activeFile, setActiveFile, provider, users }) {
  const [files, setFiles] = useState([])
  const [newFileName, setNewFileName] = useState("")
  const [showNewInput, setShowNewInput] = useState(false)

  useEffect(() => {
    const updateFiles = () => {
      setFiles(Array.from(yFiles.keys()))
    }
    yFiles.observe(updateFiles)
    updateFiles()

    const onSync = (isSynced) => {
        if (isSynced && yFiles.keys().length === 0) {
          yFiles.set("index.js", new Y.Text("console.log('Ready to collaborate!')"))
        }
    }
    provider?.on('sync', onSync)

    return () => {
      yFiles.unobserve(updateFiles)
      provider?.off('sync', onSync)
    }
  }, [yFiles, provider])

  const handleCreateFile = (e) => {
    e.preventDefault()
    if (!newFileName.trim()) return
    const cleaned = newFileName.trim().replace(/\s+/g, '-')
    if (yFiles.has(cleaned)) {
      alert("File already exists!")
      return
    }
    yFiles.set(cleaned, new Y.Text())
    setActiveFile(cleaned)
    setNewFileName("")
    setShowNewInput(false)
  }

  const handleDelete = (e, file) => {
    e.stopPropagation()
    if (file === "index.js") {
        alert("Cannot delete root file index.js")
        return
    }
    yFiles.delete(file)
    if (activeFile === file) {
      const remainder = Array.from(yFiles.keys())
      setActiveFile(remainder[0] || "index.js")
    }
  }

  return (
    <div className="file-explorer sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 className="sidebar-label" style={{ margin: 0 }}>Files</h3>
        <button 
          onClick={() => setShowNewInput(v => !v)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}
        >
          +
        </button>
      </div>

      {showNewInput && (
        <form onSubmit={handleCreateFile} style={{ display: 'flex', marginBottom: 10 }}>
          <input 
            type="text" 
            autoFocus
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            placeholder="script.js" 
            style={{ flex: 1, padding: '4px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-layer)', color: 'white' }}
          />
        </form>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {files.map(f => (
          <li 
             key={f}
             onClick={() => setActiveFile(f)}
             className={`file-item ${activeFile === f ? "active" : ""}`}
             style={{
                padding: '8px 12px',
                borderRadius: '8px',
                marginBottom: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeFile === f ? 'var(--bg-surface)' : 'transparent',
                color: activeFile === f ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
             }}
          >
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {f}
            </span>
            
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              {users.filter(u => u.activeFile === f).map((u, i) => (
                <div 
                  key={i}
                  title={`${u.username} is here`}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: u.color,
                    border: '1.5px solid var(--bg-panel)',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s'
                  }}
                />
              ))}
            </div>

            {f !== "index.js" && (
              <span 
                onClick={(e) => handleDelete(e, f)}
                style={{ opacity: 0.5, fontSize: '0.8rem' }}
                className="delete-file-btn"
              >
                ✕
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
