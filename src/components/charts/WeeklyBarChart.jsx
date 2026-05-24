import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from 'recharts'
import { format, startOfWeek, addDays } from 'date-fns'
import { computeCompletion } from '../../utils/habitHelpers'

const TT = ({ active, payload }) => active && payload?.length ? (
  <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
    <p className="text-white font-medium">{payload[0].value}%</p>
  </div>
) : null

export default function WeeklyBarChart({ entries }) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = format(addDays(start, i), 'yyyy-MM-dd')
    const entry = entries.find(e => e.date === date)
    return { day: format(addDays(start, i), 'EEE'), pct: entry ? computeCompletion(entry) : 0 }
  })
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} barSize={24}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis hide domain={[0, 100]} />
        <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <ReferenceLine y={80} stroke="#1D9E75" strokeDasharray="4 2" strokeWidth={1.5} />
        <Bar dataKey="pct" radius={[4,4,0,0]}>
          {data.map((d, i) => <Cell key={i} fill={d.pct >= 80 ? '#1D9E75' : d.pct >= 50 ? '#F59E0B' : '#334155'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
