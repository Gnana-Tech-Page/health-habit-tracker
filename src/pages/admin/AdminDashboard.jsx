import { useMemo } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth } from 'date-fns'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Users, Activity, BarChart2, BookOpen } from 'lucide-react'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import CalendarHeatmap from '../../components/charts/CalendarHeatmap'
import HabitBreakdownChart from '../../components/charts/HabitBreakdownChart'
import UsersPanel from '../../components/admin/UsersPanel'
import { getHabitsForUser } from '../../utils/storage'
import { computeCompletion, computeStreak } from '../../utils/habitHelpers'
import { useAuth } from '../../context/AuthContext'

function KPICard({ icon, label, value, color = 'text-brand-500' }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={color}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white font-heading">{value}</p>
        <p className="section-label mt-0.5">{label}</p>
      </div>
    </Card>
  )
}

export default function AdminDashboard() {
  const { getAllUsers } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isUsersTab = location.pathname === '/admin/users'

  const users = useMemo(() => getAllUsers(), [])
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(d => format(d, 'yyyy-MM-dd'))

  const allEntries = useMemo(() => users.flatMap(u => getHabitsForUser(u.id)), [users])

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

  const tabs = [
    { label: 'Overview', path: '/admin' },
    { label: 'Users', path: '/admin/users' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-white">Admin Dashboard</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              (tab.path === '/admin/users' ? isUsersTab : !isUsersTab)
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isUsersTab ? (
        <UsersPanel />
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard icon={<Users size={24}/>} label="Total Users" value={users.length} color="text-sky-400" />
            <KPICard icon={<Activity size={24}/>} label="Active Today" value={activeToday} color="text-brand-500" />
            <KPICard icon={<BarChart2 size={24}/>} label="Avg Completion" value={`${avgWeekly}%`} color="text-amber-400" />
            <KPICard icon={<BookOpen size={24}/>} label="Total Entries" value={allEntries.length} color="text-violet-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leaderboard */}
            <Card className="p-5">
              <p className="section-label mb-4">Leaderboard (This Week)</p>
              <div className="space-y-3">
                {leaderboard.map((u, i) => (
                  <Link to={`/admin/user/${u.id}`} key={u.id}
                    className="flex items-center gap-3 group hover:bg-slate-700/40 rounded-lg px-2 py-1 -mx-2 transition-colors">
                    <span className="text-sm font-bold text-slate-500 w-5">{i + 1}</span>
                    <Avatar user={u} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white">{u.displayName}</p>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                        <div className="bg-brand-500 h-1.5 rounded-full transition-all" style={{ width: `${u.weekPct}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-brand-500 ml-2">{u.weekPct}%</span>
                    {u.streak > 0 && <span className="text-xs text-amber-400">🔥{u.streak}</span>}
                  </Link>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No entries this week</p>
                )}
              </div>
            </Card>

            {/* All-user heatmap */}
            <Card className="p-5">
              <p className="section-label mb-4">All-User Calendar (This Month)</p>
              <CalendarHeatmap entries={allEntries} month={startOfMonth(new Date())} />
            </Card>
          </div>

          {/* Habit breakdown */}
          <Card className="p-5">
            <p className="section-label mb-4">Today's Habit Completion Rate</p>
            <HabitBreakdownChart entries={allEntries} />
          </Card>
        </>
      )}
    </div>
  )
}
