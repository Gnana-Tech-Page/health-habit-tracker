const KEYS = {
  USERS: 'hht_users',
  SESSION: 'hht_session',
  habitsFor: (id) => `hht_habits_${id}`,
  lockout: (u) => `hht_lockout_${u.toLowerCase()}`,
}

export function getUsers() {
  return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]')
}

export function saveUsers(users) {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users))
}

export function getUserByUsername(username) {
  return getUsers().find(u => u.username === username.toLowerCase()) || null
}

export function getUserById(id) {
  return getUsers().find(u => u.id === id) || null
}

export function upsertUser(user) {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === user.id)
  if (idx >= 0) users[idx] = user
  else users.push(user)
  saveUsers(users)
}

export function removeUser(id) {
  saveUsers(getUsers().filter(u => u.id !== id))
  localStorage.removeItem(KEYS.habitsFor(id))
}

export function getSession() {
  return JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null')
}

export function saveSession(s) {
  localStorage.setItem(KEYS.SESSION, JSON.stringify(s))
}

export function clearSession() {
  localStorage.removeItem(KEYS.SESSION)
}

export function getLockout(username) {
  return JSON.parse(localStorage.getItem(KEYS.lockout(username)) || 'null')
}

export function saveLockout(username, info) {
  localStorage.setItem(KEYS.lockout(username), JSON.stringify(info))
}

export function clearLockout(username) {
  localStorage.removeItem(KEYS.lockout(username))
}

export function getHabitsForUser(userId) {
  return JSON.parse(localStorage.getItem(KEYS.habitsFor(userId)) || '[]')
}

export function saveHabitsForUser(userId, habits) {
  localStorage.setItem(KEYS.habitsFor(userId), JSON.stringify(habits))
}

export function upsertHabitEntry(userId, entry) {
  const habits = getHabitsForUser(userId)
  const idx = habits.findIndex(h => h.date === entry.date)
  if (idx >= 0) habits[idx] = { ...habits[idx], ...entry }
  else habits.push(entry)
  saveHabitsForUser(userId, habits)
}

// Returns true if stored users are in the old email-based format
export function isLegacyFormat() {
  const users = getUsers()
  return users.length > 0 && 'email' in users[0]
}
