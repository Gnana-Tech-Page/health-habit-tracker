import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Calendar, User, LogOut, ShieldCheck, Users, Activity } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'

function NavItem({ to, icon, label, onClick }) {
  const base = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full'
  const active   = 'bg-sky-500/20 text-sky-300 border border-sky-500/20'
  const inactive = 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
  if (!to) return (
    <button onClick={onClick} className={`${base} ${inactive}`}>{icon}<span>{label}</span></button>
  )
  return (
    <NavLink to={to} onClick={onClick} className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
      {icon}<span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() { logout(); navigate('/login') }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-20 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-700">
          <div className="w-8 h-8 bg-sky-500/20 border border-sky-500/30 rounded-lg flex items-center justify-center">
            <Activity size={16} className="text-sky-400" />
          </div>
          <span className="font-heading font-semibold text-white text-lg">HealthTrack</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavItem to="/dashboard" icon={<Home size={17}/>} label="Dashboard" onClick={onClose} />
          <NavItem to="/history"   icon={<Calendar size={17}/>} label="History & Reports" onClick={onClose} />
          <NavItem to="/profile"   icon={<User size={17}/>} label="Profile" onClick={onClose} />
          {currentUser?.role === 'admin' && (
            <>
              <div className="pt-3 pb-1 px-3">
                <span className="section-label">Admin</span>
              </div>
              <NavItem to="/admin"       icon={<ShieldCheck size={17}/>} label="Overview" onClick={onClose} />
              <NavItem to="/admin/users" icon={<Users size={17}/>}       label="Users"    onClick={onClose} />
            </>
          )}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-slate-700/40">
            <Avatar user={currentUser} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{currentUser?.displayName}</p>
              <p className="text-xs text-slate-500 truncate">@{currentUser?.username}</p>
            </div>
          </div>
          <NavItem icon={<LogOut size={17}/>} label="Logout" onClick={handleLogout} />
        </div>
      </aside>
    </>
  )
}
