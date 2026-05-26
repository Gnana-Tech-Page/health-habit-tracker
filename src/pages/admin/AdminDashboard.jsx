import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Users, Activity, Shield, UserCheck } from 'lucide-react'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import UsersPanel from '../../components/admin/UsersPanel'
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

function isActive(user) {
  if (!user.lastLogin) return false
  const d = user.lastLogin?.toDate ? user.lastLogin.toDate() : new Date(user.lastLogin)
  return differenceInDays(new Date(), d) <= 7
}

export default function AdminDashboard() {
  const { getAllUsers } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const isUsersTab = location.pathname === '/admin/users'

  useEffect(() => {
    if (isUsersTab) return
    getAllUsers().then(list => { setUsers(list); setLoading(false) }).catch(() => setLoading(false))
  }, [isUsersTab])

  const adminCount   = users.filter(u => u.role === 'admin').length
  const activeCount  = users.filter(isActive).length
  const newThisWeek  = users.filter(u => {
    const d = u.createdAt?.toDate?.() ?? new Date(u.createdAt ?? 0)
    return differenceInDays(new Date(), d) <= 7
  }).length

  const leaderboard = [...users].sort((a, b) => (b.loginCount ?? 0) - (a.loginCount ?? 0)).slice(0, 8)

  const tabs = [
    { label: 'Overview', path: '/admin' },
    { label: 'Users',    path: '/admin/users' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-white">Admin Dashboard</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              (tab.path === '/admin/users' ? isUsersTab : !isUsersTab)
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {isUsersTab ? (
        <UsersPanel />
      ) : loading ? (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard icon={<Users size={24}/>}     label="Total Users"   value={users.length}  color="text-sky-400" />
            <KPICard icon={<Activity size={24}/>}  label="Active (7d)"   value={activeCount}   color="text-brand-500" />
            <KPICard icon={<UserCheck size={24}/>} label="New This Week" value={newThisWeek}   color="text-amber-400" />
            <KPICard icon={<Shield size={24}/>}    label="Admins"        value={adminCount}    color="text-violet-400" />
          </div>

          {/* Top users by login count */}
          <Card className="p-5">
            <p className="section-label mb-4">Most Active Users (by login count)</p>
            {leaderboard.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No users yet</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((u, i) => (
                  <Link to={`/admin/user/${u.uid}`} key={u.uid}
                    className="flex items-center gap-3 group hover:bg-slate-700/40 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
                    <span className="text-sm font-bold text-slate-500 w-5">{i + 1}</span>
                    <Avatar user={u} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white">{u.displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-500">{u.loginCount ?? 0}</p>
                      <p className="text-xs text-slate-600">logins</p>
                    </div>
                    {isActive(u) && <span className="text-xs text-brand-500 font-medium">Active</span>}
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Users summary table */}
          <Card className="p-5">
            <p className="section-label mb-4">All Users — Quick View</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-700">
                    {['User','Email','Role','Last Login','Status'].map(h => (
                      <th key={h} className="pb-2 pr-4 section-label">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const active = isActive(u)
                    const lastLogin = u.lastLogin?.toDate
                      ? format(u.lastLogin.toDate(), 'MMM d')
                      : u.lastLogin ? format(new Date(u.lastLogin), 'MMM d') : 'Never'
                    return (
                      <tr key={u.uid} className="border-b border-slate-700/40 hover:bg-slate-700/20">
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <Avatar user={u} size="xs"/>
                            <span className="text-slate-200">{u.displayName}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4 text-slate-400 text-xs">{u.email}</td>
                        <td className="py-2 pr-4">
                          <span className={`text-xs font-medium ${u.role === 'admin' ? 'text-violet-400' : 'text-slate-400'}`}>{u.role}</span>
                        </td>
                        <td className="py-2 pr-4 text-slate-500 text-xs">{lastLogin}</td>
                        <td className="py-2 text-xs">
                          {u.disabled
                            ? <span className="text-red-400">Disabled</span>
                            : <span className={active ? 'text-brand-500' : 'text-slate-500'}>{active ? 'Active' : 'Inactive'}</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
