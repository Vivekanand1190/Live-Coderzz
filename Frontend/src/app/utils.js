export const USER_COLORS = [
  "#94a3b8", 
  "#a8a29e", 
  "#a78bfa", 
  "#f472b6", 
  "#fbbf24", 
  "#2dd4bf", 
  "#93c5fd", 
  "#c084fc", 
  "#fda4af", 
  "#fcd34d"
]

export const getColorForClient = (clientId) => {
  return USER_COLORS[clientId % USER_COLORS.length]
}

export const getInitials = (name) => {
  return name?.split(/[_\s]/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "??"
}

export const formatTime = (ts) => {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
