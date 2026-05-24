import { useState, useMemo } from 'react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { UserPlus, Search, Eye, Pencil, KeyRound, Trash2, Check, X } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import { getHabitsForUser } from '../../utils/storage'
import { computeCompletion, getWeekEntries } from '../../utils/habitHelpers'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'
import CreateUserModal from './CreateUserModal'
import ResetPasswordModal from './ResetPasswordModal'
import UserDetailPanel from './UserDetailPanel'

function weekPct(userId) {
  const entries = getHabitsForUser(userId)
  const week = getWeekEntries(entries).filter(Boolean)
  return week.length ? Math.round(week.reduce((s,e)=>s+computeCompletion(e),0)/week.length) : 0
}

function isUserActive(user) {
  return user.lastLogin && differenceInDays(new Date(), parseISO(user.lastLogin)) <= 7
}

export default function UsersPanel() {
  const { currentUser, getAllUsers, updateUser, deleteUser } = useAuth()
  const { addToast } = useToast()
  const [refresh, setRefresh] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('username')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showCreate, setShowCreate] = useState(false)
  const [resetTarget, setResetTarget] = useState(null)
  const [detailUser, setDetailUser] = useState(null)

  const users = useMemo(() => getAllUsers(), [refresh])
  const adminCount = users.filter(u => u.role === 'admin').length
  const today = new Date().toISOString().slice(0,10)
  const activeToday = users.filter(u => {
    const e = getHabitsForUser(u.id)
    return e.some(x => x.date === today)
  }).length
  const newThisWeek = users.filter(u => differenceInDays(new Date(), parseISO(u.createdAt)) <= 7).length

  const filtered = useMemo(() => users
    .filter(u => {
      const q = search.toLowerCase()
      const matchSearch = !q || u.username.includes(q) || u.displayName.toLowerCase().includes(q)
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? isUserActive(u) : !isUserActive(u))
      return matchSearch && matchRole && matchStatus
    })
    .sort((a, b) => {
      if (sortBy === 'username') return a.username.localeCompare(b.username)
      if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'lastLogin') return (b.lastLogin || 0) > (a.lastLogin || 0) ? 1 : -1
      return 0
    }), [users, search, roleFilter, statusFilter, sortBy])

  function startEdit(user) {
    setEditingId(user.id)
    setEditForm({ displayName: user.displayName, role: user.role })
  }

  function saveEdit(userId) {
    if (!editForm.displayName.trim()) return
    updateUser(userId, { displayName: editForm.displayName.trim(), role: editForm.role })
    setEditingId(null)
    setRefresh(r => r+1)
    addToast('User updated')
  }

  function handleDelete(user) {
    if (user.id === currentUser.id) { addToast('Cannot delete your own account.', 'error'); return }
    if (user.role === 'admin' && adminCount <= 1) { addToast('Cannot delete the last admin.', 'error'); return }
    if (!confirm(`Delete @${user.username} and all their data?`)) return
    deleteUser(user.id)
    setDetailUser(null)
    setRefresh(r => r+1)
    addToast(`@${user.username} deleted`)
  }

  const statsCards = [
    { label: 'Total Users', val: users.length, color: 'text-sky-400' },
    { label: 'Active Today', val: activeToday, color: 'text-brand-500' },
    { label: 'New This Week', val: newThisWeek, color: 'text-amber-400' },
    { label: 'Admins', val: adminCount, color: 'text-violet-400' },
  ]

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map(c => (
          <div key={c.label} className="card-dark p-4">
            <p className={`text-2xl font-bold font-heading ${c.color}`}>{c.val}</p>
            <p className="section-label mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
              className="pl-8 pr-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 w-44" />
          </div>
          {[
            { label: 'Role', options: ['all','admin','user'], value: roleFilter, set: setRoleFilter },
            { label: 'Status', options: ['all','active','inactive'], value: statusFilter, set: setStatusFilter },
            { label: 'Sort', options: ['username','created','lastLogin'], value: sortBy, set: setSortBy },
          ].map(({ label, options, value, set }) => (
            <select key={label} value={value} onChange={e => set(e.target.value)}
              className="py-2 px-3 text-sm bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 capitalize">
              {options.map(o => <option key={o} value={o} className="capitalize">{o === 'all' ? `All ${label}s` : o}</option>)}
            </select>
          ))}
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
          <UserPlus size={15}/> Add User
        </button>
      </div>

      {/* Desktop table */}
      <div className="card-dark overflow-hidden hidden md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-700">
            <tr className="text-left">
              {['User','Role','Created','Last Login','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 section-label font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filtered.map(user => {
              const editing = editingId === user.id
              const active = isUserActive(user)
              return (
                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors animate-fade-in">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} size="sm"/>
                      <div>
                        {editing
                          ? <input value={editForm.displayName} onChange={e => setEditForm(p=>({...p,displayName:e.target.value}))}
                              className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white w-32 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                          : <p className="font-medium text-slate-200">{user.displayName}</p>}
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editing
                      ? <select value={editForm.role} onChange={e => setEditForm(p=>({...p,role:e.target.value}))}
                          className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500">
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      : <Badge variant={user.role === 'admin' ? 'admin' : 'user'}>{user.role}</Badge>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{format(parseISO(user.createdAt),'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{user.lastLogin ? format(parseISO(user.lastLogin),'MMM d, HH:mm') : 'Never'}</td>
                  <td className="px-4 py-3"><Badge variant={active ? 'active' : 'inactive'}>{active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {editing ? (
                        <>
                          <button onClick={() => saveEdit(user.id)} title="Save" className="p-1.5 rounded-lg text-brand-500 hover:bg-brand-500/10"><Check size={15}/></button>
                          <button onClick={() => setEditingId(null)} title="Cancel" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700"><X size={15}/></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setDetailUser(user)} title="View" className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10"><Eye size={15}/></button>
                          <button onClick={() => startEdit(user)} title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"><Pencil size={15}/></button>
                          <button onClick={() => setResetTarget(user)} title="Reset Password" className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10"><KeyRound size={15}/></button>
                          {user.id !== currentUser.id && !(user.role==='admin' && adminCount<=1) && (
                            <button onClick={() => handleDelete(user)} title="Delete" className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 size={15}/></button>
                          )}
                        </>
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

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filtered.map(user => (
          <div key={user.id} className="card-dark p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar user={user} size="sm"/>
                <div>
                  <p className="font-medium text-slate-200">{user.displayName}</p>
                  <p className="text-xs text-slate-500">@{user.username}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Badge variant={user.role === 'admin' ? 'admin' : 'user'}>{user.role}</Badge>
                <Badge variant={isUserActive(user) ? 'active' : 'inactive'}>{isUserActive(user) ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
              <button onClick={() => setDetailUser(user)} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1"><Eye size={13}/>View</button>
              <button onClick={() => startEdit(user)} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1"><Pencil size={13}/>Edit</button>
              <button onClick={() => setResetTarget(user)} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1"><KeyRound size={13}/>Reset PW</button>
            </div>
          </div>
        ))}
      </div>

      <CreateUserModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => setRefresh(r=>r+1)} />
      {resetTarget && (
        <ResetPasswordModal open={!!resetTarget} onClose={() => setResetTarget(null)}
          userId={resetTarget.id} username={resetTarget.username} />
      )}
      <UserDetailPanel
        user={detailUser}
        onClose={() => setDetailUser(null)}
        currentUserId={currentUser.id}
        onResetPassword={(u) => { setDetailUser(null); setResetTarget(u) }}
        onDelete={handleDelete}
      />
    </div>
  )
}
