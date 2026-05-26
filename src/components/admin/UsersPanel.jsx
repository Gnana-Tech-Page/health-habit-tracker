import { useState, useEffect, useMemo } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { format, differenceInDays } from 'date-fns'
import { Search, Eye, Shield, Ban, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'
import { db } from '../../firebase'

function ts(val) {
  if (!val) return 'Never'
  if (val?.toDate) return format(val.toDate(), 'MMM d, HH:mm')
  return format(new Date(val), 'MMM d, HH:mm')
}

function isActive(user) {
  if (!user.lastLogin) return false
  const d = user.lastLogin?.toDate ? user.lastLogin.toDate() : new Date(user.lastLogin)
  return differenceInDays(new Date(), d) <= 7
}

export default function UsersPanel() {
  const { currentUser, toggleUserRole, setUserDisabled } = useAuth()
  const { addToast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [busy, setBusy] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setUsers(snap.docs.map(d => ({ ...d.data(), uid: d.id })))
      setLoading(false)
    }, err => { console.error(err); setLoading(false) })
    return unsub
  }, [])

  const adminCount = users.filter(u => u.role === 'admin').length

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users
      .filter(u => {
        const matchSearch = !q || u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
        const matchRole = roleFilter === 'all' || u.role === roleFilter
        return matchSearch && matchRole
      })
      .sort((a, b) => {
        if (sortBy === 'name') return (a.displayName || '').localeCompare(b.displayName || '')
        if (sortBy === 'lastLogin') {
          const ta = a.lastLogin?.toDate?.() ?? new Date(a.lastLogin ?? 0)
          const tb = b.lastLogin?.toDate?.() ?? new Date(b.lastLogin ?? 0)
          return tb - ta
        }
        if (sortBy === 'created') {
          const ta = a.createdAt?.toDate?.() ?? new Date(a.createdAt ?? 0)
          const tb = b.createdAt?.toDate?.() ?? new Date(b.createdAt ?? 0)
          return tb - ta
        }
        return 0
      })
  }, [users, search, roleFilter, sortBy])

  async function handleToggleRole(user) {
    if (user.role === 'admin' && adminCount <= 1) {
      addToast('Cannot remove the last admin.', 'error'); return
    }
    setBusy(user.uid)
    try {
      const newRole = await toggleUserRole(user.uid)
      addToast(`${user.displayName} is now ${newRole}`)
    } catch { addToast('Failed to update role.', 'error') }
    finally { setBusy(null) }
  }

  async function handleToggleDisabled(user) {
    if (user.uid === currentUser.uid) { addToast('Cannot disable your own account.', 'error'); return }
    setBusy(user.uid)
    try {
      await setUserDisabled(user.uid, !user.disabled)
      addToast(user.disabled ? `${user.displayName} re-enabled` : `${user.displayName} disabled`)
    } catch { addToast('Failed to update status.', 'error') }
    finally { setBusy(null) }
  }

  const statsCards = [
    { label: 'Total Users',  val: users.length,                                           color: 'text-sky-400' },
    { label: 'Active (7d)',  val: users.filter(isActive).length,                          color: 'text-brand-500' },
    { label: 'New This Week',val: users.filter(u => {
        const d = u.createdAt?.toDate?.() ?? new Date(u.createdAt ?? 0)
        return differenceInDays(new Date(), d) <= 7
      }).length,                                                                            color: 'text-amber-400' },
    { label: 'Admins',       val: adminCount,                                              color: 'text-violet-400' },
  ]

  if (loading) return <div className="text-center py-12 text-slate-400">Loading users…</div>

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map(c => (
          <div key={c.label} className="card-dark p-4">
            <p className={`text-2xl font-bold font-heading ${c.color}`}>{c.val}</p>
            <p className="section-label mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            className="pl-8 pr-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 w-44" />
        </div>
        {[
          { label: 'Role', options: ['all','admin','user'], value: roleFilter, set: setRoleFilter },
          { label: 'Sort', options: ['name','lastLogin','created'], value: sortBy, set: setSortBy },
        ].map(({ label, options, value, set }) => (
          <select key={label} value={value} onChange={e => set(e.target.value)}
            className="py-2 px-3 text-sm bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500">
            {options.map(o => (
              <option key={o} value={o}>{o === 'all' ? `All ${label}s` : o.charAt(0).toUpperCase() + o.slice(1)}</option>
            ))}
          </select>
        ))}
      </div>

      {/* Desktop table */}
      <div className="card-dark overflow-hidden hidden md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-700">
            <tr className="text-left">
              {['User','Email','Role','Last Login','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 section-label font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filtered.map(user => {
              const active = isActive(user)
              const isbusy = busy === user.uid
              return (
                <tr key={user.uid} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} size="sm"/>
                      <p className="font-medium text-slate-200">{user.displayName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'admin' ? 'admin' : 'user'}>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{ts(user.lastLogin)}</td>
                  <td className="px-4 py-3">
                    {user.disabled
                      ? <Badge variant="inactive">Disabled</Badge>
                      : <Badge variant={active ? 'active' : 'inactive'}>{active ? 'Active' : 'Inactive'}</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/user/${user.uid}`} title="View"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10">
                        <Eye size={15}/>
                      </Link>
                      <button onClick={() => handleToggleRole(user)} title="Toggle Role" disabled={isbusy}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 disabled:opacity-40">
                        <Shield size={15}/>
                      </button>
                      {user.uid !== currentUser.uid && (
                        <button onClick={() => handleToggleDisabled(user)}
                          title={user.disabled ? 'Enable' : 'Disable'} disabled={isbusy}
                          className={`p-1.5 rounded-lg disabled:opacity-40 ${user.disabled ? 'text-brand-500 hover:bg-brand-500/10' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}>
                          {user.disabled ? <CheckCircle size={15}/> : <Ban size={15}/>}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-8 text-sm">No users match your filters.</p>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(user => {
          const active = isActive(user)
          const isbusy = busy === user.uid
          return (
            <div key={user.uid} className="card-dark p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar user={user} size="sm"/>
                  <div>
                    <p className="font-medium text-slate-200">{user.displayName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge variant={user.role === 'admin' ? 'admin' : 'user'}>{user.role}</Badge>
                  <Badge variant={user.disabled ? 'inactive' : (active ? 'active' : 'inactive')}>
                    {user.disabled ? 'Disabled' : (active ? 'Active' : 'Inactive')}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                <Link to={`/admin/user/${user.uid}`} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1">
                  <Eye size={13}/>View
                </Link>
                <button onClick={() => handleToggleRole(user)} disabled={isbusy}
                  className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1 disabled:opacity-40">
                  <Shield size={13}/>Role
                </button>
                {user.uid !== currentUser.uid && (
                  <button onClick={() => handleToggleDisabled(user)} disabled={isbusy}
                    className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1 disabled:opacity-40">
                    {user.disabled ? <><CheckCircle size={13}/>Enable</> : <><Ban size={13}/>Disable</>}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
