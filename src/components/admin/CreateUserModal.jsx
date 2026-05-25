import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/
const EMPTY = { username: '', displayName: '', password: '', confirm: '', role: 'user' }

export default function CreateUserModal({ open, onClose, onCreated }) {
  const { createUser } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset form every time the modal opens so stale values from a previous
  // attempt don't carry over (Modal keeps the component mounted when closed)
  useEffect(() => {
    if (open) { setForm(EMPTY); setError('') }
  }, [open])

  function update(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!USERNAME_RE.test(form.username)) { setError('Username must be 3–20 chars: lowercase letters, numbers, underscores only.'); return }
    if (!form.displayName.trim()) { setError('Display name is required.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const result = await createUser({ username: form.username, displayName: form.displayName, password: form.password, role: form.role })
    setLoading(false)
    if (result.error) { setError(result.error); return }
    addToast(`User @${form.username} created successfully`)
    onCreated?.()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
            <input value={form.username} onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="john_doe" maxLength={20} autoComplete="off" className="input-dark" />
            <p className="text-xs text-slate-600 mt-1">3-20 chars, lowercase, _ allowed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Display Name</label>
            <input value={form.displayName} onChange={e => update('displayName', e.target.value)}
              placeholder="John Doe" autoComplete="off" className="input-dark" />
          </div>
        </div>
        {/* Stacked vertically so users can't accidentally type into the wrong field */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Password <span className="text-slate-500 font-normal">(min 8 characters)</span>
          </label>
          <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
            placeholder="••••••••" autoComplete="new-password" className="input-dark" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
          <input type="password" value={form.confirm} onChange={e => update('confirm', e.target.value)}
            placeholder="••••••••" autoComplete="new-password" className="input-dark" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
          <div className="flex gap-3">
            {['user','admin'].map(r => (
              <button key={r} type="button" onClick={() => update('role', r)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors capitalize ${form.role === r ? 'bg-sky-500/20 border-sky-500/50 text-sky-300' : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
