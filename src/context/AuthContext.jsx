import { createContext, useContext, useState, useEffect } from 'react'
import { getUsers, saveUsers, getCurrentUserId, setCurrentUserId } from '../utils/storage'

const AuthContext = createContext(null)

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// btoa encode — lightweight, not crypto-secure (demo app)
function encodePassword(pw) { return btoa(pw) }

const AVATAR_COLORS = ['#1D9E75','#6366F1','#F59E0B','#E24B4A','#0EA5E9','#8B5CF6','#EC4899']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = getCurrentUserId()
    if (id) {
      const users = getUsers()
      const found = users.find(u => u.id === id)
      if (found) setUser(found)
    }
    setLoading(false)
  }, [])

  function login(email, password, remember = false) {
    const users = getUsers()
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!found) return { error: 'No account found with that email.' }
    if (found.password !== encodePassword(password)) return { error: 'Incorrect password.' }
    setUser(found)
    if (remember) setCurrentUserId(found.id)
    else setCurrentUserId(found.id)
    return { user: found }
  }

  function logout() {
    setUser(null)
    setCurrentUserId(null)
  }

  function register(name, email, password) {
    const users = getUsers()
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'An account with this email already exists.' }
    }
    const color = AVATAR_COLORS[users.length % AVATAR_COLORS.length]
    const newUser = {
      id: uid(),
      name,
      email,
      password: encodePassword(password),
      role: 'user',
      createdAt: new Date().toISOString(),
      avatar: name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0,2),
      avatarColor: color,
    }
    saveUsers([...users, newUser])
    setUser(newUser)
    setCurrentUserId(newUser.id)
    return { user: newUser }
  }

  function updateUser(updates) {
    const users = getUsers()
    const idx = users.findIndex(u => u.id === user.id)
    if (idx < 0) return
    const updated = { ...users[idx], ...updates }
    users[idx] = updated
    saveUsers(users)
    setUser(updated)
    return updated
  }

  function promoteUser(userId) {
    const users = getUsers()
    const idx = users.findIndex(u => u.id === userId)
    if (idx < 0) return
    users[idx].role = users[idx].role === 'admin' ? 'user' : 'admin'
    saveUsers(users)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateUser, promoteUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
