export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-700 text-slate-300',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger:  'bg-red-500/20 text-red-400 border border-red-500/30',
    admin:   'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    user:    'bg-sky-500/20 text-sky-300 border border-sky-500/30',
    active:  'bg-emerald-500/20 text-emerald-400',
    inactive:'bg-slate-700 text-slate-500',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>
      {children}
    </span>
  )
}
