export function getInitials(displayName, username) {
  if (displayName) return displayName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
  return (username || '?').slice(0, 2).toUpperCase()
}

export default function Avatar({ user, size = 'md' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' }
  const initials = getInitials(user?.displayName, user?.username)
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 select-none`}
      style={{ backgroundColor: user?.avatarColor || '#6366F1' }}
    >
      {initials}
    </div>
  )
}
