import { format, subDays } from 'date-fns'
import { getUsers, saveUsers, saveHabitsForUser } from './storage'
import { computeSleepStatus } from './habitHelpers'

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// btoa-based lightweight encode (not crypto-secure — demo only)
function encodePassword(pw) {
  return btoa(pw)
}

function randomBool(prob = 0.75) {
  return Math.random() < prob
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomTime(baseHour, baseMin, jitterMins = 30) {
  const total = baseHour * 60 + baseMin + Math.floor(Math.random() * jitterMins) - jitterMins / 2
  const h = Math.max(0, Math.min(23, Math.floor(total / 60)))
  const m = Math.max(0, Math.min(59, Math.round(total % 60)))
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function generateEntry(userId, date) {
  const sleepTime = randomTime(22, 15, 60)
  const { onTime, minsLate } = computeSleepStatus(sleepTime)
  return {
    id: uid(),
    userId,
    date,
    wakeUpTime: randomTime(6, 15, 60),
    drinkLemonWater: randomBool(0.8),
    eatMethi: randomBool(0.7),
    morningWalk: randomBool(0.75),
    pushUps: randomInt(15, 50),
    squats: randomInt(20, 60),
    plank: randomInt(30, 120),
    eatingNuts: randomBool(0.8),
    drink3LWater: randomBool(0.7),
    writing: randomBool(0.6),
    meditation: randomBool(0.65),
    read10Pages: randomBool(0.7),
    learning: randomBool(0.75),
    sleepTime,
    sleepOnTime: onTime,
    minsLate,
  }
}

export function seedIfNeeded() {
  const existing = getUsers()
  if (existing.length > 0) return

  const admin = {
    id: uid(),
    name: 'Admin User',
    email: 'admin@habittracker.com',
    password: encodePassword('admin123'),
    role: 'admin',
    createdAt: new Date().toISOString(),
    avatar: 'AU',
    avatarColor: '#1D9E75',
  }

  const demoUsers = [
    { name: 'Alex Johnson', email: 'alex@demo.com', avatarColor: '#6366F1' },
    { name: 'Priya Sharma',  email: 'priya@demo.com', avatarColor: '#F59E0B' },
    { name: 'Jordan Lee',    email: 'jordan@demo.com', avatarColor: '#E24B4A' },
  ].map(u => ({
    id: uid(),
    ...u,
    password: encodePassword('demo123'),
    role: 'user',
    createdAt: subDays(new Date(), 35).toISOString(),
    avatar: u.name.split(' ').map(p => p[0]).join(''),
  }))

  const allUsers = [admin, ...demoUsers]
  saveUsers(allUsers)

  demoUsers.forEach(user => {
    const entries = []
    for (let i = 30; i >= 0; i--) {
      if (Math.random() > 0.1) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
        entries.push(generateEntry(user.id, date))
      }
    }
    saveHabitsForUser(user.id, entries)
  })
}
