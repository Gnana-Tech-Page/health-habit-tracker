import { createContext, useContext, useState, useEffect } from 'react'
import { verifyPassword, hashPassword } from '../utils/crypto'
import {
  getUsers, getUserByUsername, getUserById, upsertUser, removeUser,
  getSession, saveSession, clearSession,
  getLockout, saveLockout, clearLockout,
} from '../utils/storage'
import { deriveAvatarColor } from '../utils/init'

const AuthContext = createContext(null)

const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 15 * 60 * 1000

function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const session = getSession()
    if (session) {
      const u = getUserById(session.userId)
      if (u) setCurrentUser(u)
    }
    setLoading(false)
  }, [])

  async function login(username, password) {
    const uname = username.toLowerCase().trim()

    const lock = getLockout(uname)
    if (lock?.attempts >= MAX_ATTEMPTS) {
      const age = Date.now() - lock.lockedAt
      if (age < LOCKOUT_MS) {
        const mins = Math.ceil((LOCKOUT_MS - age) / 60000)
        return { error: `Account locked. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.` }
      }
      clearLockout(uname)
    }

    const user = getUserByUsername(uname)
    if (!user) return bump(uname, { error: 'Invalid username or password.' })

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) return bump(uname, { error: 'Invalid username or password.' })

    clearLockout(uname)
    const updated = { ...user, lastLogin: new Date().toISOString(), loginCount: (user.loginCount || 0) + 1 }
    upsertUser(updated)
    saveSession({ userId: updated.id, username: updated.username, role: updated.role, loginTime: Date.now() })
    setCurrentUser(updated)

    if (updated.mustChangePassword) return { mustChangePassword: true, user: updated }
    return { success: true, user: updated }
  }

  function bump(uname, errorResult) {
    const cur = getLockout(uname) || { attempts: 0, lockedAt: Date.now() }
    const attempts = cur.attempts + 1
    saveLockout(uname, { attempts, lockedAt: attempts >= MAX_ATTEMPTS ? Date.now() : cur.lockedAt })
    if (attempts >= MAX_ATTEMPTS)
      return { error: `Account locked after ${MAX_ATTEMPTS} failed attempts. Try again in 15 minutes.` }
    const left = MAX_ATTEMPTS - attempts
    return { error: `${errorResult.error} ${left} attempt${left !== 1 ? 's' : ''} remaining.` }
  }

  function logout() {
    clearSession()
    setCurrentUser(null)
  }

  async function createUser({ username, displayName, password, role = 'user' }) {
    const uname = username.toLowerCase().trim()
    if (getUserByUsername(uname)) return { error: 'Username already exists.' }
    const passwordHash = await hashPassword(password)
    const newUser = {
      id: uid(), username: uname, displayName: displayName.trim(),
      passwordHash, mustChangePassword: false, role,
      createdAt: new Date().toISOString(), lastLogin: null, loginCount: 0,
      avatarColor: deriveAvatarColor(uname),
    }
    upsertUser(newUser)
    return { success: true, user: newUser }
  }

  function updateUser(userId, changes) {
    const user = getUserById(userId)
    if (!user) return null
    const updated = { ...user, ...changes }
    upsertUser(updated)
    if (currentUser?.id === userId) setCurrentUser(updated)
    return updated
  }

  async function changePassword(userId, newPassword) {
    const hash = await hashPassword(newPassword)
    return updateUser(userId, { passwordHash: hash, mustChangePassword: false })
  }

  function deleteUser(userId) {
    removeUser(userId)
  }

  function getAllUsers() {
    return getUsers()
  }

  return (
    <AuthContext.Provider value={{
      currentUser, loading,
      login, logout,
      createUser, updateUser, deleteUser, getAllUsers, changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
