import { format, subDays } from 'date-fns'
import { hashPassword } from './crypto'
import { getUsers, saveUsers, isLegacyFormat, saveHabitsForUser } from './storage'
import { computeSleepStatus } from './habitHelpers'

function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function deriveAvatarColor(username) {
  const palette = ['#6366F1','#0ea5e9','#10b981','#F59E0B','#E24B4A','#8B5CF6','#EC4899','#14b8a6']
  let h = 0
  for (const c of username) h = ((h << 5) - h + c.charCodeAt(0)) | 0
  return palette[Math.abs(h) % palette.length]
}

// Known passwords for existing demo accounts — allows migration without forcing change
const KNOWN_PASSWORDS = {
  'admin@habittracker.com': 'admin123',
  'alex@demo.com':  'demo123',
  'priya@demo.com': 'demo123',
  'jordan@demo.com':'demo123',
}

export async function runMigrationIfNeeded() {
  if (!isLegacyFormat()) return
  const old = getUsers()
  console.log(`[HHT] Migrating ${old.length} users from legacy format…`)
  const migrated = await Promise.all(old.map(async u => {
    const known = KNOWN_PASSWORDS[u.email]
    const passwordHash = await hashPassword(known ?? 'changeme')
    const username = (u.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20)
    return {
      id: u.id,
      username,
      displayName: u.name || username,
      passwordHash,
      mustChangePassword: !known,
      role: u.role || 'user',
      createdAt: u.createdAt || new Date().toISOString(),
      lastLogin: null,
      loginCount: 0,
      avatarColor: deriveAvatarColor(username),
    }
  }))
  saveUsers(migrated)
  localStorage.setItem('hht_migrated', 'true')
  console.log(`[HHT] Migration complete`)
}

export async function seedIfNeeded() {
  if (getUsers().length > 0) return
  const adminHash = await hashPassword('admin123')
  const demoHash  = await hashPassword('demo123')

  const admin = {
    id: uid(), username: 'admin', displayName: 'Administrator',
    passwordHash: adminHash, mustChangePassword: false, role: 'admin',
    createdAt: new Date().toISOString(), lastLogin: null, loginCount: 0,
    avatarColor: '#6366F1',
  }

  const demoUsers = [
    { username: 'alex_j',   displayName: 'Alex Johnson' },
    { username: 'priya_s',  displayName: 'Priya Sharma' },
    { username: 'jordan_l', displayName: 'Jordan Lee' },
  ].map(u => ({
    id: uid(), ...u, passwordHash: demoHash,
    mustChangePassword: false, role: 'user',
    createdAt: subDays(new Date(), 35).toISOString(),
    lastLogin: subDays(new Date(), Math.floor(Math.random() * 7)).toISOString(),
    loginCount: Math.floor(Math.random() * 30) + 5,
    avatarColor: deriveAvatarColor(u.username),
  }))

  saveUsers([admin, ...demoUsers])
  demoUsers.forEach(u => saveHabitsForUser(u.id, generateDemoEntries(u.id)))
}

function generateDemoEntries(userId) {
  const entries = []
  for (let i = 30; i >= 0; i--) {
    if (Math.random() > 0.1) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const sleepTime = rTime(22, 15, 60)
      const { onTime, minsLate } = computeSleepStatus(sleepTime)
      entries.push({
        id: uid(), userId, date,
        wakeUpTime: rTime(6, 15, 60),
        drinkLemonWater: rBool(0.8), eatMethi: rBool(0.7), morningWalk: rBool(0.75),
        pushUps: rInt(15, 50), squats: rInt(20, 60), plank: rInt(30, 120),
        eatingNuts: rBool(0.8), drink3LWater: rBool(0.7),
        writing: rBool(0.6), meditation: rBool(0.65), read10Pages: rBool(0.7), learning: rBool(0.75),
        sleepTime, sleepOnTime: onTime, minsLate,
      })
    }
  }
  return entries
}

function rBool(p = 0.75) { return Math.random() < p }
function rInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }
function rTime(h, m, j = 30) {
  const t = h * 60 + m + Math.floor(Math.random() * j) - j / 2
  return `${String(Math.max(0, Math.min(23, Math.floor(t / 60)))).padStart(2,'0')}:${String(Math.max(0, Math.min(59, Math.round(t % 60)))).padStart(2,'0')}`
}
