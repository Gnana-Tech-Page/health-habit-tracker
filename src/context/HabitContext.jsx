import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getHabitsForUser, upsertHabitEntry } from '../utils/storage'
import { computeSleepStatus } from '../utils/habitHelpers'
import { format } from 'date-fns'

const HabitContext = createContext(null)

export function HabitProvider({ children }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])

  useEffect(() => {
    if (user) setEntries(getHabitsForUser(user.id))
    else setEntries([])
  }, [user])

  const saveEntry = useCallback((entry) => {
    if (!user) return
    const sleepStatus = computeSleepStatus(entry.sleepTime)
    const full = { ...entry, userId: user.id, ...sleepStatus }
    upsertHabitEntry(user.id, full)
    setEntries(prev => {
      const idx = prev.findIndex(e => e.date === full.date)
      if (idx >= 0) { const next = [...prev]; next[idx] = full; return next }
      return [...prev, full]
    })
  }, [user])

  const todayEntry = entries.find(e => e.date === format(new Date(), 'yyyy-MM-dd')) || null

  return (
    <HabitContext.Provider value={{ entries, saveEntry, todayEntry }}>
      {children}
    </HabitContext.Provider>
  )
}

export function useHabits() {
  return useContext(HabitContext)
}
