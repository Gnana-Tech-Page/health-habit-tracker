import { format, differenceInDays } from 'date-fns'
import { X, Calendar, Clock, Activity, LogIn } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

function ts(val, fmt = 'MMM d, yyyy') {
  if (!val) return '—'
  const d = val?.toDate ? val.toDate() : new Date(val)
  return format(d, fmt)
}

function isActive(user) {
  if (!user?.lastLogin) return false
  const d = user.lastLogin?.toDate ? user.lastLogin.toDate() : new Date(user.lastLogin)
  return differenceInDays(new Date(), d) <= 7
}

export default function UserDetailPanel({ user, onClose }) {
  const active = isActive(user)

  return (
    <>
      {user && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-800 border-l border-slate-700 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${user ? 'translate-x-0' : 'translate-x-full'}`}>
        {user && (
          <>
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h3 className="font-heading font-semibold text-white">User Detail</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="flex items-center gap-4">
                <Avatar user={user} size="lg" />
                <div>
                  <p className="font-heading font-semibold text-white text-lg">{user.displayName}</p>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <Badge variant={user.role === 'admin' ? 'admin' : 'user'}>{user.role}</Badge>
                    <Badge variant={user.disabled ? 'inactive' : (active ? 'active' : 'inactive')}>
                      {user.disabled ? 'Disabled' : (active ? 'Active' : 'Inactive')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Calendar size={14}/>, label: 'Member since', val: ts(user.createdAt) },
                  { icon: <Clock size={14}/>,    label: 'Last login',   val: ts(user.lastLogin, 'MMM d, HH:mm') },
                  { icon: <LogIn size={14}/>,    label: 'Login count',  val: user.loginCount ?? 0 },
                  { icon: <Activity size={14}/>, label: 'UID',          val: user.uid?.slice(0, 8) + '…' },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="bg-slate-700/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">{icon}{label}</div>
                    <p className="font-semibold text-white text-sm">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
