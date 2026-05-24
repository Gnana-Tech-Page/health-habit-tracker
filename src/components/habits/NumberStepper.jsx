export default function NumberStepper({ label, value, onChange, unit = '', step = 1, min = 0, max = 999 }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center text-slate-200 font-bold text-lg transition-colors">
          −
        </button>
        <div className="text-center min-w-[3rem]">
          <span className="text-lg font-bold text-white">{value}</span>
          {unit && <span className="text-xs text-slate-400 ml-1">{unit}</span>}
        </div>
        <button type="button" onClick={() => onChange(Math.min(max, value + step))}
          className="w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-700 flex items-center justify-center text-white font-bold text-lg transition-colors">
          +
        </button>
      </div>
    </div>
  )
}
