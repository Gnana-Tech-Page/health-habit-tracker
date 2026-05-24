const KEYS = {
  USERS: 'hht_users',
  CURRENT_USER: 'hht_current_user',
  habitsFor: (userId) => `hht_habits_${userId}`,
}

export function getUsers() {
  return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]')
}

export function saveUsers(users) {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users))
}

export function getCurrentUserId() {
  return localStorage.getItem(KEYS.CURRENT_USER)
}

export function setCurrentUserId(id) {
  if (id) localStorage.setItem(KEYS.CURRENT_USER, id)
  else localStorage.removeItem(KEYS.CURRENT_USER)
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

export function getHabitEntryForDate(userId, date) {
  const habits = getHabitsForUser(userId)
  return habits.find(h => h.date === date) || null
}

export function deleteUser(userId) {
  const users = getUsers().filter(u => u.id !== userId)
  saveUsers(users)
  localStorage.removeItem(KEYS.habitsFor(userId))
}
