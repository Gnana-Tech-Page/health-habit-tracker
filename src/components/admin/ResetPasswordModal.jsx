import { useState } from 'react'
import Modal from '../ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'

export default function ResetPasswordModal({ open, onClose, userId, username }) {
  const { changePassword, updateUser } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState({ next: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.next.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.next !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    await changePassword(userId, form.next)
    updateUser(userId, { mustChangePassword: true })
    setLoading(false)
    addToast(`Password reset for @${username}`)
    setForm({ next: '', confirm: '' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Reset Password — @${username}`}>
      <p className="text-sm text-slate-400 mb-4">
        User will be required to change this password on next login.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
          <input type="password" value={form.next} onChange={e => setForm(p => ({...p, next: e.target.value}))}
            placeholder="Min 8 characters" className="input-dark" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
          <input type="password" value={form.confirm} onChange={e => setForm(p => ({...p, confirm: e.target.value}))}
            placeholder="••••••••" className="input-dark" />
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving…' : 'Reset Password'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
