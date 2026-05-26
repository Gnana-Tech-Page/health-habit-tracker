const SIZES = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' }

const PALETTE = ['#6366F1','#0ea5e9','#10b981','#F59E0B','#E24B4A','#8B5CF6','#EC4899','#14b8a6']

export function deriveAvatarColor(seed = '') {
  let h = 0
  for (const c of seed) h = ((h << 5) - h + c.charCodeAt(0)) | 0
  return PALETTE[Math.abs(h) % PALETTE.length]
}

export function getInitials(displayName) {
  if (!displayName) return '?'
  return displayName.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

export default function Avatar({ user, size = 'md' }) {
  const cls = SIZES[size] || SIZES.md

  // Show Google profile picture when available
  if (user?.photoURL) {
    return (
      <img src={user.photoURL} alt={user.displayName || 'User'}
        referrerPolicy="no-referrer"
        className={`${cls} rounded-full object-cover flex-shrink-0 select-none`} />
    )
  }

  const initials = getInitials(user?.displayName)
  const color    = deriveAvatarColor(user?.email || user?.uid || '')
  return (
    <div className={`${cls} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 select-none`}
      style={{ backgroundColor: color }}>
      {initials}
    </div>
  )
}
