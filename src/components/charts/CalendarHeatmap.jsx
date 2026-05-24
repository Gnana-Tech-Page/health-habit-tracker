import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay } from 'date-fns'
import { computeCompletion } from '../../utils/habitHelpers'

function pctColor(pct) {
  if (pct === 0) return 'bg-gray-100 text-gray-400'
  if (pct < 50) return 'bg-amber-100 text-amber-700'
  if (pct < 80) return 'bg-brand-100 text-brand-700'
  return 'bg-brand-500 text-white'
}

export default function CalendarHeatmap({ entries, month, onDayClick, selectedDate }) {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const days = eachDayOfInterval({ start, end })
  const startDow = (getDay(start) + 6) % 7 // Mon=0

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDow }).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(day => {
          const dk = format(day, 'yyyy-MM-dd')
          const entry = entries.find(e => e.date === dk)
          const pct = entry ? computeCompletion(entry) : 0
          const isSelected = dk === selectedDate
          return (
            <button
              key={dk}
              onClick={() => onDayClick?.(dk)}
              title={`${format(day, 'd MMM')} — ${pct}%`}
              className={`aspect-square flex items-center justify-center text-xs font-medium rounded-lg transition-all hover:scale-105 ${pctColor(pct)} ${isSelected ? 'ring-2 ring-navy ring-offset-1' : ''}`}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
      <div className="flex gap-3 mt-3 flex-wrap">
        {[['bg-gray-100','No data'],['bg-amber-100','1–49%'],['bg-brand-100','50–79%'],['bg-brand-500','80–100%']].map(([cls, label]) => (
          <div key={label} className="flex items-center gap-1 text-xs text-gray-500">
            <div className={`w-3 h-3 rounded ${cls}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
