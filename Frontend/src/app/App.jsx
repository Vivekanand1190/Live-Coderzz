import "./App.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect, useCallback } from "react"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"
import { io } from "socket.io-client"
import { GoogleOAuthProvider } from '@react-oauth/google'

import JoinScreen from "./components/JoinScreen"
import Sidebar from "./components/Sidebar"
import ChatPanel from "./components/ChatPanel"
import EditorToolbar from "./components/EditorToolbar"
import ToastContainer, { useToast } from "./components/Toast"
import { getColorForClient } from "./utils"
import { emmetHTML } from "emmet-monaco-es"

function App() {
  const [config, setConfig] = useState(null)
  
  useEffect(() => {
    const SERVER_URL = import.meta.env.DEV ? "http://localhost:3000" : window.location.origin
    fetch(`${SERVER_URL}/api/config`)
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error("Could not fetch config", err))
  }, [])

  const [session, setSession] = useState(() => {
    const p = new URLSearchParams(window.location.search)
    const username = p.get("username")
    const room = p.get("room")
    if (username && room) return { username, room }
    return null
  })

  if (!config) return <div className="loading-config">Loading...</div>

  return (
    <GoogleOAuthProvider clientId={config.googleClientId}>
      {!session ? (
        <JoinScreen onJoin={setSession} />
      ) : (
        <EditorSession session={session} onLeave={() => {
          window.history.pushState({}, "", window.location.pathname)
          setSession(null)
        }} />
      )}
    </GoogleOAuthProvider>
  )
}

function EditorSession({ session, onLeave }) {
  const { username, room } = session
  const [users, setUsers] = useState([])
  const [connected, setConnected] = useState(false)
  const [chatOpen, setChatOpen] = useState(true)
  
  const [osTheme, setOsTheme] = useState(
    window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "vs-dark"
  )

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const handler = (e) => setOsTheme(e.matches ? "light" : "vs-dark")
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const providerRef = useRef(null)
  const socketRef = useRef(null)
  const bindingRef = useRef(null)
  const { toasts, addToast } = useToast()

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yFiles = useMemo(() => ydoc.getMap("files"), [ydoc])
  const [activeFile, setActiveFile] = useState("index.js")

  const myColor = useMemo(() => getColorForClient(ydoc.clientID), [ydoc])

  const SERVER_URL = import.meta.env.DEV ? "http://localhost:3000" : window.location.origin

  useEffect(() => {
    const socket = io(SERVER_URL)
    socketRef.current = socket

    socket.on("connect", () => {
      socket.emit("join-room", room)
    })

    return () => {
      socket.emit("leave-room", room)
      socket.disconnect()
    }
  }, [room])

  useEffect(() => {
    const provider = new SocketIOProvider(SERVER_URL, room, ydoc, {
      autoConnect: true,
    })
    providerRef.current = provider

    provider.awareness.setLocalStateField("user", {
      username,
      color: myColor,
      activeFile: activeFile,
    })

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().entries())
      setUsers(states.map(([clientId, state]) => ({
        clientId,
        ...state.user,
        isTyping: state.isTyping
      })).filter(u => u.username))
    }

    provider.awareness.on("change", updateUsers)

    provider.on("sync", (isSynced) => {
      if (isSynced) {
        setConnected(true)
        addToast("Connected to room", "success")
      }
    })

    provider.on("status", ({ status }) => {
      if (status === "disconnected") {
        setConnected(false)
        addToast("Connection lost reconnection", "error")
      }
      if (status === "connected") {
        setConnected(true)
      }
    })

    function handleBeforeUnload() {
      provider?.awareness.setLocalStateField("user", null)
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      provider.awareness.off("change", updateUsers)
      provider.disconnect()
      provider.destroy()
      ydoc.destroy()
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [room, username])

  const bindEditor = useCallback((editor, filename) => {
    if (!editor || !providerRef.current) return

    if (bindingRef.current) {
      bindingRef.current.destroy()
      bindingRef.current = null
    }

    let currentYText = yFiles.get(filename)
    if (!currentYText) {
      currentYText = new Y.Text()
      yFiles.set(filename, currentYText)
    }

    bindingRef.current = new MonacoBinding(
      currentYText,
      editor.getModel(),
      new Set([editor]),
      providerRef.current.awareness
    )

    const ext = filename.split('.').pop()
    const extMap = {
      js: 'javascript', py: 'python', html: 'html', css: 'css',
      java: 'java', cpp: 'cpp', c: 'c', go: 'go', ts: 'typescript', json: 'json'
    }
    const lang = extMap[ext] || 'plaintext'
    
    const monaco = monacoRef.current || window.monaco
    try {
      monaco?.editor.setModelLanguage(editor.getModel(), lang)
    } catch (e) {
      console.warn("Language set failed", e)
    }
  }, [yFiles])

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    editor.updateOptions({ tabSize: 2, fontSize: 14 })
    
    bindEditor(editor, activeFile)

    try {
      emmetHTML(monaco)
    } catch (e) { }

    let typingTimeout
    editor.onDidChangeModelContent(() => {
      if (providerRef.current?.awareness) {
        providerRef.current.awareness.setLocalStateField("isTyping", true)
        clearTimeout(typingTimeout)
        typingTimeout = setTimeout(() => {
          providerRef.current.awareness.setLocalStateField("isTyping", false)
        }, 1200)
      }
    })

  }, [activeFile, bindEditor])

  useEffect(() => {
    const handleMapChange = (event) => {
      if (event.keysChanged.has(activeFile)) {
        if (editorRef.current) {
          bindEditor(editorRef.current, activeFile)
        }
      }
    }
    yFiles.observe(handleMapChange)
    return () => yFiles.unobserve(handleMapChange)
  }, [activeFile, bindEditor, yFiles])

  useEffect(() => {
    if (editorRef.current) {
      bindEditor(editorRef.current, activeFile)
    }
    if (providerRef.current?.awareness) {
      providerRef.current.awareness.setLocalStateField("user", {
        username,
        color: myColor,
        activeFile: activeFile,
      })
    }
  }, [activeFile, bindEditor, username, myColor])

  useEffect(() => {
    const styleId = 'yjs-cursor-styles'
    let styleTag = document.getElementById(styleId)
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = styleId
      document.head.appendChild(styleTag)
    }

    const cursorStyles = users.map(user => `
      .yRemoteSelection-${user.clientId} {
        background-color: ${user.color}33;
      }
      .yRemoteSelectionHead-${user.clientId} {
        border-color: ${user.color};
      }
      .yRemoteSelectionHead-${user.clientId}::after {
        content: "${user.username}";
        background-color: ${user.color};
      }
    `).join('\n')

    styleTag.innerHTML = cursorStyles
  }, [users])


  const handleExport = () => {
    const code = editorRef.current?.getValue() ?? ""
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = activeFile || "export.txt"
    a.click()
    URL.revokeObjectURL(url)
    addToast("File exported!", "success")
  }

  const handleShare = () => {
    const url = `${window.location.origin}?room=${encodeURIComponent(room)}`
    navigator.clipboard.writeText(url).then(() => {
      addToast("Room link copied to clipboard!", "success")
    })
  }

  return (
    <div className="editor-layout">
      <Sidebar
        username={username}
        users={users}
        room={room}
        yFiles={yFiles} activeFile={activeFile} setActiveFile={setActiveFile} provider={providerRef.current}
        onExport={handleExport}
        onShare={handleShare}
      />

      <div className="editor-main">
        <EditorToolbar
          room={room}
          connected={connected}
          users={users}
        />

        <div className="editor-area">
            <Editor
              height="100%"
              theme={osTheme}
              path={activeFile}
              defaultValue=""
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "gutter",
              }}
              onMount={handleMount}
            />
        </div>
      </div>

      <div className={`chat-column ${chatOpen ? "chat-open" : "chat-closed"}`}>
        <button
          className="chat-toggle"
          id="chat-toggle"
          onClick={() => setChatOpen(o => !o)}
          title={chatOpen ? "Close chat" : "Open chat"}
        >
          {chatOpen ? "›" : "‹"}
        </button>
        <div style={{ display: chatOpen ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
          <ChatPanel
            socket={socketRef.current}
            room={room}
            username={username}
            userColor={myColor}
          />
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default App