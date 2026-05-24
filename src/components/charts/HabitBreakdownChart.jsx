import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { HABIT_FIELDS } from '../../utils/habitHelpers'

const TT = ({ active, payload }) => active && payload?.length ? (
  <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
    <p className="text-white font-medium">{payload[0].value}%</p>
  </div>
) : null

export default function HabitBreakdownChart({ entries }) {
  const today = new Date().toISOString().slice(0, 10)
  const todayEntries = entries.filter(e => e.date === today)
  const total = todayEntries.length || 1
  const data = HABIT_FIELDS
    .filter(f => f.key !== 'sleepOnTime')
    .map(f => {
      const done = f.type === 'bool'
        ? todayEntries.filter(e => e[f.key]).length
        : todayEntries.filter(e => (e[f.key] || 0) > 0).length
      return { name: f.label.length > 14 ? f.label.slice(0,13)+'…' : f.label, pct: Math.round((done/total)*100) }
    }).sort((a, b) => b.pct - a.pct)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" barSize={14} margin={{ left: 8, right: 24 }}>
        <XAxis type="number" domain={[0,100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={110} axisLine={false} tickLine={false} />
        <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="pct" radius={[0,4,4,0]}>
          {data.map((d, i) => <Cell key={i} fill={d.pct >= 80 ? '#1D9E75' : d.pct >= 50 ? '#F59E0B' : '#E24B4A'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
