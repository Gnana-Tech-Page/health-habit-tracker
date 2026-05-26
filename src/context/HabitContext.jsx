import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { format, subDays } from 'date-fns'
import {
  doc, collection, onSnapshot, setDoc, getDocs,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { computeSleepStatus } from '../utils/habitHelpers'

const HabitContext = createContext(null)

export function HabitProvider({ children }) {
  const { currentUser } = useAuth()
  const uid = currentUser?.uid

  const [entries, setEntries]         = useState([])   // last-365-days batch
  const [todayEntry, setTodayEntry]   = useState(null) // real-time
  const [saveStatus, setSaveStatus]   = useState('idle') // 'idle'|'saving'|'saved'|'error'
  const debounceRef = useRef(null)

  // Real-time listener for today's entry
  useEffect(() => {
    if (!uid) { setTodayEntry(null); return }
    const today = format(new Date(), 'yyyy-MM-dd')
    const ref = doc(db, 'habits', uid, 'entries', today)
    const unsub = onSnapshot(ref, snap => {
      setTodayEntry(snap.exists() ? snap.data() : null)
    })
    return unsub
  }, [uid])

  // One-time fetch: last 365 days (covers Dashboard week + History year)
  useEffect(() => {
    if (!uid) { setEntries([]); return }
    const start = format(subDays(new Date(), 365), 'yyyy-MM-dd')
    const q = query(
      collection(db, 'habits', uid, 'entries'),
      where('date', '>=', start),
      orderBy('date', 'asc')
    )
    getDocs(q).then(snap => {
      setEntries(snap.docs.map(d => d.data()))
    }).catch(console.error)
  }, [uid])

  // Debounced Firestore write (500 ms)
  const saveEntry = useCallback((entry) => {
    if (!uid) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveStatus('saving')
    debounceRef.current = setTimeout(async () => {
      try {
        const sleepStatus = computeSleepStatus(entry.sleepTime)
        const full = { ...entry, uid, ...sleepStatus, updatedAt: serverTimestamp() }
        const ref = doc(db, 'habits', uid, 'entries', full.date)
        await setDoc(ref, full, { merge: true })
        setSaveStatus('saved')
        // Sync into local entries array
        setEntries(prev => {
          const idx = prev.findIndex(e => e.date === full.date)
          if (idx >= 0) { const next = [...prev]; next[idx] = full; return next }
          return [...prev, full].sort((a, b) => a.date.localeCompare(b.date))
        })
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('error')
      }
    }, 500)
  }, [uid])

  // On-demand fetch for arbitrary date ranges (History older-month navigation, admin reports)
  const fetchEntries = useCallback(async (targetUid, startDate, endDate) => {
    const q = query(
      collection(db, 'habits', targetUid, 'entries'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data())
  }, [])

  return (
    <HabitContext.Provider value={{ entries, todayEntry, saveEntry, saveStatus, fetchEntries }}>
      {children}
    </HabitContext.Provider>
  )
}

export function useHabits() {
  return useContext(HabitContext)
}
