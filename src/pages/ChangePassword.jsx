import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ChangePassword() {
  const { currentUser, changePassword } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If mustChangePassword is false, user shouldn't be here
  if (currentUser && !currentUser.mustChangePassword) {
    navigate('/dashboard', { replace: true })
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.next.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.next !== form.confirm) { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    await changePassword(currentUser.id, form.next)
    setLoading(false)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-2xl mb-4">
            <KeyRound className="text-amber-400" size={28} />
          </div>
          <h1 className="font-heading font-bold text-2xl text-white">Set New Password</h1>
          <p className="text-slate-400 mt-1 text-sm">You need to change your password before continuing.</p>
        </div>

        <div className="card-dark p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            {['next','confirm'].map(k => (
              <div key={k}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  {k === 'next' ? 'New Password' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} value={form[k]}
                    onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} required minLength={8}
                    className="input-dark pr-11"
                  />
                  {k === 'next' && (
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Saving…' : 'Set Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
