import { format } from 'date-fns'
import { Bell, Menu } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../context/AuthContext'

export default function Header({ onMenuToggle }) {
  const { user } = useAuth()
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-30">
      <button onClick={onMenuToggle} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
        <Menu size={22} />
      </button>
      <div className="flex items-center gap-2 flex-1">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm font-heading">HT</span>
        </div>
        <span className="font-heading font-semibold text-navy hidden sm:block">HealthTrack</span>
      </div>
      <span className="text-sm text-gray-400 hidden md:block">{format(new Date(), 'EEEE, MMMM d')}</span>
      <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50">
        <Bell size={18} />
      </button>
      <div className="flex items-center gap-2">
        <Avatar user={user} size="sm" />
        <span className="text-sm font-medium text-navy hidden sm:block">{user?.name?.split(' ')[0]}</span>
      </div>
    </header>
  )
}
