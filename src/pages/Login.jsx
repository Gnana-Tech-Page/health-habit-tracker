import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Activity } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, currentUser } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const wasMigrated = localStorage.getItem('hht_migrated') === 'true'

  // Redirect as soon as currentUser is set in context — avoids timing issues
  // where navigate() fires before React flushes the setCurrentUser state update
  useEffect(() => {
    if (!currentUser) return
    if (currentUser.mustChangePassword) {
      navigate('/change-password', { replace: true })
    } else {
      navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    }
  }, [currentUser])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password) { setError('Please enter your username and password.'); return }
    setError('')
    setLoading(true)
    try {
      const result = await login(username.trim(), password)
      if (result.error) { setError(result.error) }
      // Successful login: navigation handled by the useEffect above
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-500/20 border border-sky-500/30 rounded-2xl mb-4 shadow-lg shadow-sky-500/10">
            <Activity className="text-sky-400" size={28} />
          </div>
          <h1 className="font-heading font-bold text-2xl text-white">HealthTrack</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your account</p>
        </div>

        {wasMigrated && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm px-4 py-3 rounded-xl">
            Your account has been upgraded. Log in and set a new password if prompted.
          </div>
        )}

        <div className="card-dark p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                type="text" value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                placeholder="your_username" autoFocus autoComplete="username"
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="input-dark pr-11"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-800" />
              <span className="text-sm text-slate-400">Remember me</span>
            </label>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full text-center">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Signing in…</span> : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-xs text-slate-600 mt-6">
            New user? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
