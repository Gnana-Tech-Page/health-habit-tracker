import { useMemo } from 'react'
import { format } from 'date-fns'
import { LogOut, Calendar, Clock, Activity, Flame, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { useHabits } from '../context/HabitContext'
import { computeStreak, sleepOnTimeRate } from '../utils/habitHelpers'

function ts(val) {
  if (!val) return '—'
  // Firestore Timestamp object
  if (val?.toDate) return format(val.toDate(), 'MMM d, yyyy')
  return format(new Date(val), 'MMM d, yyyy')
}

export default function Profile() {
  const { currentUser, signOut } = useAuth()
  const { entries } = useHabits()
  const navigate = useNavigate()

  const { current: streak } = useMemo(() => computeStreak(entries), [entries])
  const sleepRate = useMemo(() => sleepOnTimeRate(entries), [entries])

  async function handleSignOut() { await signOut(); navigate('/login') }

  const meta = [
    { icon: <Calendar size={14}/>, label: 'Member since', val: ts(currentUser?.createdAt) },
    { icon: <Clock size={14}/>,    label: 'Last login',   val: ts(currentUser?.lastLogin) },
    { icon: <Activity size={14}/>, label: 'Login count',  val: currentUser?.loginCount ?? 0 },
    { icon: <Activity size={14}/>, label: 'Entries logged', val: entries.length },
  ]

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="font-heading font-bold text-2xl text-white">Profile</h1>

      <Card className="p-6 space-y-5">
        {/* Identity */}
        <div className="flex items-center gap-4 pb-5 border-b border-slate-700">
          <Avatar user={currentUser} size="xl" />
          <div>
            <p className="font-heading font-semibold text-white text-xl">{currentUser?.displayName}</p>
            <p className="text-slate-400 text-sm">{currentUser?.email}</p>
            <Badge className="mt-2" variant={currentUser?.role === 'admin' ? 'admin' : 'user'}>
              {currentUser?.role}
            </Badge>
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3">
          {meta.map(({ icon, label, val }) => (
            <div key={label} className="bg-slate-700/40 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">{icon}{label}</div>
              <p className="text-sm font-semibold text-slate-200">{val}</p>
            </div>
          ))}
        </div>

        {/* Habit stats */}
        <div className="bg-slate-700/40 rounded-xl p-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Current Streak</p>
            <p className="text-2xl font-bold font-heading text-amber-400 flex items-center gap-1">
              <Flame size={18}/> {streak}d
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Sleep On Time</p>
            <p className="text-2xl font-bold font-heading text-brand-500">{sleepRate}%</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 text-center">
          Your name and photo are managed by your Google account.{' '}
          <a href="https://myaccount.google.com" target="_blank" rel="noopener noreferrer"
            className="text-sky-500 hover:text-sky-400 inline-flex items-center gap-1">
            Manage <ExternalLink size={11}/>
          </a>
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="font-heading font-semibold text-white mb-4">Account</h3>
        <button onClick={handleSignOut} className="btn-danger w-full flex items-center justify-center gap-2">
          <LogOut size={16}/> Sign Out
        </button>
      </Card>
    </div>
  )
}
