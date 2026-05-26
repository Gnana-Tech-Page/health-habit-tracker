import { useMemo, useState, useEffect } from 'react'
import { format, startOfWeek, addDays, subDays, startOfDay, differenceInCalendarDays, parseISO } from 'date-fns'
import Card from '../components/ui/Card'
import HabitEntryForm from '../components/habits/HabitEntryForm'
import DateNavigator from '../components/habits/DateNavigator'
import CompletionRing from '../components/charts/CompletionRing'
import WeeklyBarChart from '../components/charts/WeeklyBarChart'
import SleepChart from '../components/charts/SleepChart'
import { useHabits } from '../context/HabitContext'
import { computeCompletion, computeStreak, getWeekEntries, weeklyAvg, sleepOnTimeRate } from '../utils/habitHelpers'
import { Flame, Trophy, Moon, TrendingUp } from 'lucide-react'

const MAX_PAST_DAYS = 30

function StatCard({ icon, label, value, sub }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="text-brand-500">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white font-heading">{value}</p>
        <p className="section-label mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </Card>
  )
}

function WeekStrip({ entries }) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = format(addDays(start, i), 'yyyy-MM-dd')
    const entry = entries.find(e => e.date === date)
    const pct = entry ? computeCompletion(entry) : -1
    const color = pct < 0 ? 'bg-slate-700' : pct < 50 ? 'bg-amber-600/50' : pct < 80 ? 'bg-brand-700' : 'bg-brand-500'
    const isToday = date === format(new Date(), 'yyyy-MM-dd')
    return { label: format(addDays(start, i), 'EEE'), color, isToday, pct }
  })
  return (
    <div className="flex gap-2 justify-between">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs text-slate-500">{d.label}</span>
          <div className={`w-full aspect-square rounded-lg ${d.color} ${d.isToday ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-800' : ''}`}
            title={d.pct >= 0 ? `${d.pct}%` : 'No data'} />
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { entries } = useHabits()

  // Date navigation state
  const today = startOfDay(new Date())
  const [selectedDate, setSelectedDate] = useState(today)

  const diff         = differenceInCalendarDays(today, selectedDate)
  const isOnToday    = diff === 0
  const canGoBack    = diff < MAX_PAST_DAYS
  const canGoForward = !isOnToday

  function goBack()    { if (canGoBack)    setSelectedDate(d => subDays(d, 1)) }
  function goForward() { if (canGoForward) setSelectedDate(d => addDays(d, 1)) }
  function jumpTo(dateStr) {
    const picked  = startOfDay(parseISO(dateStr))
    const daysAgo = differenceInCalendarDays(today, picked)
    if (daysAgo >= 0 && daysAgo <= MAX_PAST_DAYS) setSelectedDate(picked)
  }

  // Keyboard ← → navigation (skip when an input is focused)
  useEffect(() => {
    function handler(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft'  && canGoBack)    setSelectedDate(d => subDays(d, 1))
      if (e.key === 'ArrowRight' && canGoForward) setSelectedDate(d => addDays(d, 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [canGoBack, canGoForward])

  // Weekly stats (always computed from current week regardless of selected date)
  const weekEntries  = useMemo(() => getWeekEntries(entries), [entries])
  const validWeek    = weekEntries.filter(Boolean)
  const weekAvgPct   = validWeek.length ? Math.round(validWeek.reduce((s, e) => s + computeCompletion(e), 0) / validWeek.length) : 0
  const { current: currentStreak, best: bestStreak } = useMemo(() => computeStreak(entries), [entries])
  const sleepRate    = useMemo(() => sleepOnTimeRate(entries), [entries])
  const avgPushUps   = weeklyAvg(validWeek, 'pushUps')
  const avgSquats    = weeklyAvg(validWeek, 'squats')
  const avgPlank     = weeklyAvg(validWeek, 'plank')

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Habit entry section */}
      <div className="space-y-3">
        <DateNavigator
          selectedDate={selectedDate}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onBack={goBack}
          onForward={goForward}
          onJump={jumpTo}
        />

        {/* Past-date editing banner */}
        {!isOnToday && (
          <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-2 text-sm">
            <span>✏️</span>
            <span>
              Editing past entry — <strong>{format(selectedDate, 'd MMM')}</strong>. Changes save immediately.
            </span>
            <button onClick={() => setSelectedDate(today)}
              className="ml-auto text-xs underline hover:text-amber-300 transition-colors whitespace-nowrap">
              Go to today →
            </button>
          </div>
        )}

        <HabitEntryForm selectedDate={selectedDate} />
      </div>

      {/* Weekly stats (always shows current week) */}
      <div>
        <h2 className="font-heading font-semibold text-white text-lg mb-4">This Week</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="p-5 flex flex-col items-center gap-2">
            <CompletionRing pct={weekAvgPct} size={72} stroke={7} />
            <div className="text-center">
              <p className="text-lg font-bold text-white font-heading">{weekAvgPct}%</p>
              <p className="section-label">Avg Completion</p>
            </div>
          </Card>
          <StatCard icon={<Flame size={24}/>}    label="Current Streak" value={`${currentStreak}d`} sub="≥80% days" />
          <StatCard icon={<Trophy size={24}/>}   label="Best Streak"    value={`${bestStreak}d`} />
          <StatCard icon={<Moon size={24}/>}     label="Sleep On Time"  value={`${sleepRate}%`}   sub="of logged nights" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StatCard icon={<TrendingUp size={24}/>} label="Avg Push Ups" value={avgPushUps}      sub="this week" />
          <StatCard icon={<TrendingUp size={24}/>} label="Avg Squats"   value={avgSquats}       sub="this week" />
          <StatCard icon={<TrendingUp size={24}/>} label="Avg Plank"    value={`${avgPlank}s`}  sub="this week" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="section-label mb-3">Weekly Heatmap</p>
          <WeekStrip entries={entries} />
        </Card>
        <Card className="p-5">
          <p className="section-label mb-2">Daily Completion</p>
          <WeeklyBarChart entries={entries} />
        </Card>
        <Card className="p-5 md:col-span-2">
          <p className="section-label mb-2">Sleep Times This Week</p>
          <SleepChart entries={entries} />
        </Card>
      </div>
    </div>
  )
}
