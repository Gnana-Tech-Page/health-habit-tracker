import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { Eye, EyeOff, User, Calendar, Clock } from 'lucide-react'
import { verifyPassword } from '../utils/crypto'

export default function Profile() {
  const { currentUser, updateUser, changePassword } = useAuth()
  const { addToast } = useToast()
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '')
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState('')
  const [loading, setLoading] = useState(false)

  function saveName(e) {
    e.preventDefault()
    if (!displayName.trim()) return
    updateUser(currentUser.id, { displayName: displayName.trim() })
    addToast('Profile updated')
  }

  async function savePassword(e) {
    e.preventDefault()
    setPwError('')
    const valid = await verifyPassword(pwForm.current, currentUser.passwordHash)
    if (!valid) { setPwError('Current password is incorrect.'); return }
    if (pwForm.next.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    setLoading(true)
    await changePassword(currentUser.id, pwForm.next)
    setLoading(false)
    setPwForm({ current: '', next: '', confirm: '' })
    addToast('Password changed successfully')
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="font-heading font-bold text-2xl text-white">Profile</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-700">
          <Avatar user={currentUser} size="lg" />
          <div>
            <p className="font-heading font-semibold text-white text-lg">{currentUser?.displayName}</p>
            <p className="text-slate-400 text-sm">@{currentUser?.username}</p>
            <Badge className="mt-1.5" variant={currentUser?.role === 'admin' ? 'admin' : 'user'}>{currentUser?.role}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { icon: <Calendar size={14}/>, label: 'Member since', val: currentUser?.createdAt ? format(parseISO(currentUser.createdAt),'MMM d, yyyy') : '—' },
            { icon: <Clock size={14}/>, label: 'Last login', val: currentUser?.lastLogin ? format(parseISO(currentUser.lastLogin),'MMM d, HH:mm') : 'This session' },
          ].map(({ icon, label, val }) => (
            <div key={label} className="bg-slate-700/40 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">{icon}{label}</div>
              <p className="text-sm font-medium text-slate-200">{val}</p>
            </div>
          ))}
        </div>
        <form onSubmit={saveName} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Display Name</label>
            <div className="flex gap-2">
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} required className="input-dark flex-1" />
              <button type="submit" className="btn-primary px-4 text-sm">Save</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
            <div className="input-dark bg-slate-700/50 text-slate-500 cursor-not-allowed select-none">
              @{currentUser?.username}
            </div>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="font-heading font-semibold text-white mb-4">Change Password</h3>
        <form onSubmit={savePassword} className="space-y-4">
          {[
            { key: 'current', label: 'Current Password', show: true },
            { key: 'next',    label: 'New Password' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(({ key, label, show }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={pwForm[key]}
                  onChange={e => setPwForm(p=>({...p,[key]:e.target.value}))} required
                  className="input-dark pr-11" />
                {show && (
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                )}
              </div>
            </div>
          ))}
          {pwError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{pwError}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </Card>
    </div>
  )
}
