import { computeSleepStatus } from '../../utils/habitHelpers'
import { CheckCircle, XCircle } from 'lucide-react'

export default function SleepInput({ value, onChange }) {
  const { onTime, minsLate } = value ? computeSleepStatus(value) : { onTime: false, minsLate: 0 }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-slate-300">Sleep Time</span>
        <input type="time" value={value || ''} onChange={e => onChange(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-slate-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 [color-scheme:dark]" />
      </div>
      {value && (
        <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ${onTime ? 'bg-brand-500/20 text-brand-200' : 'bg-red-500/20 text-red-400'}`}>
          {onTime
            ? <><CheckCircle size={14}/> On time (target 10:30 PM)</>
            : <><XCircle size={14}/> Late by {minsLate} min{minsLate !== 1 ? 's' : ''} (target 10:30 PM)</>}
        </div>
      )}
    </div>
  )
}
