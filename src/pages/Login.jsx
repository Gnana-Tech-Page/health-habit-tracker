import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"/>
    </svg>
  )
}

export default function Login() {
  const { signInWithGoogle, currentUser, loading } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy]     = useState(false)
  const [error, setError]   = useState('')

  // Redirect as soon as auth resolves
  useEffect(() => {
    if (loading) return
    if (!currentUser) return
    if (currentUser._disabled) {
      setError('Your account has been disabled. Contact your administrator.')
      return
    }
    navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
  }, [currentUser, loading])

  async function handleSignIn() {
    setError('')
    setBusy(true)
    try {
      await signInWithGoogle()
      // Navigation handled by the useEffect above
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled.')
      } else {
        setError('Something went wrong. Please try again.')
        console.error(err)
      }
    } finally {
      setBusy(false)
    }
  }

  // Full-screen splash while Firebase resolves auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 bg-sky-500/20 border border-sky-500/30 rounded-2xl flex items-center justify-center">
          <Activity className="text-sky-400" size={24} />
        </div>
        <div className="w-7 h-7 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" style={{borderWidth:'3px'}}/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dot-grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500/20 border border-sky-500/30 rounded-2xl mb-4 shadow-lg shadow-sky-500/10">
            <Activity className="text-sky-400" size={32} />
          </div>
          <h1 className="font-heading font-bold text-3xl text-white">HealthTrack</h1>
          <p className="text-slate-400 mt-1.5 text-sm">Your personal health habit tracker</p>
        </div>

        <div className="card-dark p-8 shadow-2xl shadow-black/40 space-y-5">
          <div className="text-center">
            <p className="text-slate-300 text-sm font-medium mb-1">Welcome back</p>
            <p className="text-slate-500 text-sm">Sign in with your Google account to continue</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm px-5 py-3 rounded-xl border border-gray-200 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <GoogleLogo />
            )}
            {busy ? 'Signing in…' : 'Sign in with Google'}
          </button>

          <p className="text-center text-xs text-slate-600 pt-1">
            Your data is securely stored in the cloud and syncs across all your devices.
          </p>
        </div>
      </div>
    </div>
  )
}
