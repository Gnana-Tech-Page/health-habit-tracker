import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay } from 'date-fns'
import { computeCompletion } from '../../utils/habitHelpers'

function pctClass(pct) {
  if (pct === 0) return 'bg-slate-700 text-slate-600 hover:bg-slate-600'
  if (pct < 50) return 'bg-amber-900/60 text-amber-500 hover:bg-amber-900'
  if (pct < 80) return 'bg-brand-900/60 text-brand-400 hover:bg-brand-900/80'
  return 'bg-brand-500 text-white hover:bg-brand-700'
}

export default function CalendarHeatmap({ entries, month, onDayClick, selectedDate }) {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const days = eachDayOfInterval({ start, end })
  const startDow = (getDay(start) + 6) % 7

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
          <div key={d} className="text-center text-xs text-slate-600 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDow }).map((_, i) => <div key={`e${i}`} />)}
        {days.map(day => {
          const dk = format(day, 'yyyy-MM-dd')
          const entry = entries.find(e => e.date === dk)
          const pct = entry ? computeCompletion(entry) : 0
          const isSelected = dk === selectedDate
          return (
            <button key={dk} onClick={() => onDayClick?.(dk)} title={`${format(day,'d MMM')} — ${pct}%`}
              className={`aspect-square flex items-center justify-center text-xs font-medium rounded-lg transition-all hover:scale-105 ${pctClass(pct)} ${isSelected ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-800' : ''}`}>
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
      <div className="flex gap-3 mt-3 flex-wrap">
        {[['bg-slate-700','No data'],['bg-amber-900/60','1–49%'],['bg-brand-900/60','50–79%'],['bg-brand-500','80–100%']].map(([cls,label]) => (
          <div key={label} className="flex items-center gap-1 text-xs text-slate-500">
            <div className={`w-3 h-3 rounded ${cls}`}/>{label}
          </div>
        ))}
      </div>
    </div>
  )
}
