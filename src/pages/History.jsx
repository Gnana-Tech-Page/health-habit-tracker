import { useState, useMemo } from 'react'
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import Card from '../components/ui/Card'
import CalendarHeatmap from '../components/charts/CalendarHeatmap'
import { useHabits } from '../context/HabitContext'
import { useAuth } from '../context/AuthContext'
import { computeCompletion, HABIT_FIELDS } from '../utils/habitHelpers'
import { downloadWeeklyReport, downloadMonthlyReport } from '../utils/excelExport'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Cell } from 'recharts'

const TT = (label) => ({ active, payload }) => active && payload?.length ? (
  <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
    <p className="text-slate-400">{label}</p>
    <p className="text-white font-medium">{payload[0].value}{label.includes('%') ? '%' : ''}</p>
  </div>
) : null

function DayDetail({ entry, date }) {
  if (!entry) return <div className="text-center py-8 text-slate-500 text-sm">No data for {format(new Date(date + 'T00:00'),'MMM d')}</div>
  const fields = HABIT_FIELDS.filter(f => f.key !== 'sleepOnTime')
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-white text-sm">{format(new Date(date+'T00:00'),'EEEE, MMM d')}</span>
        <span className="text-lg font-bold text-brand-500">{computeCompletion(entry)}%</span>
      </div>
      {fields.map(f => {
        const val = entry[f.key]
        let display, colorCls
        if (f.type === 'bool') {
          display  = val ? '✓' : '✗'
          colorCls = val ? 'text-brand-500' : 'text-red-400'
        } else if (f.type === 'water') {
          const liters = parseFloat(val) || 0
          display  = liters > 0 ? `${liters}L` : '—'
          colorCls = liters >= (f.target || 3.0) ? 'text-brand-500' : liters >= 1.8 ? 'text-amber-400' : liters > 0 ? 'text-red-400' : 'text-slate-500'
        } else {
          display  = `${val||0} ${f.unit||''}`
          colorCls = 'text-slate-200'
        }
        return (
          <div key={f.key} className="flex justify-between text-xs py-1 border-b border-slate-700/50">
            <span className="text-slate-400">{f.label}</span>
            <span className={`font-medium ${colorCls}`}>{display}</span>
          </div>
        )
      })}
      {entry.sleepTime && (
        <div className="flex justify-between text-xs py-1">
          <span className="text-slate-400">Sleep</span>
          <span className={`font-medium ${entry.sleepOnTime ? 'text-brand-500' : 'text-red-400'}`}>
            {entry.sleepTime} {entry.sleepOnTime ? '✓' : `+${entry.minsLate}m`}
          </span>
        </div>
      )}
    </div>
  )
}

export default function History() {
  const { currentUser } = useAuth()
  const { entries } = useHabits()
  const [month, setMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const days = useMemo(() => eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }), [month])
  const dateKeys = useMemo(() => days.map(d => format(d, 'yyyy-MM-dd')), [days])
  const monthEntries = useMemo(() => entries.filter(e => dateKeys.includes(e.date)), [entries, dateKeys])

  const lineData = useMemo(() => days.map(d => {
    const dk = format(d, 'yyyy-MM-dd')
    const e = entries.find(x => x.date === dk)
    return { day: format(d,'d'), pct: e ? computeCompletion(e) : null }
  }), [entries, days])

  const sleepData = useMemo(() => days.map(d => {
    const dk = format(d, 'yyyy-MM-dd')
    const e = entries.find(x => x.date === dk)
    if (!e?.sleepTime) return { day: format(d,'d'), val: null, onTime: false }
    const [h,m] = e.sleepTime.split(':').map(Number)
    let v = h + m/60; if (v < 5) v += 24
    return { day: format(d,'d'), val: v, onTime: e.sleepOnTime }
  }), [entries, days])

  const summaryRows = useMemo(() => {
    const total = monthEntries.length
    return HABIT_FIELDS.filter(f => f.key !== 'sleepOnTime').map(f => {
      const done = f.type === 'bool'
        ? monthEntries.filter(e => e[f.key]).length
        : f.type === 'water'
          ? monthEntries.filter(e => (parseFloat(e[f.key]) || 0) >= (f.target || 3.0)).length
          : monthEntries.filter(e => (e[f.key]||0) > 0).length
      const pct = total ? Math.round((done/total)*100) : 0
      return { ...f, done, missed: total-done, pct }
    })
  }, [monthEntries])

  const selectedEntry = entries.find(e => e.date === selectedDate) || null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-white">History & Reports</h1>
        <div className="flex gap-2">
          <button onClick={() => downloadWeeklyReport(currentUser.displayName, entries)}
            className="btn-secondary flex items-center gap-2 text-sm"><Download size={14}/> Weekly</button>
          <button onClick={() => downloadMonthlyReport(currentUser.displayName, entries, month)}
            className="btn-primary flex items-center gap-2 text-sm"><Download size={14}/> Monthly</button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setMonth(m => subMonths(m,1))} className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><ChevronLeft size={18}/></button>
        <span className="font-semibold text-white min-w-[120px] text-center">{format(month,'MMMM yyyy')}</span>
        <button onClick={() => setMonth(m => addMonths(m,1))} disabled={month >= startOfMonth(new Date())}
          className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronRight size={18}/></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <p className="section-label mb-4">Calendar</p>
          <CalendarHeatmap entries={entries} month={month} onDayClick={setSelectedDate} selectedDate={selectedDate} />
        </Card>
        <Card className="p-5 overflow-y-auto max-h-96">
          <p className="section-label mb-4">Day Detail</p>
          <DayDetail entry={selectedEntry} date={selectedDate} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
          <p className="section-label mb-3">Daily Completion %</p>
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
        <Card className="p-5">
          <p className="section-label mb-3">Sleep Times</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={sleepData} barSize={6}>
              <XAxis dataKey="day" tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false} interval={4}/>
              <YAxis hide domain={[20,26]}/>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,fontSize:12}}/>
              <ReferenceLine y={22.5} stroke="#1D9E75" strokeDasharray="4 2"/>
              <Bar dataKey="val" radius={[2,2,0,0]}>
                {sleepData.map((d,i)=><Cell key={i} fill={d.onTime?'#1D9E75':d.val?'#E24B4A':'#334155'}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <p className="section-label mb-4">Monthly Summary</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-700">
                {['Habit','Done','Missed','%','vs 85%'].map(h=>(
                  <th key={h} className="pb-2 section-label pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaryRows.map(r=>(
                <tr key={r.key} className="border-b border-slate-700/40 hover:bg-slate-700/20">
                  <td className="py-2 text-slate-300">{r.label}</td>
                  <td className="py-2 text-right text-brand-500 font-medium pr-4">{r.done}</td>
                  <td className="py-2 text-right text-red-400 font-medium pr-4">{r.missed}</td>
                  <td className="py-2 text-right font-semibold text-white pr-4">{r.pct}%</td>
                  <td className="py-2 text-right">{r.pct>=85?'✓':'✗'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
