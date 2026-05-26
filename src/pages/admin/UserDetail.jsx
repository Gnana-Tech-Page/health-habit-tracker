import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import CalendarHeatmap from '../../components/charts/CalendarHeatmap'
import CompletionRing from '../../components/charts/CompletionRing'
import { db } from '../../firebase'
import { useHabits } from '../../context/HabitContext'
import { computeCompletion, computeStreak, sleepOnTimeRate, HABIT_FIELDS } from '../../utils/habitHelpers'
import { downloadWeeklyReport, downloadMonthlyReport } from '../../utils/excelExport'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts'

export default function UserDetail() {
  const { userId } = useParams()
  const { fetchEntries } = useHabits()

  const [user, setUser]     = useState(null)
  const [entries, setEntries] = useState([])
  const [month, setMonth]   = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(true)

  // Fetch user profile from Firestore
  useEffect(() => {
    getDoc(doc(db, 'users', userId))
      .then(snap => setUser(snap.exists() ? { ...snap.data(), uid: snap.id } : null))
      .catch(() => setUser(null))
  }, [userId])

  // Fetch entries for the selected month
  const loadMonth = useCallback(async (m) => {
    const start = format(startOfMonth(m), 'yyyy-MM-dd')
    const end   = format(endOfMonth(m),   'yyyy-MM-dd')
    try {
      const data = await fetchEntries(userId, start, end)
      setEntries(data)
    } catch { setEntries([]) }
    finally { setLoading(false) }
  }, [userId, fetchEntries])

  useEffect(() => { setLoading(true); loadMonth(month) }, [month, loadMonth])

  if (!loading && !user) return (
    <div className="p-8 text-center text-slate-400">
      <p>User not found.</p>
      <Link to="/admin/users" className="text-brand-500 mt-2 inline-block hover:text-brand-400">← Back to admin</Link>
    </div>
  )

  if (loading && !user) return <div className="text-center py-16 text-slate-400">Loading…</div>

  const { current: streak, best } = computeStreak(entries)
  const sleepRate = sleepOnTimeRate(entries)

  const days        = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const dateKeys    = days.map(d => format(d, 'yyyy-MM-dd'))
  const monthEntries = entries.filter(e => dateKeys.includes(e.date))

  const avgPct = monthEntries.length
    ? Math.round(monthEntries.reduce((s, e) => s + computeCompletion(e), 0) / monthEntries.length) : 0

  const lineData = days.map(d => {
    const dk = format(d, 'yyyy-MM-dd')
    const e  = entries.find(x => x.date === dk)
    return { day: format(d, 'd'), pct: e ? computeCompletion(e) : null }
  })

  const selectedEntry = entries.find(e => e.date === selectedDate)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/users" className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        {user && <Avatar user={user} size="md" />}
        <div>
          <h1 className="font-heading font-bold text-xl text-white">{user?.displayName}</h1>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>
        <Badge className="ml-1" variant={user?.role === 'admin' ? 'admin' : 'user'}>{user?.role}</Badge>
        <div className="ml-auto flex gap-2">
          <button onClick={() => downloadWeeklyReport(user?.displayName, entries)}
            className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={14}/> Weekly
          </button>
          <button onClick={() => downloadMonthlyReport(user?.displayName, entries, month)}
            className="btn-primary flex items-center gap-2 text-sm">
            <Download size={14}/> Monthly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Avg',    val: `${avgPct}%`,    ring: avgPct },
          { label: 'Current Streak', val: `${streak}d` },
          { label: 'Best Streak',    val: `${best}d` },
          { label: 'Sleep On Time',  val: `${sleepRate}%` },
        ].map(({ label, val, ring }) => (
          <Card key={label} className="p-4 flex flex-col items-center gap-1">
            {ring !== undefined ? <CompletionRing pct={ring} size={56} stroke={6}/> : null}
            <p className="text-lg font-bold text-white font-heading">{val}</p>
            <p className="section-label text-center">{label}</p>
          </Card>
        ))}
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-3">
        <button onClick={() => setMonth(m => subMonths(m, 1))}
          className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={18}/>
        </button>
        <span className="font-semibold text-white min-w-[120px] text-center">{format(month, 'MMMM yyyy')}</span>
        <button onClick={() => setMonth(m => addMonths(m, 1))} disabled={month >= startOfMonth(new Date())}
          className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
          <ChevronRight size={18}/>
        </button>
        {loading && <span className="text-xs text-slate-500">Loading…</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <p className="section-label mb-4">Calendar</p>
          <CalendarHeatmap entries={entries} month={month} onDayClick={setSelectedDate} selectedDate={selectedDate} />
        </Card>
        <Card className="p-5 overflow-y-auto max-h-80">
          <p className="section-label mb-3">
            {selectedDate ? format(new Date(selectedDate + 'T00:00'), 'MMM d') : 'Select a day'}
          </p>
          {selectedEntry ? (
            <div className="space-y-1">
              {HABIT_FIELDS.filter(f => f.key !== 'sleepOnTime').map(f => {
                const val = selectedEntry[f.key]
                let display, colorCls
                if (f.type === 'bool') {
                  display  = val ? '✓' : '✗'
                  colorCls = val ? 'text-brand-500' : 'text-red-400'
                } else if (f.type === 'water') {
                  const liters = parseFloat(val) || 0
                  display  = liters > 0 ? `${liters}L` : '—'
                  colorCls = liters >= (f.target || 3.0) ? 'text-brand-500' : liters >= 1.8 ? 'text-amber-400' : liters > 0 ? 'text-red-400' : 'text-slate-500'
                } else {
                  display  = `${val || 0}${f.unit || ''}`
                  colorCls = 'text-slate-200'
                }
                return (
                  <div key={f.key} className="flex justify-between text-xs py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">{f.label}</span>
                    <span className={`font-medium ${colorCls}`}>{display}</span>
                  </div>
                )
              })}
              {selectedEntry.sleepTime && (
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">Sleep</span>
                  <span className={`font-medium ${selectedEntry.sleepOnTime ? 'text-brand-500' : 'text-red-400'}`}>
                    {selectedEntry.sleepTime} {selectedEntry.sleepOnTime ? '✓' : `+${selectedEntry.minsLate}m`}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No data for this day</p>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <p className="section-label mb-3">Daily Completion Trend</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={lineData}>
            <XAxis dataKey="day" tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false} interval={4}/>
            <YAxis hide domain={[0,100]}/>
            <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,fontSize:12}}/>
            <ReferenceLine y={80} stroke="#1D9E75" strokeDasharray="4 2"/>
            <Line type="monotone" dataKey="pct" stroke="#1D9E75" strokeWidth={2} dot={false} connectNulls/>
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
