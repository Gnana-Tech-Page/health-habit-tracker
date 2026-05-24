import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Calendar, User, LogOut, ShieldCheck, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'

function NavItem({ to, icon, label, onClick }) {
  const base = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors'
  const active = 'bg-brand-500 text-white'
  const inactive = 'text-gray-500 hover:bg-gray-100 hover:text-navy'
  if (!to) return (
    <button onClick={onClick} className={`${base} ${inactive} w-full`}>
      {icon}<span>{label}</span>
    </button>
  )
  return (
    <NavLink to={to} onClick={onClick} className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
      {icon}<span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-20 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="h-16 flex items-center px-5 gap-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm font-heading">HT</span>
          </div>
          <span className="font-heading font-semibold text-navy text-lg">HealthTrack</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavItem to="/dashboard" icon={<Home size={18}/>} label="Dashboard" onClick={onClose} />
          <NavItem to="/history" icon={<Calendar size={18}/>} label="History & Reports" onClick={onClose} />
          <NavItem to="/profile" icon={<User size={18}/>} label="Profile" onClick={onClose} />
          {user?.role === 'admin' && (
            <>
              <div className="pt-3 pb-1 px-3">
                <span className="uppercase tracking-widest text-xs font-semibold text-gray-400">Admin</span>
              </div>
              <NavItem to="/admin" icon={<ShieldCheck size={18}/>} label="Admin Panel" onClick={onClose} />
              <NavItem to="/admin/users" icon={<Users size={18}/>} label="All Users" onClick={onClose} />
            </>
          )}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar user={user} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-navy truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <NavItem icon={<LogOut size={18}/>} label="Logout" onClick={handleLogout} />
        </div>
      </aside>
    </>
  )
}
