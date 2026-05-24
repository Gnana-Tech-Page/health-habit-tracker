import { useState, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { Link } from 'react-router-dom'
import { Users, Activity, BarChart2, BookOpen, Trash2, ShieldCheck, ShieldOff, Search } from 'lucide-react'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import CalendarHeatmap from '../../components/charts/CalendarHeatmap'
import HabitBreakdownChart from '../../components/charts/HabitBreakdownChart'
import { getUsers, getHabitsForUser, deleteUser as deleteUserStorage } from '../../utils/storage'
import { computeCompletion, computeStreak } from '../../utils/habitHelpers'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { startOfMonth } from 'date-fns'

function KPICard({ icon, label, value, color = 'text-brand-500' }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={color}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-navy font-heading">{value}</p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
      </div>
    </Card>
  )
}

export default function AdminDashboard() {
  const { user: currentUser, promoteUser } = useAuth()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [refresh, setRefresh] = useState(0)

  const users = useMemo(() => getUsers(), [refresh])
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(d => format(d, 'yyyy-MM-dd'))

  const allEntries = useMemo(() => users.flatMap(u => getHabitsForUser(u.id)), [refresh])

  const activeToday = users.filter(u => {
    const entries = getHabitsForUser(u.id)
    return entries.some(e => e.date === today)
  }).length

  const weeklyPcts = users.map(u => {
    const entries = getHabitsForUser(u.id).filter(e => weekDays.includes(e.date))
    if (!entries.length) return 0
    return Math.round(entries.reduce((s, e) => s + computeCompletion(e), 0) / entries.length)
  })
  const avgWeekly = weeklyPcts.length ? Math.round(weeklyPcts.reduce((a, b) => a + b, 0) / weeklyPcts.length) : 0

  const leaderboard = users.map((u, i) => ({
    ...u, weekPct: weeklyPcts[i],
    streak: computeStreak(getHabitsForUser(u.id)).current
  })).sort((a, b) => b.weekPct - a.weekPct)

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  function handleDelete(userId) {
    if (!confirm('Delete this user and all their data?')) return
    deleteUserStorage(userId)
    setRefresh(r => r + 1)
    addToast('User deleted')
  }

  function handleToggleRole(userId) {
    promoteUser(userId)
    setRefresh(r => r + 1)
    addToast('Role updated')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="font-heading font-bold text-2xl text-navy">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={<Users size={24}/>} label="Total Users" value={users.length} />
        <KPICard icon={<Activity size={24}/>} label="Active Today" value={activeToday} color="text-amber-400" />
        <KPICard icon={<BarChart2 size={24}/>} label="Avg Completion" value={`${avgWeekly}%`} />
        <KPICard icon={<BookOpen size={24}/>} label="Total Entries" value={allEntries.length} color="text-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-4">Leaderboard (This Week)</p>
          <div className="space-y-3">
            {leaderboard.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-300 w-5">{i+1}</span>
                <Avatar user={u} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy truncate">{u.name}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div className="bg-brand-500 h-1.5 rounded-full transition-all" style={{ width: `${u.weekPct}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-brand-500 ml-2">{u.weekPct}%</span>
                {u.streak > 0 && <span className="text-xs text-amber-400">🔥{u.streak}</span>}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-4">All-User Calendar (30d Avg)</p>
          <CalendarHeatmap entries={allEntries} month={startOfMonth(new Date())} />
        </Card>
      </div>

      <Card className="p-5">
        <p className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-4">Today's Habit Completion Rate</p>
        <HabitBreakdownChart entries={allEntries} />
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-400">User Management</p>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-48" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100">
                {['User','Role','Joined','This Week %','Actions'].map(h => (
                  <th key={h} className="pb-3 font-semibold pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const ue = getHabitsForUser(u.id).filter(e => weekDays.includes(e.date))
                const pct = ue.length ? Math.round(ue.reduce((s,e)=>s+computeCompletion(e),0)/ue.length) : 0
                return (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Avatar user={u} size="sm" />
                        <div>
                          <p className="font-medium text-navy">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={u.role === 'admin' ? 'admin' : 'default'}>{u.role}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    <td className="py-3 pr-4 font-semibold text-navy">{pct}%</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Link to={`/admin/user/${u.id}`}
                          className="text-xs text-brand-500 hover:text-brand-700 font-medium px-2 py-1 rounded-lg hover:bg-brand-50">
                          View
                        </Link>
                        {u.id !== currentUser.id && (
                          <>
                            <button onClick={() => handleToggleRole(u.id)}
                              className="text-xs text-gray-500 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50">
                              {u.role === 'admin' ? <ShieldOff size={14}/> : <ShieldCheck size={14}/>}
                            </button>
                            <button onClick={() => handleDelete(u.id)}
                              className="text-xs text-danger-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-danger-100">
                              <Trash2 size={14}/>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
