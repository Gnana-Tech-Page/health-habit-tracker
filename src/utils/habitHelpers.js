import { parseISO, differenceInMinutes, format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

export const HABIT_FIELDS = [
  { key: 'drinkLemonWater', label: 'Drink Lemon Water', type: 'bool', category: 'morning' },
  { key: 'eatMethi',        label: 'Eat Methi',         type: 'bool', category: 'morning' },
  { key: 'morningWalk',     label: 'Morning Walk',       type: 'bool', category: 'fitness' },
  { key: 'pushUps',         label: 'Push Ups',           type: 'number', unit: 'reps', category: 'fitness' },
  { key: 'squats',          label: 'Squats',             type: 'number', unit: 'reps', category: 'fitness' },
  { key: 'plank',           label: 'Plank',              type: 'number', unit: 'sec',  category: 'fitness' },
  { key: 'eatingNuts',   label: 'Eating Nuts',   type: 'bool',  category: 'nutrition' },
  { key: 'waterIntake',  label: 'Water Intake',  type: 'water', category: 'nutrition', unit: 'L', target: 3.0 },
  { key: 'writing',         label: 'Writing',            type: 'bool', category: 'mind' },
  { key: 'meditation',      label: 'Meditation',         type: 'bool', category: 'mind' },
  { key: 'read10Pages',     label: 'Read 10 Pages',      type: 'bool', category: 'mind' },
  { key: 'learning',        label: 'Learning',           type: 'bool', category: 'mind' },
  { key: 'sleepOnTime',     label: 'Sleep On Time',      type: 'bool', category: 'evening' },
]

const SLEEP_TARGET = '22:30'

export function computeSleepStatus(sleepTime) {
  if (!sleepTime) return { onTime: false, minsLate: 0 }
  const [sh, sm] = sleepTime.split(':').map(Number)
  const [th, tm] = SLEEP_TARGET.split(':').map(Number)
  const sleepMins = sh * 60 + sm
  const targetMins = th * 60 + tm
  const diff = sleepMins - targetMins
  return { onTime: diff <= 0, minsLate: Math.max(0, diff) }
}

export function computeCompletion(entry) {
  if (!entry) return 0
  const bools   = HABIT_FIELDS.filter(f => f.type === 'bool' && f.key !== 'sleepOnTime')
  const numbers = HABIT_FIELDS.filter(f => f.type === 'number')
  const waters  = HABIT_FIELDS.filter(f => f.type === 'water')
  let done = 0
  const total = bools.length + numbers.length + waters.length + 1 // +1 for wakeUpTime/sleepOnTime pair
  bools.forEach(f => { if (entry[f.key]) done++ })
  numbers.forEach(f => { if ((entry[f.key] || 0) > 0) done++ })
  waters.forEach(f => { if ((parseFloat(entry[f.key]) || 0) >= (f.target || 3.0)) done++ })
  if (entry.wakeUpTime) done++
  if (entry.sleepOnTime) done++
  return Math.round((done / total) * 100)
}

export function computeStreak(entries) {
  if (!entries.length) return { current: 0, best: 0 }
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  let current = 0
  let best = 0
  let streak = 0
  let prevDate = null
  for (const entry of sorted) {
    const pct = computeCompletion(entry)
    if (pct >= 80) {
      if (!prevDate) {
        streak = 1
      } else {
        const prev = parseISO(prevDate)
        const curr = parseISO(entry.date)
        const diff = Math.round((prev - curr) / (1000 * 60 * 60 * 24))
        if (diff === 1) streak++
        else streak = 1
      }
      if (streak > best) best = streak
      if (current === 0 || prevDate) current = streak
      prevDate = entry.date
    } else {
      if (current === 0) current = 0
      streak = 0
      prevDate = entry.date
    }
  }
  return { current, best }
}

export function getWeekEntries(entries, referenceDate = new Date()) {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'))
  return days.map(date => entries.find(e => e.date === date) || null)
}

export function weeklyAvg(entries, field) {
  const valid = entries.filter(e => e && (e[field] || 0) > 0)
  if (!valid.length) return 0
  return Math.round(valid.reduce((sum, e) => sum + (e[field] || 0), 0) / valid.length)
}

export function sleepOnTimeRate(entries) {
  const logged = entries.filter(e => e && e.sleepTime)
  if (!logged.length) return 0
  const onTime = logged.filter(e => e.sleepOnTime).length
  return Math.round((onTime / logged.length) * 100)
}
