import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from 'recharts'
import { format, startOfWeek, addDays } from 'date-fns'

function toDecimal(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  const v = h + m / 60
  return v < 5 ? v + 24 : v
}

const TT = ({ active, payload, label }) => active && payload?.length && payload[0].value ? (
  <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
    <p className="text-slate-400">{label}</p>
    <p className="text-white font-medium">{(() => { const v = payload[0].value % 24; const h = Math.floor(v); const m = Math.round((v%1)*60); return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}` })()}</p>
  </div>
) : null

export default function SleepChart({ entries }) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = format(addDays(start, i), 'yyyy-MM-dd')
    const e = entries.find(x => x.date === date)
    return { day: format(addDays(start, i), 'EEE'), val: e?.sleepTime ? toDecimal(e.sleepTime) : null, onTime: e?.sleepOnTime }
  })
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} barSize={24}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis hide domain={[20, 26]} />
        <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <ReferenceLine y={22.5} stroke="#1D9E75" strokeDasharray="4 2" strokeWidth={1.5} />
        <Bar dataKey="val" radius={[4,4,0,0]}>
          {data.map((d, i) => <Cell key={i} fill={d.onTime ? '#1D9E75' : d.val ? '#E24B4A' : '#334155'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
