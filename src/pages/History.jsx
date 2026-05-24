import { useState, useMemo } from 'react'
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import Card from '../components/ui/Card'
import CalendarHeatmap from '../components/charts/CalendarHeatmap'
import { useHabits } from '../context/HabitContext'
import { useAuth } from '../context/AuthContext'
import { computeCompletion, HABIT_FIELDS } from '../utils/habitHelpers'
import { downloadWeeklyReport, downloadMonthlyReport } from '../utils/excelExport'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Cell
} from 'recharts'

function DayDetail({ entry, date }) {
  if (!entry) return (
    <div className="text-center py-8 text-gray-400 text-sm">No data for {format(new Date(date + 'T00:00'), 'MMM d')}</div>
  )
  const fields = HABIT_FIELDS.filter(f => f.key !== 'sleepOnTime')
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-navy">{format(new Date(date + 'T00:00'), 'EEEE, MMM d')}</span>
        <span className="text-lg font-bold text-brand-500">{computeCompletion(entry)}%</span>
      </div>
      {fields.map(f => {
        const val = entry[f.key]
        const display = f.type === 'bool' ? (val ? '✓' : '✗') : `${val || 0} ${f.unit || ''}`
        return (
          <div key={f.key} className="flex justify-between text-sm py-1 border-b border-gray-50">
            <span className="text-gray-600">{f.label}</span>
            <span className={`font-medium ${f.type === 'bool' ? (val ? 'text-brand-500' : 'text-danger-500') : 'text-navy'}`}>{display}</span>
          </div>
        )
      })}
      {entry.wakeUpTime && (
        <div className="flex justify-between text-sm py-1 border-b border-gray-50">
          <span className="text-gray-600">Wake Up</span>
          <span className="font-medium text-navy">{entry.wakeUpTime}</span>
        </div>
      )}
      {entry.sleepTime && (
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-600">Sleep</span>
          <span className={`font-medium ${entry.sleepOnTime ? 'text-brand-500' : 'text-danger-500'}`}>
            {entry.sleepTime} {entry.sleepOnTime ? '(on time)' : `(+${entry.minsLate}m late)`}
          </span>
        </div>
      )}
    </div>
  )
}

export default function History() {
  const { user } = useAuth()
  const { entries } = useHabits()
  const [month, setMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const monthEntries = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const days = eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'))
    return entries.filter(e => days.includes(e.date))
  }, [entries, month])

  const lineData = useMemo(() => {
    const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
    return days.map(d => {
      const dk = format(d, 'yyyy-MM-dd')
      const e = entries.find(x => x.date === dk)
      return { day: format(d, 'd'), pct: e ? computeCompletion(e) : null }
    })
  }, [entries, month])

  const sleepData = useMemo(() => {
    const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
    return days.map(d => {
      const dk = format(d, 'yyyy-MM-dd')
      const e = entries.find(x => x.date === dk)
      if (!e?.sleepTime) return { day: format(d,'d'), val: null, onTime: false }
      const [h,m] = e.sleepTime.split(':').map(Number)
      let v = h + m/60
      if (v < 5) v += 24
      return { day: format(d,'d'), val: v, onTime: e.sleepOnTime }
    })
  }, [entries, month])

  const summaryRows = useMemo(() => {
    const total = monthEntries.length
    return HABIT_FIELDS.filter(f => f.key !== 'sleepOnTime').map(f => {
      const done = f.type === 'bool'
        ? monthEntries.filter(e => e[f.key]).length
        : monthEntries.filter(e => (e[f.key]||0) > 0).length
      const pct = total ? Math.round((done/total)*100) : 0
      return { ...f, done, missed: total - done, pct }
    })
  }, [monthEntries])

  const selectedEntry = entries.find(e => e.date === selectedDate) || null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-navy">History & Reports</h1>
        <div className="flex gap-2">
          <button onClick={() => downloadWeeklyReport(user.name, entries)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors">
            <Download size={15} /> Weekly
          </button>
          <button onClick={() => downloadMonthlyReport(user.name, entries, month)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors">
            <Download size={15} /> Monthly
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setMonth(m => subMonths(m,1))} className="p-2 rounded-xl hover:bg-gray-100">
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-navy min-w-[120px] text-center">{format(month,'MMMM yyyy')}</span>
        <button onClick={() => setMonth(m => addMonths(m,1))} disabled={month >= startOfMonth(new Date())}
          className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-4">Calendar</p>
          <CalendarHeatmap entries={entries} month={month} onDayClick={setSelectedDate} selectedDate={selectedDate} />
        </Card>
        <Card className="p-5 overflow-y-auto max-h-96">
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-4">Day Detail</p>
          <DayDetail entry={selectedEntry} date={selectedDate} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-3">Daily Completion %</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={lineData}>
              <XAxis dataKey="day" tick={{fontSize:10}} axisLine={false} tickLine={false} interval={4} />
              <YAxis hide domain={[0,100]} />
              <Tooltip formatter={(v)=>[`${v}%`,'Completion']} contentStyle={{fontSize:12,borderRadius:8}} />
              <ReferenceLine y={80} stroke="#1D9E75" strokeDasharray="4 2" />
              <Line type="monotone" dataKey="pct" stroke="#1D9E75" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-3">Sleep Times</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={sleepData} barSize={6}>
              <XAxis dataKey="day" tick={{fontSize:10}} axisLine={false} tickLine={false} interval={4} />
              <YAxis hide domain={[20,26]} />
              <Tooltip contentStyle={{fontSize:12,borderRadius:8}} />
              <ReferenceLine y={22.5} stroke="#1D9E75" strokeDasharray="4 2" />
              <Bar dataKey="val" radius={[2,2,0,0]}>
                {sleepData.map((d,i)=><Cell key={i} fill={d.onTime ? '#1D9E75' : d.val ? '#E24B4A' : '#E5E7EB'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-4">Monthly Summary</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="pb-2 font-semibold">Habit</th>
                <th className="pb-2 font-semibold text-right">Done</th>
                <th className="pb-2 font-semibold text-right">Missed</th>
                <th className="pb-2 font-semibold text-right">%</th>
                <th className="pb-2 font-semibold text-right">vs 85%</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map(r => (
                <tr key={r.key} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 text-gray-700">{r.label}</td>
                  <td className="py-2 text-right text-brand-500 font-medium">{r.done}</td>
                  <td className="py-2 text-right text-danger-500 font-medium">{r.missed}</td>
                  <td className="py-2 text-right font-semibold text-navy">{r.pct}%</td>
                  <td className="py-2 text-right">{r.pct >= 85 ? '✓' : '✗'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
