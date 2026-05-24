import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Calendar, User, ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function BottomNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const base = 'flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium'
  const active = 'text-brand-500'
  const inactive = 'text-gray-400'

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around z-30 pb-safe">
      <NavLink to="/dashboard" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <Home size={20} /><span>Home</span>
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <Calendar size={20} /><span>History</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <User size={20} /><span>Profile</span>
      </NavLink>
      {user?.role === 'admin' && (
        <NavLink to="/admin" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <ShieldCheck size={20} /><span>Admin</span>
        </NavLink>
      )}
      <button className={`${base} ${inactive}`} onClick={() => { logout(); navigate('/login') }}>
        <LogOut size={20} /><span>Logout</span>
      </button>
    </nav>
  )
}
