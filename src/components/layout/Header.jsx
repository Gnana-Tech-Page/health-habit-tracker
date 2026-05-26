import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { Menu, User, LogOut, Activity } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../context/AuthContext'

export default function Header({ onMenuToggle }) {
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() { await signOut(); navigate('/login') }

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-30">
      <button onClick={onMenuToggle} className="lg:hidden text-slate-400 hover:text-slate-200 p-1">
        <Menu size={22} />
      </button>
      <div className="flex items-center gap-2 flex-1">
        <div className="w-7 h-7 bg-sky-500/20 border border-sky-500/30 rounded-lg flex items-center justify-center lg:hidden">
          <Activity size={14} className="text-sky-400" />
        </div>
        <span className="font-heading font-semibold text-white hidden sm:block lg:hidden">HealthTrack</span>
      </div>
      <span className="text-sm text-slate-500 hidden md:block">{format(new Date(), 'EEEE, MMMM d')}</span>

      {/* User dropdown */}
      <div className="relative" ref={ref}>
        <button onClick={() => setDropOpen(d => !d)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-700 transition-colors">
          <Avatar user={currentUser} size="sm" />
          <span className="text-sm font-medium text-slate-200 hidden sm:block">{currentUser?.displayName?.split(' ')[0]}</span>
        </button>
        {dropOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 py-1 z-50 animate-fade-in">
            <div className="px-4 py-2.5 border-b border-slate-700">
              <p className="text-sm font-medium text-white truncate">{currentUser?.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
            </div>
            <Link to="/profile" onClick={() => setDropOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <User size={15}/> Profile
            </Link>
            <div className="border-t border-slate-700 mt-1 pt-1">
              <button onClick={handleLogout}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors">
                <LogOut size={15}/> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
