import { useState } from 'react'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { Eye, EyeOff } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { addToast } = useToast()
  const [name, setName] = useState(user?.name || '')
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState('')

  function saveName(e) {
    e.preventDefault()
    if (!name.trim()) return
    updateUser({ name: name.trim(), avatar: name.trim().split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2) })
    addToast('Profile updated')
  }

  function savePassword(e) {
    e.preventDefault()
    setPwError('')
    if (btoa(form.current) !== user.password) { setPwError('Current password is incorrect.'); return }
    if (form.next.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (form.next !== form.confirm) { setPwError('Passwords do not match.'); return }
    updateUser({ password: btoa(form.next) })
    setForm({ current: '', next: '', confirm: '' })
    addToast('Password changed')
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="font-heading font-bold text-2xl text-navy">Profile</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar user={user} size="lg" />
          <div>
            <p className="font-semibold text-navy">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${user?.role==='admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-brand-50 text-brand-700'}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <form onSubmit={saveName} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <button type="submit" className="bg-brand-500 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
            Save Name
          </button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-navy mb-4">Change Password</h3>
        <form onSubmit={savePassword} className="space-y-4">
          {[
            { key: 'current', label: 'Current Password' },
            { key: 'next', label: 'New Password' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form[key]}
                  onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                {key === 'current' && (
                  <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                )}
              </div>
            </div>
          ))}
          {pwError && <div className="bg-danger-100 text-danger-500 text-sm px-4 py-3 rounded-xl">{pwError}</div>}
          <button type="submit" className="bg-brand-500 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
            Update Password
          </button>
        </form>
      </Card>
    </div>
  )
}
