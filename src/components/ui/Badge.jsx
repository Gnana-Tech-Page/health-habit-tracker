export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-brand-50 text-brand-700',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-danger-100 text-danger-500',
    admin: 'bg-indigo-100 text-indigo-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
