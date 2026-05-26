import { useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserDetail from './pages/admin/UserDetail'
import { HabitProvider } from './context/HabitContext'
import { Activity } from 'lucide-react'

function Splash() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 bg-sky-500/20 border border-sky-500/30 rounded-2xl flex items-center justify-center">
        <Activity className="text-sky-400" size={24} />
      </div>
      <div className="w-7 h-7 border-t-sky-400 border-slate-700 rounded-full animate-spin" style={{borderWidth:'3px',borderTopColor:'#38bdf8'}}/>
    </div>
  )
}

function RequireAuth({ adminOnly = false }) {
  const { currentUser, loading } = useAuth()
  if (loading) return <Splash />
  if (!currentUser || currentUser._disabled) return <Navigate to="/login" replace />
  if (adminOnly && currentUser.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <HabitProvider>
      <div className="flex h-screen bg-slate-900 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onMenuToggle={() => setSidebarOpen(s => !s)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
            <Outlet />
          </main>
          <BottomNav />
        </div>
      </div>
    </HabitProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history"   element={<History />} />
          <Route path="/profile"   element={<Profile />} />
          <Route element={<RequireAuth adminOnly />}>
            <Route path="/admin"              element={<AdminDashboard />} />
            <Route path="/admin/users"        element={<AdminDashboard />} />
            <Route path="/admin/user/:userId" element={<UserDetail />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
