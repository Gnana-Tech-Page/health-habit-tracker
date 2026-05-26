import { format, differenceInCalendarDays, startOfDay, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useRef } from 'react'

export default function DateNavigator({ selectedDate, onBack, onForward, onJump, canGoBack, canGoForward }) {
  const pickerRef = useRef(null)
  const today     = startOfDay(new Date())
  const diff      = differenceInCalendarDays(today, selectedDate)

  const relativeLabel = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : `${diff} days ago`
  const labelColor    = diff === 0 ? 'text-brand-500' : diff <= 3 ? 'text-amber-400' : 'text-slate-500'

  const minDate    = format(subDays(today, 30), 'yyyy-MM-dd')
  const maxDate    = format(today, 'yyyy-MM-dd')
  const currentVal = format(selectedDate, 'yyyy-MM-dd')

  const btnBase     = 'w-9 h-9 rounded-full flex items-center justify-center transition-all'
  const btnActive   = 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
  const btnDisabled = 'bg-slate-800 text-slate-600 opacity-40 cursor-not-allowed'

  return (
    <div className="flex items-center bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
      <button onClick={onBack} disabled={!canGoBack}
        className={`${btnBase} ${canGoBack ? btnActive : btnDisabled}`}
        aria-label="Previous day">
        <ChevronLeft size={18} />
      </button>

      <div className="text-center flex-1 mx-3 min-w-0">
        <p className="text-white font-semibold text-base leading-tight truncate">
          {format(selectedDate, 'EEEE, d MMM yyyy')}
        </p>
        <p className={`text-xs mt-0.5 font-medium ${labelColor}`}>{relativeLabel}</p>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onForward} disabled={!canGoForward}
          className={`${btnBase} ${canGoForward ? btnActive : btnDisabled}`}
          aria-label="Next day">
          <ChevronRight size={18} />
        </button>

        <button
          onClick={() => pickerRef.current?.showPicker?.() ?? pickerRef.current?.click()}
          className={`${btnBase} bg-brand-500 hover:bg-brand-700 text-white`}
          aria-label="Pick a date">
          <Calendar size={16} />
        </button>

        {/* Hidden native date picker */}
        <input ref={pickerRef} type="date"
          min={minDate} max={maxDate} value={currentVal}
          onChange={e => e.target.value && onJump(e.target.value)}
          className="sr-only" aria-hidden="true" tabIndex={-1} />
      </div>
    </div>
  )
}
