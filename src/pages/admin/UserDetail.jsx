import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import CalendarHeatmap from '../../components/charts/CalendarHeatmap'
import CompletionRing from '../../components/charts/CompletionRing'
import { getUsers, getHabitsForUser } from '../../utils/storage'
import { computeCompletion, computeStreak, sleepOnTimeRate, HABIT_FIELDS } from '../../utils/habitHelpers'
import { downloadWeeklyReport, downloadMonthlyReport } from '../../utils/excelExport'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts'

export default function UserDetail() {
  const { userId } = useParams()
  const [month, setMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const user = useMemo(() => getUsers().find(u => u.id === userId), [userId])
  const entries = useMemo(() => getHabitsForUser(userId), [userId])

  if (!user) return (
    <div className="p-8 text-center text-gray-400">
      <p>User not found.</p>
      <Link to="/admin" className="text-brand-500 mt-2 inline-block">← Back to admin</Link>
    </div>
  )

  const { current: streak, best } = computeStreak(entries)
  const sleepRate = sleepOnTimeRate(entries)

  const weekStart = startOfMonth(month)
  const weekEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const dateKeys = days.map(d => format(d, 'yyyy-MM-dd'))
  const monthEntries = entries.filter(e => dateKeys.includes(e.date))

  const avgPct = monthEntries.length
    ? Math.round(monthEntries.reduce((s, e) => s + computeCompletion(e), 0) / monthEntries.length) : 0

  const lineData = days.map(d => {
    const dk = format(d, 'yyyy-MM-dd')
    const e = entries.find(x => x.date === dk)
    return { day: format(d,'d'), pct: e ? computeCompletion(e) : null }
  })

  const selectedEntry = entries.find(e => e.date === selectedDate)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="text-gray-400 hover:text-gray-600 p-1">
          <ArrowLeft size={20} />
        </Link>
        <Avatar user={user} size="md" />
        <div>
          <h1 className="font-heading font-bold text-xl text-navy">{user.name}</h1>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => downloadWeeklyReport(user.name, entries)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-xl">
            <Download size={14}/> Weekly
          </button>
          <button onClick={() => downloadMonthlyReport(user.name, entries, month)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-700 text-white text-sm font-medium px-3 py-2 rounded-xl">
            <Download size={14}/> Monthly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Avg', val: `${avgPct}%`, ring: avgPct },
          { label: 'Current Streak', val: `${streak}d` },
          { label: 'Best Streak', val: `${best}d` },
          { label: 'Sleep On Time', val: `${sleepRate}%` },
        ].map(({ label, val, ring }) => (
          <Card key={label} className="p-4 flex flex-col items-center gap-1">
            {ring !== undefined ? <CompletionRing pct={ring} size={56} stroke={6}/> : null}
            <p className="text-lg font-bold text-navy font-heading">{val}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest text-center">{label}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setMonth(m => subMonths(m,1))} className="p-2 rounded-xl hover:bg-gray-100">
          <ChevronLeft size={18}/>
        </button>
        <span className="font-semibold text-navy">{format(month,'MMMM yyyy')}</span>
        <button onClick={() => setMonth(m => addMonths(m,1))} disabled={month >= startOfMonth(new Date())}
          className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30">
          <ChevronRight size={18}/>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-4">Calendar</p>
          <CalendarHeatmap entries={entries} month={month} onDayClick={setSelectedDate} selectedDate={selectedDate} />
        </Card>
        <Card className="p-5 overflow-y-auto max-h-80">
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-3">
            {selectedDate ? format(new Date(selectedDate+'T00:00'),'MMM d') : 'Select a day'}
          </p>
          {selectedEntry ? (
            <div className="space-y-1.5">
              {HABIT_FIELDS.filter(f=>f.key!=='sleepOnTime').map(f => {
                const val = selectedEntry[f.key]
                const display = f.type==='bool' ? (val?'✓':'✗') : `${val||0}${f.unit||''}`
                return (
                  <div key={f.key} className="flex justify-between text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-600 text-xs">{f.label}</span>
                    <span className={`font-medium text-xs ${f.type==='bool'?(val?'text-brand-500':'text-danger-500'):'text-navy'}`}>{display}</span>
                  </div>
                )
              })}
            </div>
          ) : <p className="text-sm text-gray-400">No data</p>}
        </Card>
      </div>

      <Card className="p-5">
        <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-3">Daily Completion Trend</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={lineData}>
            <XAxis dataKey="day" tick={{fontSize:10}} axisLine={false} tickLine={false} interval={4}/>
            <YAxis hide domain={[0,100]}/>
            <Tooltip formatter={(v)=>[`${v}%`,'Completion']} contentStyle={{fontSize:12,borderRadius:8}}/>
            <ReferenceLine y={80} stroke="#1D9E75" strokeDasharray="4 2"/>
            <Line type="monotone" dataKey="pct" stroke="#1D9E75" strokeWidth={2} dot={false} connectNulls/>
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
