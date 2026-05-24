import { useMemo } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import Card from '../components/ui/Card'
import HabitEntryForm from '../components/habits/HabitEntryForm'
import CompletionRing from '../components/charts/CompletionRing'
import WeeklyBarChart from '../components/charts/WeeklyBarChart'
import SleepChart from '../components/charts/SleepChart'
import { useHabits } from '../context/HabitContext'
import { useAuth } from '../context/AuthContext'
import { computeCompletion, computeStreak, getWeekEntries, weeklyAvg, sleepOnTimeRate } from '../utils/habitHelpers'
import { Flame, Trophy, Moon, TrendingUp } from 'lucide-react'

function StatCard({ icon, label, value, sub }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="text-brand-500">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-navy font-heading">{value}</p>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
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
    const color = pct < 0 ? 'bg-gray-100' : pct < 50 ? 'bg-amber-200' : pct < 80 ? 'bg-brand-200' : 'bg-brand-500'
    const today = date === format(new Date(), 'yyyy-MM-dd')
    return { label: format(addDays(start, i), 'EEE'), color, today, pct }
  })
  return (
    <div className="flex gap-2 justify-between">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs text-gray-400">{d.label}</span>
          <div className={`w-full aspect-square rounded-lg ${d.color} ${d.today ? 'ring-2 ring-navy ring-offset-1' : ''}`} title={d.pct >= 0 ? `${d.pct}%` : 'No data'} />
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { entries } = useHabits()

  const weekEntries = useMemo(() => getWeekEntries(entries), [entries])
  const validWeek = weekEntries.filter(Boolean)
  const weekAvgPct = validWeek.length ? Math.round(validWeek.reduce((s, e) => s + computeCompletion(e), 0) / validWeek.length) : 0
  const { current: currentStreak, best: bestStreak } = useMemo(() => computeStreak(entries), [entries])
  const sleepRate = useMemo(() => sleepOnTimeRate(entries), [entries])
  const avgPushUps = weeklyAvg(validWeek, 'pushUps')
  const avgSquats = weeklyAvg(validWeek, 'squats')
  const avgPlank = weeklyAvg(validWeek, 'plank')

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <HabitEntryForm />

      <div>
        <h2 className="font-heading font-semibold text-navy text-lg mb-4">This Week</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="p-5 flex flex-col items-center gap-2">
            <CompletionRing pct={weekAvgPct} size={72} stroke={7} />
            <div className="text-center">
              <p className="text-lg font-bold text-navy font-heading">{weekAvgPct}%</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Avg Completion</p>
            </div>
          </Card>
          <StatCard icon={<Flame size={24}/>} label="Current Streak" value={`${currentStreak}d`} sub="≥80% days" />
          <StatCard icon={<Trophy size={24}/>} label="Best Streak" value={`${bestStreak}d`} />
          <StatCard icon={<Moon size={24}/>} label="Sleep On Time" value={`${sleepRate}%`} sub="of logged nights" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StatCard icon={<TrendingUp size={24}/>} label="Avg Push Ups" value={avgPushUps} sub="this week" />
          <StatCard icon={<TrendingUp size={24}/>} label="Avg Squats" value={avgSquats} sub="this week" />
          <StatCard icon={<TrendingUp size={24}/>} label="Avg Plank" value={`${avgPlank}s`} sub="this week" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-3">Weekly Heatmap</p>
          <WeekStrip entries={entries} />
        </Card>
        <Card className="p-5">
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-2">Daily Completion</p>
          <WeeklyBarChart entries={entries} />
        </Card>
        <Card className="p-5 md:col-span-2">
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-2">Sleep Times This Week</p>
          <SleepChart entries={entries} />
        </Card>
      </div>
    </div>
  )
}
