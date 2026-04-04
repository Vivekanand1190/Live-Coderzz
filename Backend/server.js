import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { YSocketIO } from "y-socket.io/dist/server"
import fs from 'fs'
import path from 'path'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
console.log(".env file exists:", fs.existsSync('.env'))
console.log("VITE_GOOGLE_CLIENT_ID length:", process.env.VITE_GOOGLE_CLIENT_ID?.length || 0)
console.log("Loaded Google Client ID:", process.env.VITE_GOOGLE_CLIENT_ID ? "YES" : "NO")

const app = express()
app.use(cors())

app.use(express.static("public"))

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const ysocketIO = new YSocketIO(io, {
    configuration: { gcEnabled: true },
    levelPersistenceDir: './y-leveldb-storage'
})
ysocketIO.initialize()

io.on("connection", (socket) => {

    socket.on("join-room", (room) => {
        socket.join(room)
    })

    socket.on("leave-room", (room) => {
        socket.leave(room)
    })

    socket.on("chat-message", ({ room, username, text, color }) => {
        if (!room || !username || !text) return
        io.to(room).emit("chat-message", {
            username,
            text,
            color,
            timestamp: Date.now()
        })
    })
})

const PASSWORDS_FILE = './passwords.json'
let roomPasswords = {}
if (fs.existsSync(PASSWORDS_FILE)) {
    try {
        roomPasswords = JSON.parse(fs.readFileSync(PASSWORDS_FILE, 'utf-8'))
    } catch(e) {}
}

app.use(express.json())

app.post("/api/create-room", (req, res) => {
    const { room, password } = req.body
    if (!room) return res.status(400).json({ error: "No room ID? We need one!" })
    
    roomPasswords[room] = password || ""
    fs.writeFileSync(PASSWORDS_FILE, JSON.stringify(roomPasswords))
    
    res.json({ success: true })
})

app.post("/api/verify-room", (req, res) => {
    const { room, password } = req.body
    if (!roomPasswords.hasOwnProperty(room)) {
        return res.json({ success: true })
    }
    
    const requiredPass = roomPasswords[room]
    if (requiredPass && requiredPass !== password) {
        return res.status(401).json({ error: "Oops! That's not the right password." })
    }
    
    res.json({ success: true })
})

app.get("/api/config", (req, res) => {
    res.json({
        googleClientId: process.env.VITE_GOOGLE_CLIENT_ID || ""
    })
})

app.get("/health", (req, res) => {
    res.status(200).json({
        message: "im alive",
        success: true
    })
})

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})