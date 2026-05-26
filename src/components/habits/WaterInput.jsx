import { useState, useRef } from 'react'

const WATER_TARGET = 3.0
const WATER_STEP   = 0.25

function getStatus(liters) {
  if (!liters || liters <= 0)   return 'empty'
  if (liters >= WATER_TARGET)   return 'ok'
  if (liters >= WATER_TARGET * 0.6) return 'warn'  // 1.8 L threshold
  return 'low'
}

export default function WaterInput({ label = 'Water Intake', value, onChange }) {
  const liters  = parseFloat(value) || 0
  const status  = getStatus(liters)
  const barPct  = Math.min(100, (liters / WATER_TARGET) * 100)
  const focused = useRef(false)

  const [inputVal, setInputVal] = useState(liters > 0 ? String(liters) : '')

  // Sync when parent changes value (e.g. day navigation) while not typing
  if (!focused.current) {
    const expected = liters > 0 ? String(liters) : ''
    if (inputVal !== expected) setInputVal(expected)
  }

  const badge = liters <= 0
    ? ''
    : liters >= WATER_TARGET
      ? '✓ Goal met'
      : `${(WATER_TARGET - liters).toFixed(2).replace(/\.?0+$/, '')}L to go`

  function commit(raw) {
    const parsed  = parseFloat(raw) || 0
    const rounded = Math.round(Math.max(0, parsed) * 100) / 100
    setInputVal(rounded > 0 ? String(rounded) : '')
    onChange(rounded)
  }

  function adjust(delta) {
    const next = Math.round(Math.max(0, liters + delta) * 100) / 100
    setInputVal(next > 0 ? String(next) : '')
    onChange(next)
  }

  const inputRing = {
    empty: 'bg-slate-700',
    ok:    'bg-brand-500/10 ring-1 ring-brand-500',
    warn:  'bg-amber-500/10 ring-1 ring-amber-400',
    low:   'bg-red-500/10   ring-1 ring-red-400',
  }
  const barColor = { empty: 'bg-slate-600', ok: 'bg-brand-500', warn: 'bg-amber-400', low: 'bg-red-400' }
  const badgeColor = {
    ok:   'bg-brand-500/20 text-brand-400',
    warn: 'bg-amber-400/20 text-amber-400',
    low:  'bg-red-400/20   text-red-400',
  }

  return (
    <div className="py-2 space-y-2">
      {/* Stepper row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => adjust(-WATER_STEP)}
            className="w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center text-slate-200 font-bold text-lg transition-colors">
            −
          </button>

          <input
            type="text"
            inputMode="decimal"
            value={inputVal}
            placeholder="0"
            onFocus={() => { focused.current = true }}
            onBlur={() => { focused.current = false; commit(inputVal) }}
            onChange={e => setInputVal(e.target.value.replace(/[^0-9.]/g, ''))}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
            className={`w-14 text-center text-lg font-bold text-white rounded-lg py-1 focus:outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${inputRing[status]}`}
            aria-label="Water intake in litres"
          />

          <span className="text-xs text-slate-400 w-3">L</span>

          <button type="button" onClick={() => adjust(WATER_STEP)}
            className="w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-700 flex items-center justify-center text-white font-bold text-lg transition-colors">
            +
          </button>
        </div>
      </div>

      {/* Progress bar + badge */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${barColor[status]}`}
            style={{ width: `${barPct}%` }} />
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap">{WATER_TARGET}L</span>
        {badge && (
          <span className={`text-xs font-medium rounded-full px-2 py-0.5 whitespace-nowrap ${badgeColor[status] || ''}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}
