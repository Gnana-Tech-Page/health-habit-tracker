import { computeSleepStatus } from '../../utils/habitHelpers'
import { CheckCircle, XCircle } from 'lucide-react'

export default function SleepInput({ value, onChange }) {
  const { onTime, minsLate } = value ? computeSleepStatus(value) : { onTime: false, minsLate: 0 }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-gray-700">Sleep Time</span>
        <input
          type="time"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      {value && (
        <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ${onTime ? 'bg-brand-50 text-brand-700' : 'bg-danger-100 text-danger-500'}`}>
          {onTime
            ? <><CheckCircle size={14} /> On time (target 10:30 PM)</>
            : <><XCircle size={14} /> Late by {minsLate} min{minsLate !== 1 ? 's' : ''} (target 10:30 PM)</>
          }
        </div>
      )}
    </div>
  )
}
