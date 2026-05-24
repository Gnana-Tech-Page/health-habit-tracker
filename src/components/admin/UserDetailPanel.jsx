import { useMemo } from 'react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { X, Calendar, Clock, Activity, Flame } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import { getHabitsForUser } from '../../utils/storage'
import { computeCompletion, computeStreak, getWeekEntries } from '../../utils/habitHelpers'

export default function UserDetailPanel({ user, onClose, onResetPassword, onDelete, currentUserId }) {
  const entries = useMemo(() => user ? getHabitsForUser(user.id) : [], [user?.id])
  const weekEntries = useMemo(() => user ? getWeekEntries(entries).filter(Boolean) : [], [entries])
  const weekPct = weekEntries.length ? Math.round(weekEntries.reduce((s,e)=>s+computeCompletion(e),0)/weekEntries.length) : 0
  const { current: streak } = useMemo(() => computeStreak(entries), [entries])

  const isActive = user?.lastLogin && differenceInDays(new Date(), parseISO(user.lastLogin)) <= 7
  const canDelete = user && user.id !== currentUserId

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
              {/* Identity */}
              <div className="flex items-center gap-4">
                <Avatar user={user} size="lg" />
                <div>
                  <p className="font-heading font-semibold text-white text-lg">{user.displayName}</p>
                  <p className="text-slate-400 text-sm">@{user.username}</p>
                  <div className="flex gap-2 mt-1.5">
                    <Badge variant={user.role === 'admin' ? 'admin' : 'user'}>{user.role}</Badge>
                    <Badge variant={isActive ? 'active' : 'inactive'}>{isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Calendar size={14}/>, label: 'Member since', val: format(parseISO(user.createdAt), 'MMM d, yyyy') },
                  { icon: <Clock size={14}/>, label: 'Last login', val: user.lastLogin ? format(parseISO(user.lastLogin), 'MMM d, HH:mm') : 'Never' },
                  { icon: <Activity size={14}/>, label: 'Login count', val: user.loginCount || 0 },
                  { icon: <Activity size={14}/>, label: 'Habit entries', val: entries.length },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="bg-slate-700/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">{icon}{label}</div>
                    <p className="font-semibold text-white text-sm">{val}</p>
                  </div>
                ))}
              </div>

              {/* Habit stats */}
              <div className="bg-slate-700/50 rounded-xl p-4 space-y-3">
                <p className="section-label">This Week's Stats</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Avg Completion</span>
                  <span className="font-bold text-white">{weekPct}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-1.5">
                  <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${weekPct}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 flex items-center gap-1"><Flame size={13}/> Current Streak</span>
                  <span className="font-bold text-amber-400">{streak}d</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-slate-700 space-y-2">
              <button onClick={() => onResetPassword(user)}
                className="w-full btn-secondary text-sm">
                Reset Password
              </button>
              {canDelete && (
                <button onClick={() => onDelete(user)}
                  className="w-full btn-danger text-sm">
                  Delete User
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
