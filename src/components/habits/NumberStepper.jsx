export default function NumberStepper({ label, value, onChange, unit = '', step = 1, min = 0, max = 999 }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg transition-colors"
        >−</button>
        <div className="text-center min-w-[3rem]">
          <span className="text-lg font-bold text-navy">{value}</span>
          {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-700 flex items-center justify-center text-white font-bold text-lg transition-colors"
        >+</button>
      </div>
    </div>
  )
}
