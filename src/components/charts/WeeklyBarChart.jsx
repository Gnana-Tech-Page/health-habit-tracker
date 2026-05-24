import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from 'recharts'
import { format, startOfWeek, addDays } from 'date-fns'
import { computeCompletion } from '../../utils/habitHelpers'

export default function WeeklyBarChart({ entries }) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = format(addDays(start, i), 'yyyy-MM-dd')
    const entry = entries.find(e => e.date === date)
    const pct = entry ? computeCompletion(entry) : 0
    return { day: format(addDays(start, i), 'EEE'), pct }
  })

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} barSize={24}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis hide domain={[0, 100]} />
        <Tooltip formatter={(v) => [`${v}%`, 'Completion']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <ReferenceLine y={80} stroke="#1D9E75" strokeDasharray="4 2" strokeWidth={1.5} />
        <Bar dataKey="pct" radius={[4,4,0,0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.pct >= 80 ? '#1D9E75' : d.pct >= 50 ? '#F59E0B' : '#E5E7EB'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
