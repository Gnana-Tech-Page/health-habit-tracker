import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from 'recharts'
import { format, startOfWeek, addDays } from 'date-fns'

function timeToDecimal(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

export default function SleepChart({ entries }) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = format(addDays(start, i), 'yyyy-MM-dd')
    const entry = entries.find(e => e.date === date)
    const val = entry?.sleepTime ? timeToDecimal(entry.sleepTime) : 0
    // Normalize: times after midnight get +24 for display
    const display = val > 0 && val < 5 ? val + 24 : val
    return { day: format(addDays(start, i), 'EEE'), val: display || null, onTime: entry?.sleepOnTime }
  })

  const formatTick = (v) => {
    if (!v) return ''
    const h = Math.floor(v % 24)
    const m = Math.round((v % 1) * 60)
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} barSize={24}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis hide domain={[20, 26]} />
        <Tooltip formatter={(v) => [formatTick(v), 'Sleep Time']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <ReferenceLine y={22.5} stroke="#1D9E75" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: '10:30', fill: '#1D9E75', fontSize: 10 }} />
        <Bar dataKey="val" radius={[4,4,0,0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.onTime ? '#1D9E75' : d.val ? '#E24B4A' : '#E5E7EB'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
