import { useRef, useState } from 'react'

export default function NumberStepper({ label, value, onChange, unit = '', min = 0, max = 999 }) {
  const [inputVal, setInputVal] = useState(String(value))
  const focused = useRef(false)

  // Sync when parent changes the value (e.g. loading a saved entry) but not while the user is typing
  if (!focused.current && String(value) !== inputVal) {
    setInputVal(String(value))
  }

  const clamp = n => Math.max(min, Math.min(max, Math.round(n) || 0))

  function commit(raw) {
    const next = clamp(parseInt(raw, 10))
    setInputVal(String(next))
    onChange(next)
  }

  function handleMinus() {
    const next = clamp(value - 1)
    setInputVal(String(next))
    onChange(next)
  }

  function handlePlus() {
    const next = clamp(value + 1)
    setInputVal(String(next))
    onChange(next)
  }

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={handleMinus}
          className="w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center text-slate-200 font-bold text-lg transition-colors">
          −
        </button>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputVal}
          onFocus={() => { focused.current = true }}
          onBlur={() => { focused.current = false; commit(inputVal) }}
          onChange={e => setInputVal(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
          className="w-14 text-center text-lg font-bold text-white bg-slate-700 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        {unit && <span className="text-xs text-slate-400 w-6">{unit}</span>}

        <button type="button" onClick={handlePlus}
          className="w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-700 flex items-center justify-center text-white font-bold text-lg transition-colors">
          +
        </button>
      </div>
    </div>
  )
}
