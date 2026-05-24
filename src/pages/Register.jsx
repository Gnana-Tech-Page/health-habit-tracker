import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  function validate() {
    if (!form.name.trim()) return 'Full name is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return null
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    const result = register(form.name.trim(), form.email.trim(), form.password)
    if (result.error) { setError(result.error); return }
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4 shadow-lg">
            <Leaf className="text-white" size={28} />
          </div>
          <h1 className="font-heading font-bold text-2xl text-navy">Create account</h1>
          <p className="text-gray-500 mt-1 text-sm">Start your health journey today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Jane Smith' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'jane@example.com' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input type={type} value={form[key]} onChange={e => update(key, e.target.value)} required placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
              </div>
            ))}
            {['password','confirm'].map(key => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {key === 'password' ? 'Password' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form[key]} onChange={e => update(key, e.target.value)} required
                    placeholder="••••••••" minLength={8}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
                  {key === 'password' && (
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {error && <div className="bg-danger-100 text-danger-500 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <button type="submit" className="w-full bg-brand-500 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors mt-2">
              Create Account
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-medium hover:text-brand-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
